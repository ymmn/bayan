var app = angular.module('BayanGameApp', []);

app.directive('sheetMusic', function() {
  return {
    restrict: 'E',
    templateUrl: 'views/sheet-music.html',
    controller: ['$scope', '$window', '$interval',
      function($scope, $window, $interval) {

        var firstBeatAt,
            pressedKey,
            songPlayer,
            SHEET_MUSIC_DIR = 'song-sheets',
            OFFSET_IN_PIXELS = 100;

        $scope.beatWidth = 50;
        $scope.sheetIndex = 0;
        $scope.sheetX = 0;
        $scope.sheetMusic = [];

        var reloadSong = function() {
          var song = $scope.song;

          if (!song) return;

          $.get(SHEET_MUSIC_DIR + '/' + song.filename).success(function(abcSong) {
            var octave = 5;
            if (abcSong.octave) {
              octave = abcSong.octave;
            }
            window.curOctave = octave;

            $scope.bpm = abcSong.bpm;
            $scope.isPlaying = false;
            $scope.sheetMusic = window.makeSheetMusic(abcSong, octave);

            songPlayer = window.SongPlayer(
              abcSong,
              // TODO(abdul) copy pasted from bayan.js
              {
                noteOn: function(note) {
                  MIDI.noteOn(1, note, 127) ;
                },
                noteOff: function(note) {
                  MIDI.noteOff(1, note, 127) ;
                }
              }
            );

            $scope.sheetMusic.map(function(a) {
              a.width *= $scope.beatWidth;
              a.width -= 5;
              a.x *= $scope.beatWidth;
              a.x += OFFSET_IN_PIXELS;
            });
            $scope.$apply();
          });
        };

        var calculateBeatIndex = function() {
          var t = (new Date()).getTime();
          if (firstBeatAt === null) {
            firstBeatAt = t;
            return 0;
          } else {
            t -= firstBeatAt;
            return (t / (60000 / $scope.bpm));
          }
        };

        var tick = function() {
          if (!$scope.isPlaying) {
            return;
          }
          var curBeat = calculateBeatIndex();
          songPlayer.tick(curBeat);

          $scope.sheetX = -1 * (curBeat * $scope.beatWidth);
          for (var i = 0; i < $scope.sheetMusic.length; i++) {
            var note = $scope.sheetMusic[i];
            var absPos = $scope.sheetX + note.x;
            note.isNow = (absPos <= 105 && (absPos + note.width) >= 100);
            note.passed = note.passed || (note.isNow && note.char === pressedKey);
          }
        };

        $scope.play = function() {
          firstBeatAt = null;
          $scope.isPlaying = true;
        };

        $window.onkeydown = function(e) {
          var c = Bayan.keyForEvent(e);
          pressedKey = c;
        };

        $window.onkeyup = function(e) {
          var c = Bayan.keyForEvent(e);
          pressedKey = null;
        };

        $.get('directory.json').success(function(songs) {
          $scope.songs = songs;
          $scope.song = songs[0];
        });

        $scope.$watch('song', reloadSong);
        $scope.$watch('bpm', reloadSong);

        $interval(tick, 30);
      }
    ]
  };
});
