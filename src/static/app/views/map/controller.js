angular.module('mol.controllers').controller('molDatasetsMapCtrl',
    ['$scope', 'leafletData', '$timeout', '$window', '$http', '$filter', 'molApi','$q','$state',
    function($scope, leafletData, $timeout, $window, $http, $filter, molApi,$q,$state) {


  $scope.$watch('model.choices', function() {
    $scope.datasetsQuery();
  }, true);

  $scope.map = {
    center: { lat: 0, lng: 0, zoom: 3 },
    events: { map: { enable: ['click'], logic: 'emit' } },
    controls: {
      fullscreen: {
            position: 'topright'
        }
    },
    layers: {
      baselayers: {
        xyz: {
          name: 'OpenStreetMap (XYZ)',
          url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          type: 'xyz'
        }
      }
    }
  };

  $scope.canceller = $q.defer();
  $scope.datasetsQuery = function() {
    var payload = {};
    Object.keys($scope.model.choices).map(function (facet) {
      var choices = $scope.model.choices[facet];
      payload[facet] = Object.keys(choices).filter(function(choice) {return choices[choice]} ).join(',').toLowerCase() || '';
    })

  if($state.params.dataset) {
    payload={dataset_id:$state.params.dataset}
  }


  $scope.canceller.resolve();
    $scope.canceller = $q.defer();
      $http({
        "url": "https://mol.cartodb.com/api/v1/map/named/datasets-map",
        "method": "POST",
        "data" : payload,
        "timeout":   $scope.canceller
      }).then(function(response) {
      var result = response.data, tile_url = ""+
          "https://{0}/mol/api/v1/map/{1}/{z}/{x}/{y}.png"
            .format(result.cdn_url.https,

              result.layergroupid),
        grid_url= ""+
          "https://{0}/mol/api/v1/map/{1}/0/{z}/{x}/{y}.grid.json"
            .format(
              result.cdn_url.https,
              result.layergroupid);

       $scope.map.layers.overlays = {
         xyz: {
           name: 'Datasets',
           visible: true,
           url: tile_url,
           type: 'xyz',
           doRefresh: true
         }
       };
      });

  };

}]);
