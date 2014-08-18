'use strict';

angular.module('ealgisApp')
  .controller('MapCtrl', function ($scope, $routeParams, Restangular) {
    var mapname = $routeParams.mapname;
    Restangular.one('maps', mapname).get().then(function(obj) {
        $scope.name = mapname;
        $scope.map = obj;
        console.log(obj);
        obj.save().then(function() {
            console.log('saved?');
        });
    });
  });
