var app = angular.module('BayanGameApp', []);

app.directive('sheetMusic', function() {
  return {
    restrict: 'E',
    templateUrl: 'views/sheet-music.html',
    controller: ['$scope', '$window', '$interval',
      function($scope, $window, $interval) {

        $scope.beatWidth = 50;
        $.get('directory.json').success(function(songs) {
          $scope.songs = songs;
        });

        var reloadSong = function() {
          var song = $scope.song;

          if (!song) return;

          if (song.bpm !== undefined) {
            $scope.bpm = song.bpm;
          }

          $.get(song.filename).success(function(abcSong) {
            $scope.isPlaying = false;
            $scope.abcSong = abcSong;
            $scope.sheetMusic = window.makeSheetMusic(abcSong);
            $scope.sheetMusic.map(function(a) {
              a.width *= $scope.beatWidth;
              a.width -= 5;
              a.x *= $scope.beatWidth;
              a.x += 200;
            });
            $scope.$apply();
          });
        };

        $scope.$watch('song', reloadSong);
        $scope.$watch('bpm', reloadSong);

        $scope.play = function() {
          firstBeatAt = null;
          $scope.isPlaying = true;
        };

        $scope.sheetIndex = 0;
        $scope.sheetX = 0;
        $scope.sheetMusic = [];

        var pressedKey = null;
        $window.onkeydown = function(e) {
          var c = Bayan.keyForEvent(e);
          pressedKey = c;
        };

        $window.onkeyup = function(e) {
          var c = Bayan.keyForEvent(e);
          pressedKey = null;
        };

        var firstBeatAt = null;
        $scope.bpm = 190;
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

        $interval(function() {
          if (!$scope.isPlaying) {
            return;
          }
          var curBeat = calculateBeatIndex();
          $scope.sheetX = -1 * (curBeat * $scope.beatWidth);
          for (var i = 0; i < $scope.sheetMusic.length; i++) {
            var note = $scope.sheetMusic[i];
            var absPos = $scope.sheetX + note.x;
            note.isNow = (absPos <= 105 && (absPos + note.width) >= 100);
            note.passed = note.passed || (note.isNow && note.char === pressedKey);
          }
        }, 30);

      }
    ]
  };
});
