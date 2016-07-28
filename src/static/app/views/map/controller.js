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
    layers: {
      baselayers: {
        xyz: {
          name: 'OpenStreetMap (XYZ)',
          url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          type: 'xyz'
        }
      }
    },
  };

  $scope.canceller = $q.defer();

  $scope.datasetsQuery = function() {
    var payload = {};
    Object.keys($scope.model.choices).forEach(function (facet) {
      var choices = $scope.model.choices[facet];
      payload[facet] = Object.keys(choices).filter(function(choice) {
        return choices[choice]
      }).join(',').toLowerCase() || '';
    });

    if ($state.params.dataset) {
      payload = { dataset_id: $state.params.dataset };
    }

    $scope.canceller.resolve();
    $scope.canceller = $q.defer();
    molApi({
      service: 'inventory/maps',
      params : payload,
      canceller: $scope.canceller,
      processing: true
    }).then(function(response) {
      $scope.map.bounds = leafletBoundsHelpers.createBoundsFromArray([
        response.data.extent.coordinates[0][2].reverse(),
        response.data.extent.coordinates[0][0].reverse()
      ]);
      var padding = 5;
      $scope.map.bounds.northEast.lat += padding;
      $scope.map.bounds.northEast.lng += padding;
      $scope.map.bounds.southWest.lat -= padding;
      $scope.map.bounds.southWest.lng -= padding;
      $scope.map.layers.overlays = {
        xyz: {
          name: 'Datasets',
          visible: true,
          url: response.data.tile_url,
          type: 'xyz',
          doRefresh: true
        }
      };
      $scope.map.legend = $scope.buildLegend(response.data.legend);
    });
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
    if ($state.params.dataset) {
      legend.labels = legend.labels.slice(0, 1);
      legend.colors = legend.colors.slice(0, 1);
    }
    return legend;
  };

}]);
