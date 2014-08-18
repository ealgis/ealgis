'use strict';

angular.module('ealgisApp')
  .controller('SessionCtrl', function(Restangular, $scope, $http) {
    var refresh_user = function() {
        Restangular.one('userinfo').get().then(function(ui) {
            $scope.logged_in = ui.meta.status === 'OK';
            $scope.user_info = null;
            if ($scope.logged_in) {
                $scope.user_info = ui;
            }
        });
    };
    navigator.id.watch({
        onlogin: function(assertion) {
            $http({
                method: 'POST',
                url: '/api/0.1/login',
                data: $.param({assertion: assertion}),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function() {
                $scope.logging_in = false;
                refresh_user();
            }).error(function() {
                $scope.logging_in = false;
                refresh_user();
            });  
        },
        onlogout: function() {
            $http.post('/api/0.1/logout').then(function() {
                refresh_user();
            });
        }
    });

    $scope.login = function() {
        $scope.logging_in = true;
        navigator.id.request();
    };
    $scope.logout = function() {
        navigator.id.logout();
    };

    // on first controller init, see if we're logged in
    refresh_user();
  })
  .directive('ealLogin', function() {
    return {
        restrict: 'E',
        templateUrl: 'views/login.html'
    };
  })
  .filter('ealFirstName', function() {
    return function(data) {
        if (data) {
            return data.split(' ')[0];    
        }
        return '';
    };
  });
