angular.module('mol.controllers').controller('molDatasetsMapCtrl',
    ['$scope', 'leafletData', 'leafletBoundsHelpers','$timeout', '$window', '$http', '$filter', 'molApi','$q','$state',
    function($scope, leafletData, leafletBoundsHelpers,$timeout, $window, $http, $filter, molApi,$q,$state) {

  $scope.$watch('model.choices', function() {
    $scope.datasetsQuery();
  }, true);

  $scope.map = {
    center: { lat: 0, lng: 0, zoom: 3 },
    extent: leafletBoundsHelpers.createBoundsFromArray([
      [90,180],[-90,-180]
    ]),
    events: { map: { enable: ['click'], logic: 'emit' } },
    bounds: {},
    controls: {
      fullscreen: {
        position: 'topright'
      }
    },
    options: {
      minZoom:2
    },
    layers: {
      baselayers: {
        xyz: {
          name: 'OpenStreetMap (XYZ)',
          url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          type: 'xyz'
        }
      }
    },
    defaults: {},
    legend: {},
  };

  $scope.canceller = $q.defer();
  $scope.datasetsQuery = function() {
    var payload = {};
    Object.keys($scope.model.choices).map(function (facet) {
      var choices = $scope.model.choices[facet];
      payload[facet] = Object.keys(choices).filter(function(choice) {return choices[choice]} ).join(',').toLowerCase() || '';
    });

    if ($state.params.dataset) {
      payload={ dataset_id:$state.params.dataset };
    }

    $scope.canceller.resolve();
    $scope.canceller = $q.defer();
    molApi({
      service: 'inventory/maps',
      params : payload,
      canceller: $scope.canceller,
      loading: true
    }).then(function(response) {
      var bounds = leafletBoundsHelpers.createBoundsFromArray([
        response.data.extent.coordinates[0][2].reverse(),
        response.data.extent.coordinates[0][0].reverse(),
      ]);
     $scope.map.bounds = bounds;
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
    if ($state.params.dataset) {
      return {};
    }
    var legend = { position: 'bottomleft', labels: [], colors: [] };
    var used = {};
    legendData.colors.reduce(function(prev, curr, i) {
      var item = {
        low: i ? legendData.bins[i-1] + 1 : 0,
        high: i > legendData.bins.length - 1 ? 'and over' : legendData.bins[i],
        color: curr
      };
      console.log(item);
      if (!used[item.high]) {
        used[item.high] = true;
        prev.push(item);
      }
      return prev;
    }, []).forEach(function(item) {
      if (item.low == item.high) {
        legend.labels.push('' + item.low + ' datasets');
      } else {
        legend.labels.push('' + item.low + ' - ' + item.high + ' datasets');
      }
      legend.colors.push(item.color);
    });
    console.log(legend);
    return legend;
  };

}]);
