angular.module('mol.controllers').controller('molDatasetsMapCtrl',
    ['$scope', '$timeout', '$q', '$state', 'molApi', 'datasetsMap',
    function($scope, $timeout, $q, $state, molApi, datasetsMap) {

  $scope.map = datasetsMap;
  $scope.canceller = $q.defer();

  $scope.$watch('model.choices', function() {
    $scope.map.legend = { position: 'bottomleft', labels: [], colors: [] };
    $scope.map.layers.overlays = {};
    $timeout($scope.datasetsQuery);
  }, true);

  $scope.showOverlay = function(overlay) {
    $scope.overlay = overlay || $scope.overlay;
    $scope.map.showOverlay($scope.overlay);
  };

  $scope.datasetsQuery = function() {
    var name, payload1 = {};

    $scope.canceller.resolve();
    $scope.canceller = $q.defer();

    if ($state.params.dataset) {
      if (!$scope.overlay || $scope.overlay == 'Dataset Counts') {
        $scope.showOverlay(name);
      }
      name = 'Species Counts';
      payload1 = {
        dataset_id: $state.params.dataset,
        property: 'richness',
        reducer: 'max'
      };
    } else {
      if (!$scope.overlay || $scope.overlay == 'Species Counts') {
        $scope.showOverlay(name);
      }
      name = 'Dataset Counts';
      payload1.property = 'dataset_id';
      payload1.reducer = 'count';
      Object.keys($scope.model.choices).forEach(function (facet) {
        var choices = $scope.model.choices[facet];
        payload1[facet] = Object.keys(choices).filter(function(choice) {
          return choices[choice]
        }).join(',').toLowerCase() || '';
      });
    }
    $scope.getLayer(payload1, name, true);

    var payload2 = Object.assign({}, payload1);
    payload2.property = 'no_records';
    payload2.reducer = 'sum';
    $scope.getLayer(payload2, 'Record Counts', false);
  };

  $scope.getLayer = function(payload, name, active) {
    molApi({
      service: 'inventory/maps',
      params : payload,
      canceller: $scope.canceller,
      processing: true
    }).then(function(response) {
      $scope.map.addOverlay(name, active, response);
    });
  };

}]);
