angular.module('mol.controllers').controller('molDatasetsMapCtrl',
    ['$scope', 'leafletData', 'leafletBoundsHelpers', '$timeout', '$window', '$http', '$filter', 'molApi', '$q', '$state', 'leafletMapEvents',
    function($scope, leafletData, leafletBoundsHelpers, $timeout, $window, $http, $filter, molApi, $q, $state, leafletMapEvents) {

  $scope.$watch('model.choices', function() {
    $scope.map.legend = { position: 'bottomleft', labels: [], colors: [] };
    $scope.map.layers.overlays = {};
    $timeout($scope.datasetsQuery);
  }, true);

  $scope.map = {
    center: { lat: 0, lng: 0, zoom: 3 },
    extent: leafletBoundsHelpers.createBoundsFromArray([[90, 180], [-90, -180]]),
    controls: { fullscreen: { position: 'topright' }},
    events: { map: { enable: ['click'], logic: 'emit' } },
    defaults: { minZoom: 2 },
    bounds: {},
    legend: {},
    legends: {},
    layers: {
      baselayers: {
        xyz: {
          name: 'OpenStreetMap (XYZ)',
          url: '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          type: 'xyz',
          layerParams: { showOnSelector: false },
          layerOptions: { showOnSelector: false },
        }
      },
      overlays: {},
    },
  };

  $scope.canceller = $q.defer();

  $scope.showOverlay = function(overlay) {
    if (overlay) {
      $scope.overlay = overlay;
    }
    Object.keys($scope.map.legends).forEach(function(name) {
      $scope.setLegend($scope.overlay);
      $scope.map.layers.overlays[name].visible = name == $scope.overlay;
    });
  };

  $scope.datasetsQuery = function() {
    var name, payload = {};

    $scope.canceller.resolve();
    $scope.canceller = $q.defer();

    if ($state.params.dataset) {
      name = 'Species Counts';
      payload = {
        dataset_id: $state.params.dataset,
        property: 'no_species',
        reducer: 'sum'
      };
      if (!$scope.layer || $scope.layer == 'Dataset Counts') {
        $scope.showOverlay(name);
      }
    } else {
      name = 'Dataset Counts';
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
      var padding = 5;
      $scope.map.legends[name] = $scope.buildLegend(response.data.legend);
      if (active) {
        $scope.setLegend(name);
        $scope.updateMapBounds(response.data.extent.coordinates);
      }
      $scope.map.layers.overlays[name] = {
        name: name,
        type: 'xyz',
        doRefresh: true,
        visible: active,
        url: response.data.tile_url,
        // layerParams: { showOnSelector: false },
        // layerOptions: { showOnSelector: false },
      };
    });
  };

  $scope.setLegend = function(name) {
    $scope.map.legend = $scope.map.legends[name];
    document.styleSheets[0].addRule('.legend:before', 'content: "' + name + '";');
  };

  $scope.updateMapBounds = function(coordinates) {
    var padding = 5;
    $scope.map.bounds = leafletBoundsHelpers.createBoundsFromArray([
      [coordinates[0][2][1] + padding, coordinates[0][2][0] + padding],
      [coordinates[0][0][1] - padding, coordinates[0][0][0] - padding]
    ]);
  };

  $scope.buildLegend = function(legendData) {
    var legend = { position: 'bottomleft', labels: [], colors: [] };
    var used = {};
    legendData.colors.reduce(function(prev, curr, i) {
      var item = {
        low: i ? legendData.bins[i-1] + 1 : 1,
        high: i > legendData.bins.length - 1 ? 'and over' : legendData.bins[i],
        color: curr
      };
      if (item.low > item.high) { item.low = item.high; }
      if (!used[item.high]) {
        used[item.high] = true;
        prev.push(item);
      }
      return prev;
    }, []).forEach(function(item) {
      if (item.low == item.high) {
        legend.labels.push('' + item.low);
      } else {
        var h = item.high;
        legend.labels.push('' + item.low + (isNaN(h) ? ' ' + h : ' - ' + h));
      }
      legend.colors.push(item.color);
    });
    if (legend.labels.length == 2) {
      legend.labels = legend.labels.slice(0, 1);
      legend.colors = legend.colors.slice(0, 1);
    }
    return legend;
  };

}]);
