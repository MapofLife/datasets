angular.module('mol.controllers').controller('molDatasetsMapCtrl',
    ['$scope', '$timeout', '$q', '$state', 'molApi', 'datasetsMap', '$filter',
    function($scope, $timeout, $q, $state, molApi, datasetsMap, $filter) {

  $scope.map = datasetsMap;
  $scope.canceller = $q.defer();

  $scope.overlays = {
    visible: '',
    'No. of datasets': {
      property: 'dataset_id',
      reducer: 'count',
    },
    'No. of species': {
      property: 'richness',
      reducer: 'max'
    },
    'No. of records': {
      property: 'no_records',
      reducer: 'sum',
    },
  };

  $scope.$watch('model.choices', function() {
    $scope.map.legend = { position: 'bottomleft', labels: [], colors: [] };
    $scope.map.layers.overlays = {};
    $timeout($scope.datasetsQuery);
  }, true);

  $scope.visibleOverlays = function() {
    var rows = $filter('choiceFilter')($scope.model.rows, $scope.model.choices, $scope.model.fields);
    var visibleOverlays = $filter('overlayFilter')(rows, $scope.model.fields, $state);
    $scope.overlays.visible = visibleOverlays.reduce(function(prev, curr) {
      return curr == $scope.overlays.visible ? curr : prev;
    }, visibleOverlays[0]);
    return visibleOverlays;
  };

  $scope.showOverlay = function(name) {
    $scope.overlays.visible = name;
    $scope.map.showOverlay(name);
  };

  $scope.datasetsQuery = function() {
    $scope.canceller.resolve();
    $scope.canceller = $q.defer();

    var name, payload1 = {};
    if ($state.params.dataset) {
      name = 'No. of species';
      if (!$scope.overlays.visible || $scope.overlays.visible == 'No. of datasets') { $scope.showOverlay(name); }
      payload1 = Object.assign({}, $scope.overlays[name], { dataset_id: $state.params.dataset });
    } else {
      name = 'No. of datasets';
      if (!$scope.overlays.visible || $scope.overlays.visible == 'No. of species') { $scope.showOverlay(name); }
      payload1 = Object.assign({}, $scope.overlays[name]);
      Object.keys($scope.model.choices).forEach(function (facet) {
        var choices = $scope.model.choices[facet];
        payload1[facet] = Object.keys(choices).filter(function(choice) {
          return choices[choice]
        }).join(',').toLowerCase() || '';
      });
    }
    $scope.getLayer(payload1, name, $scope.overlays.visible == name);

    name = 'No. of records';
    var payload2 = Object.assign({}, payload1, $scope.overlays[name]);
    $scope.getLayer(payload2, name,  $scope.overlays.visible == name);
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
