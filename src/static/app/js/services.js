var molServices = angular.module('mol.services', []);

molServices.factory(
  'molApiVersion', [
    function() {
       return "0.x"
     }
  ]
).factory('datasetsMap', ['$q','$rootScope','$timeout','$filter', 'leafletData', 'leafletBoundsHelpers', 'leafletMapEvents',
  function($q, $rootScope, $timeout, $filter, leafletData, leafletBoundsHelpers, leafletMapEvents) {
    var map = {
        center: { lat: 0, lng: 0, zoom: 3 },
        extent: leafletBoundsHelpers.createBoundsFromArray([[90, 180], [-90, -180]]),
        controls: { fullscreen: { position: 'topright' }},
        timestamp: Date.now(),
        defaults: { minZoom: 2, scrollWheelZoom: false },
        bounds: {},
        legend: {},
        legends: {},
        events: { map: { enable: ['mouseout','mousemove'], logic: 'emit' } },
        popup: L.popup({ closeButton:false, autoPan:false, className: 'map-popup' }),
        layers: {
          overlays: {},
          baselayers: {
            xyz: {
              name: 'OpenStreetMap (XYZ)',
              url: '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
              type: 'xyz',
              layerParams: { showOnSelector: false },
              layerOptions: { showOnSelector: false },
            },
          },
        },
        visible: '',

        updateMapBounds: function(coordinates) {
          var padding = 5;
          map.bounds = leafletBoundsHelpers.createBoundsFromArray([
            [coordinates[0][2][1] + padding, coordinates[0][2][0] + padding],
            [coordinates[0][0][1] - padding, coordinates[0][0][0] - padding]
          ]);
        },

        showLegend: function(name) {
          map.legend = map.legends[name];
        },

        addLegend: function(legendData) {
          var legend = legendData.colors.reduce(function(prev, curr, i) {
            var item = {
              low: i ? legendData.bins[i-1]+1 : 1,
              high: legendData.bins[i],
              color: curr,
              label: ''
            };
            prev.push(item);
            return prev;
          }, []);
          legend.forEach(function(item) {
            var low = $filter('number')(item.low, 0),
                high =  $filter('number')(item.high, 0);
            if (item.low == item.high) {
              item.label = '' + high;
            } else {
              item.label = low + ' - ' + high;
            }
          });
          return legend;
        },

        showOverlay: function(overlay) {
          map.showLegend(overlay);
          Object.keys(map.legends).forEach(function(name) {
            if (map.layers.overlays[name]) {
              map.layers.overlays[name].visible = name == overlay;
              if(name == overlay &&  map.layers.overlays[name].grid_url) {
                map.updateGrid(map.layers.overlays[name].grid_url)
              }
            }
          });
        },

        updateGrid: function(grid_url) {
          map.layers.overlays.grid = {
              name: 'UTFGrid Interactivity',
              type: 'utfGrid',
              url: grid_url,
              visible: true,
              doRefresh: true,
              layerParams: {
                opacity: 0.8,  // transparent: true,
                showOnSelector: false
              },
              layerOptions: {
                opacity: 0.8,  // transparent: true,
                showOnSelector: false
              },
          };
        },

        addOverlay: function(name, active, response) {
          map.legends[name] = map.addLegend(response.data.legend);
          if (active) {
            map.showLegend(name);
            map.updateMapBounds(response.data.extent.coordinates);
            //map.layers.overlays.grid = undefined;
            map.updateGrid(response.data.grid_url + '?callback={cb}');
          }
          map.layers.overlays[name] = {
            name: name,
            type: 'xyz',
            doRefresh: true,
            visible: active,
            url: response.data.tile_url,
            grid_url: response.data.grid_url + '?callback={cb}',
            layerParams: {
              opacity: 0.8,  // transparent: true,
              showOnSelector: false
            },
            layerOptions: {
              opacity: 0.8,  // transparent: true,
              showOnSelector: false
            },
          }
        },

      };

      $rootScope.$on('leafletDirectiveMap.utfgridMouseover', function(event, leafletEvent) {
                   // the UTFGrid information is on leafletEvent.data
                  leafletData.getMap().then(function(lmap) {
                    map.popup.setLatLng(leafletEvent.latlng)
                      .setContent('<div class="content">'
                       + $filter('number')(leafletEvent.data.ct) + '</div>');
                     try{map.popup.openOn(lmap);} catch(e){};
                  });
      });
      $rootScope.$on('leafletDirectiveMap.mouseout', function(event){
       leafletData.getMap().then(function(lmap) {
         lmap.closePopup();
        });
      });

    return map;
}]);
