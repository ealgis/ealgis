'use strict';

angular.module('ealgisApp')
  .controller('MapCtrl', function ($scope, Restangular) {
    $scope.maps = Restangular.all('maps').getList().$object;
  });
