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
    var name, payload = {};

    $scope.canceller.resolve();
    $scope.canceller = $q.defer();

    if ($state.params.dataset) {
      name = 'Species Counts';
      payload = {
        dataset_id: $state.params.dataset,
        property: 'richness',
        reducer: 'max'
      };
      if (!$scope.layer || $scope.layer == 'Dataset Counts') {
        $scope.showOverlay(name);
      }
    } else {
      name = 'Dataset Counts';
      payload.property = 'dataset_id';
      payload.reducer = 'count';
      Object.keys($scope.model.choices).forEach(function (facet) {
        var choices = $scope.model.choices[facet];
        payload[facet] = Object.keys(choices).filter(function(choice) {
          return choices[choice]
        }).join(',').toLowerCase() || '';
      });
      if (!$scope.layer || $scope.layer == 'Species Counts') {
        $scope.showOverlay(name);
      }
    }
    $scope.getLayer(payload, name, true);

    payload.property = 'no_records';
    payload.reducer = 'sum';
    $scope.getLayer(payload, 'Record Counts', false);
  };

  $scope.getLayer = function(payload, name, active) {
    molApi({
      service: 'inventory/maps',
      params : payload,
      canceller: $scope.canceller,
      processing: true
    }).then(function(response) {
      $scope.map.addOverlay(name, response.data.tile_url, active, response.data.legend, response.data.extent.coordinates);
    });
  };

}]);
