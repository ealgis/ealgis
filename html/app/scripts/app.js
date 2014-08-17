'use strict';

angular
  .module('ealgisApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'restangular'
  ])
  .config(function ($routeProvider, $locationProvider, RestangularProvider) {
    RestangularProvider.setBaseUrl('/api/0.1');
    RestangularProvider.addResponseInterceptor(function(data, operation) {
      // .. to look for getList operations
      if (operation === 'getList') {
        // .. and handle the data and meta data
        return data.objects;
      }
      return data;
    });

    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/maps/:mapname', {
        templateUrl: 'views/map.html',
        controller: 'MapCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
    $locationProvider.html5Mode(true);
  });
