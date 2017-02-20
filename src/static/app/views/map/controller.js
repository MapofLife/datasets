angular.module('mol.controllers').controller('molDatasetsMapCtrl',
    ['$scope', '$timeout', '$q', '$state', 'molApi', 'datasetsMap', '$filter',
    function($scope, $timeout, $q, $state, molApi, datasetsMap, $filter) {

  $scope.map = datasetsMap;
  $scope.canceller = $q.defer();
  $scope.showMap = false;

  $scope.overlays = {
    'No. of datasets': {
      property: 'dataset_id',
      reducer: 'count',
    },
    'No. of species': {
      property: 'richness',
      reducer: 'max',
    },
    'No. of records': {
      property: 'no_records',
      reducer: 'sum',
    },
  };

  $scope.$watch('model.choices', function() { $scope.updateMaps() }, true);
  $scope.$watch('model.rows', function() { $scope.updateMaps() });

  $scope.updateMaps = function() {
    $scope.map.legend = { position: 'bottomleft', labels: [], colors: [] };
    $scope.map.layers.overlays = {};
    $timeout($scope.datasetsQuery);
  };

  $scope.visibleOverlays = function() {
    var rows;
    if ($state.params.dataset) {
      var col = $scope.model.fields.reduce(function(prev, curr, i) { return curr.value == 'dataset_id' ? i : prev; }, -1);
      rows = $scope.model.rows.filter(function(row) {
        return row[col].some(function(item) { return item.value == $state.params.dataset });
      });
    } else {
      rows = $filter('choiceFilter')($scope.model.rows, $scope.model.choices, $scope.model.fields);
    }
    var visibleOverlays = $scope.overlayFilter(rows);
    $scope.map.visible = visibleOverlays.reduce(function(prev, curr) {
      return curr == $scope.map.visible ? curr : prev;
    }, visibleOverlays[0]);
    return visibleOverlays;
  };

  $scope.overlayFilter = function(rows) {
    if (!$scope.model.fields) { return rows; }
    var fieldMap = {};
    var viz = {};
    var col = -1;
    $scope.model.fields.forEach(function(field, i) {
      fieldMap[field.value] = field;
      if (field.type == 'viz') { col = i; }
    });
    rows.forEach(function(row) {
      row[col].forEach(function(item) {
        item.value.forEach(function(val) {
          val.split(',').forEach(function(name) { viz[name] = 1; })
        });
      });
    });
    var overlays = Object.keys(viz).map(function(v) { return fieldMap[v].title; });
    if (!$state.params.dataset) {
      overlays.unshift('No. of datasets');
      overlays = overlays.filter(function(opt) { return opt != 'No. of species'; });
    }
    return overlays;
  };

  $scope.showOverlay = function(name) {
    $scope.map.visible = name;
    $scope.map.showOverlay(name);
  };

  $scope.datasetsQuery = function() {
    $scope.canceller.resolve();
    $scope.canceller = $q.defer();

    $scope.visibleOverlays().forEach(function(name) {
      var payload = {};
      if ($state.params.dataset) {
        payload = Object.assign({}, $scope.overlays[name], { dataset_id: $state.params.dataset });
      } else {
        payload = Object.assign({}, $scope.overlays[name]);
        Object.keys($scope.model.choices).forEach(function (facet) {
          var choices = $scope.model.choices[facet];
          payload[facet] = Object.keys(choices).filter(function(choice) {
            return choices[choice]
          }).join(',').toLowerCase() || '';
        });
      }
      $scope.getLayer(payload, name, $scope.map.visible == name);
    });
    $scope.showMap = $state.current.name.indexOf('.both') > -1 || $state.current.name.indexOf('.map') > -1;
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
