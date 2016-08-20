'use strict';

angular.module('mol.controllers',[]);

angular.module('mol.datasets', [
  'ui.router',
  //'ui-leaflet',
  'uiGmapgoogle-maps',
  'pascalprecht.translate',
  'angular-loading-bar',
  'angular.filter',
  'ngResource',
  'ngSanitize',
  'ngCookies',
  'ngAnimate',
  'ui.bootstrap',
  'mol.ui-map',
  'mol.api',
  'mol.facets',
  'mol.services',
  'mol.loading-indicator',
  'mol.controllers',
])
.constant('molConfig',{
    module : 'datasets', //module name (used in routing)
    api : '0.x',
    //base : angular.element('#mol-asset-base').attr('content'), //static assets base
    //url :  angular.element('#mol-url').attr('content'),
    lang : angular.element('#mol-lang').attr('content'),
    //region : angular.element('#mol-region').attr('content'),
    prod:(window.location.hostname!=='localhost') //boolean for MOL production mode
})
.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = false;
    cfpLoadingBarProvider.includeBar = false;
    cfpLoadingBarProvider.latencyThreshold = 500;
  }])
.config(['$translateProvider','molConfig', function($translateProvider,molConfig) {
  if(molConfig.lang) {
    $translateProvider.preferredLanguage(molConfig.lang)
  } else {
    $translateProvider.determinePreferredLanguage()
  }
  $translateProvider.registerAvailableLanguageKeys([
      'en','fr','es','pt','de','zh' ///should move to meta-tag config or api call
  ]);
}])
.config(['uiGmapGoogleMapApiProvider','$translateProvider',
	function(uiGmapGoogleMapApiProvider,$translateProvider) {
    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyABlkTTWW1KD6TrmFF_X6pjWrFMGgmpp9g',
        v: '3.24', //defaults to latest 3.X anyhow
        libraries: 'weather,geometry,visualization',
        language: $translateProvider.preferredLanguage()

    });
}])
.config(['$httpProvider', '$locationProvider', '$sceDelegateProvider', '$urlRouterProvider', '$stateProvider',
    function($httpProvider, $locationProvider, $sceDelegateProvider, $urlRouterProvider, $stateProvider) {
  $httpProvider.defaults.useXDomain = true;
  $httpProvider.defaults.withCredentials = false;
  $locationProvider.html5Mode(true);
  $sceDelegateProvider.resourceUrlWhitelist([
    'self',
    'http:*//localhost**',
    'http*://127.0.0.1:9001/**',
    'http*://*mol.org/**',
    'http*://api.mol.org/1.0/datasets/**',
    'http*://api.mol.org/0.x/datasets/**',
    'http*://mapoflife.github.io/**',
  ]);
  $urlRouterProvider.otherwise('/');
  $stateProvider
    .state(
      'datasets', {
        abstract: true,
        views: {
          '': {
            templateUrl: 'static/app/layouts/base.html',
            controller: 'molDatasetsCtrl'
          }
        }
      }
    )
    .state(
      'datasets.all', {
        abstract: true,
        title: 'Datasets Info',
        views: {
          '': {
            templateUrl: 'static/app/layouts/sidebar.html'
          },
          'sidebar@datasets.all': {
            templateUrl: 'static/app/views/sidebar.html'
          },
          'content@datasets.all': {
            templateUrl: 'static/app/layouts/content.html'
          }
        },
        url: '/'
      }
    )
    .state(
      'datasets.all.map', {
        views: {
          'map@datasets.all': {
            templateUrl: 'static/app/views/map/main.html',
            controller: 'molDatasetsMapCtrl'
          }
        },
        url: 'map'
      }
    )
    .state(
      'datasets.all.list', {
        views: {
          'info-pane@datasets.all': {
            templateUrl: 'static/app/views/table/main.html'
          }
        },
        url: 'list'
      }
    )
    .state(
      'datasets.all.both', {
        views: {
          'map@datasets.all': {
            templateUrl: 'static/app/views/map/main.html',
            controller: 'molDatasetsMapCtrl'
          },
          'info-pane@datasets.all': {
            templateUrl: 'static/app/views/table/main.html'
          }
        },
        url: ''
      }
    )
    .state(
      'datasets.info', {
        abstract: true,
        title: 'Dataset Info',
        views: {
          '': {
            templateUrl: 'static/app/layouts/basic.html'
          },
          'content@datasets.info': {
            templateUrl: 'static/app/layouts/content.html'
          },
        },
        url: '/:dataset'
      }
    )
    .state(
      'datasets.info.map', {
        views: {
          'title@datasets.info': {
            templateUrl: 'static/app/views/info/title.html',
            controller: 'molDatasetsInfoCtrl'
          },
          'map@datasets.info': {
            templateUrl: 'static/app/views/map/main.html',
            controller: 'molDatasetsMapCtrl'
          },
        },
        url: '/map'
      }
    )
    .state(
      'datasets.info.info', {
        views: {
          'title@datasets.info': {
            templateUrl: 'static/app/views/info/title.html',
            controller: 'molDatasetsInfoCtrl'
          },
          'info-pane@datasets.info': {
            templateUrl: 'static/app/views/info/info.html',
            controller: 'molDatasetsInfoCtrl'
          }
        },
        url: '/info'
      }
    )
    .state(
      'datasets.info.both', {
        views: {
          'title@datasets.info': {
            templateUrl: 'static/app/views/info/title.html',
            controller: 'molDatasetsInfoCtrl'
          },
          'map@datasets.info': {
            templateUrl: 'static/app/views/map/main.html',
            controller: 'molDatasetsMapCtrl'
          },
          'info-pane@datasets.info': {
            templateUrl: 'static/app/views/info/info.html',
            controller: 'molDatasetsInfoCtrl'
          }
        },
        url: ''
      }
    );
    $locationProvider.html5Mode(true);
}])
