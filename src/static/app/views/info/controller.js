angular.module('mol.controllers')
  .controller('molDatasetsInfoCtrl', ['$scope', '$rootScope', '$state', 'molApi',
    function($scope, $rootScope, $state, molApi) {
      $rootScope.pagetitle = $state.current.title;
      $scope.loading = true;
      $scope.dsinfo = {};
      var dsparams = {
        'dataset_id': $state.params.dataset
      };
      molApi({
        "service": "datasets/info",
        "params": dsparams,
        "loading": true
      }).then(function(result) {
        $scope.dsinfo = result.data;
        $scope.loading = false;
      });
    }
  ]);
