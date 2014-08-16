'use strict';

angular.module('ealgisApp')
  .controller('MainCtrl', function ($scope, Restangular) {
    $scope.maps = Restangular.all('maps').getList().$object;
    console.log($scope.maps);
  });
