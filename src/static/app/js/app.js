'use strict';


angular.module('mol.controllers',[]);

angular.module('mol', [
  'ngSanitize',
  'ngCookies',
  'ngAnimate',
  'ngTouch',
  'mol.api',
  'mol.filters',
  'mol.services',
  'mol.controllers',
  'mol.loading-indicator',
  'ui.bootstrap',
  'ui.router',
  'percentage',
  'km2',
  'angular-loading-bar',
])
.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = false;
    cfpLoadingBarProvider.includeBar = false;
    //cfpLoadingBarProvider.includeBar = false;
    cfpLoadingBarProvider.latencyThreshold = 100;
  }])
.config(function($sceDelegateProvider,$stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {

  var params = ""+
    "{dataset}";
  $sceDelegateProvider.resourceUrlWhitelist([
      'self',
      'http*://localhost**',
      'http*://*mol.org/**',
      'http*://api.mol.org/**',
      'http*://mapoflife.github.io/**'
    ]);
  $httpProvider.defaults.useXDomain = true;
  //send cookies
  $httpProvider.defaults.withCredentials = false;
  $urlRouterProvider.otherwise("/");

  $stateProvider
    .state(
      'datasets', //this view contains the bones of the Species Info pages (name, pic, & search bar)
      {
        abstract: true,
        views: {
          "": {
            templateUrl: 'static/app/layouts/base-scrolling.html',
            controller: 'molDatasetsCtrl'},
          "@datasets" : {
            templateUrl: 'static/app/layouts/basic.html'
          }
        }

      }
    )

    .state(
      'datasets.list',
      {
        views: {
          "content@datasets" :{
            templateUrl: "static/app/views/list/table.html",
            controller: 'molDatasetsListCtrl'
          }
        },
        url: '/'
      }
    )
    .state(
      'datasets.info',
      {
        views: {
          "content@datasets" :{
            templateUrl: "static/app/views/info/info.html",
            controller: 'molDatasetsInfoCtrl'
          }
        },
        url: '/{0}'.format(params)
      }
    );
    //Gets rid of the # in the querystring. Wont work on IE
    $locationProvider.html5Mode(true);

});
