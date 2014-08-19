'use strict';

angular
  .module('ealgisApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'restangular',
    'ui.bootstrap'
  ])
  .config(function ($routeProvider, $locationProvider, RestangularProvider) {
    RestangularProvider.setBaseUrl('/api/v2');
    RestangularProvider.addResponseInterceptor(function(data, operation) {
      // .. to look for getList operations
      if (operation === 'getList') {
        // .. and handle the data and meta data
        return data.objects;
      } else {
        var extracted = data.object;
        if (extracted) {
          extracted.meta = data.meta;        
        }
        return extracted;
      }
    });
    RestangularProvider.setErrorInterceptor(function(response, deferred, responseHandler) {
      console.log('>> error', response);
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
      .when('/about', {
        templateUrl: 'views/about.html'
      })
      .otherwise({
        redirectTo: '/'
      });
    $locationProvider.html5Mode(true);
  });
