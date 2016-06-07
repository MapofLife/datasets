angular.module('mol.controllers')
  .controller('molDatasetsCtrl',
  	['$scope', '$rootScope', '$state','molApi',
   		function($scope, $rootScope, $state,molApi) {

      $rootScope = $scope; //important for map

      //for view specific css targeting
      $rootScope.$state = $state;

      $scope.datasets = [];

      molApi({
          "service" : "datasets"
      }).then(function(result) {
          $scope.datasets = result.data;
      })



  }])
