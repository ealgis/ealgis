'use strict';

/**
 * @ngdoc function
 * @name htmlApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the htmlApp
 */
angular.module('htmlApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
