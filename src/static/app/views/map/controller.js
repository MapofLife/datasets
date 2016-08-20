angular.module('mol.controllers').controller('molDatasetsMapCtrl',
    ['$scope', '$timeout', '$q', '$state', 'molApi', /*'datasetsMap',*/ '$filter', 'molUiMap',
    function($scope, $timeout, $q, $state, molApi, /*datasetsMap,*/ $filter, molUiMap) {

  $scope.map = new molUiMap();
  //$scope.map = datasetsMap;
  $scope.canceller = $q.defer();

  $scope.overlays = {
    visible: '',
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
    //$scope.map.legend = { position: 'bottomleft', labels: [], colors: [] };
    //$scope.map.layers.overlays = {};
    $scope.datasetsQuery();
  };

  $scope.visibleOverlays = function() {
    var rows;
    if ($state.params.dataset) {
      var col = $scope.model.fields.reduce(function(prev, curr, i) { return curr.value == 'dataset_id' ? i : prev; }, -1);
      rows = $scope.model.rows.filter(function(row) {
        return row[col].some(function(item) { return item.value == $state.params.dataset});
      });
    } else {
      rows = $filter('choiceFilter')($scope.model.rows, $scope.model.choices, $scope.model.fields);
    }
    var visibleOverlays = $scope.overlayFilter(rows);
    $scope.overlays.visible = visibleOverlays.reduce(function(prev, curr) {
      return curr == $scope.overlays.visible ? curr : prev;
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
    $scope.overlays.visible = name;
    //$scope.map.showOverlay(name);
  };

  $scope.datasetsQuery = function() {
    $scope.stale = false;
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
      $scope.getLayer(payload, name, $scope.overlays.visible == name);
    });
  };

  $scope.getLayer = function(payload, name, active) {
    molApi({
      service: 'inventory/maps',
      params : payload,
      canceller: $scope.canceller,
      processing: true
    }).then(function(response) {
      // $scope.map.addOverlay(name, active, response);
      $scope.tilesloaded=false;
      $scope.map.setOverlay({
          tile_url: 'https://{0}/mol/api/v1/map/{1}/{z}/{x}/{y}.png'
            .format(response.cdn_url.https, response.layergroupid),
          grid_url: 'https://{0}/mol/api/v1/map/{1}/0/{z}/{x}/{y}.grid.json'
            .format(response.cdn_url.https, response.layergroupid),
          key: response.layergroupid,
          attr: '©2014 Map of Life',
          name: 'detail',
          index:0,
          opacity: 0.8,
          type: 'detail'
      },0);

    });
  };

}]);
