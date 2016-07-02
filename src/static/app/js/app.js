'use strict';

angular.module('mol.controllers',[]);

angular.module('mol.datasets', [
  'ui.router',
  'ui-leaflet',
  'angular-loading-bar',
  'angular.filter',
  'ngResource',
  'ngSanitize',
  'ngAnimate',
  'ui.bootstrap',
  'mol.facets',
  'mol.api',
  'mol.services',
  'mol.loading-indicator',
  'mol.controllers'
])
.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = false;
    cfpLoadingBarProvider.includeBar = false;
    //cfpLoadingBarProvider.includeBar = false;
    cfpLoadingBarProvider.latencyThreshold = 500;
  }])
.config(['$httpProvider', '$locationProvider', '$sceDelegateProvider', '$urlRouterProvider', '$stateProvider',
            function($httpProvider, $locationProvider, $sceDelegateProvider, $urlRouterProvider, $stateProvider) {
  $httpProvider.defaults.withCredentials = false;
  $locationProvider.html5Mode(true);
  $sceDelegateProvider.resourceUrlWhitelist([
    'self',
    'http:*//localhost**',
    'http*://127.0.0.1:9001/**',
    'http*://*mol.org/**',
    'http*://api.mol.org/1.0/datasets/**',
    'http*://api.mol.org/1.0/datasets/**',
    'http*://mapoflife.github.io/**',
  ]);
  $urlRouterProvider.otherwise("/table/");
  $stateProvider
    .state(
      'datasets',
      {
         abstract:true,
         views: {
           "": {
              templateUrl: 'static/app/layouts/base.html',
              controller: 'molDatasetsCtrl'
            }
         }
      }
    )
    .state(
      'datasets.all',
      {
        title: "Dataset datasets Map",
        views: {

          "@datasets" : { templateUrl: 'static/app/layouts/sidebar.html'},
          "sidebar@datasets.all" : {
            templateUrl: 'static/app/views/sidebar.html'},
          "content@datasets.all" : {
            templateUrl: "static/app/layouts/content.html"},
          "map@datasets.all" : {
            templateUrl: "static/app/views/map/main.html",
            controller: 'molDatasetsMapCtrl'},
          "info-pane@datasets.all" : {
            templateUrl: "static/app/views/table/main.html"},

        },
        url: '/'
      }
    )
    .state(
      'datasets.table',
      {
        title: "Dataset datasets Table",
        views: {
          "content@datasets" : { templateUrl: "static/app/views/table/main.html"}
        },
        url: '/table/:dataset'
      }
    )
    .state(
      'datasets.info',
      {
        title: 'Dataset Info',
        views: {
          "@datasets" : { templateUrl: 'static/app/layouts/basic.html'},
          "content@datasets.info" : {
            templateUrl: "static/app/layouts/content.html"},
          "map@datasets.info" : {
            templateUrl: "static/app/views/map/main.html",
            controller: 'molDatasetsMapCtrl'},
          "info-pane@datasets.info" : {
            templateUrl: "static/app/views/info/info.html",
            controller: 'molDatasetsInfoCtrl'}
        },
        url: '/:dataset'
      }
    );
    $locationProvider.html5Mode(true);
}])
