var app = angular.module('BayanGameApp', []);

app.directive('sheetMusic', function() {
  return {
    restrict: 'E',
    templateUrl: 'views/sheet-music.html',
    controller: ['$scope', '$window', '$interval',
      function($scope, $window, $interval) {

        $scope.beatWidth = 50;
        $.get('mario.abc').success(function(abcSong) {
          $scope.sheetMusic = window.makeSheetMusic(abcSong);
          $scope.sheetMusic.map(function(a) {
            a.width *= $scope.beatWidth;
            a.width -= 5;
            a.x *= $scope.beatWidth;
            a.x += 200;
          })
          $scope.$apply();
        });
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
        var bpm = 120;
        var calculateBeatIndex = function() {
          var t = (new Date()).getTime();
          if (firstBeatAt === null) {
            firstBeatAt = t;
            return 0;
          } else {
            t -= firstBeatAt;
            return (t / (60000 / bpm));
          }
        };

        $interval(function() {
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
