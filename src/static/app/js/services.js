var molServices = angular.module('mol.services', []);

molServices.factory(
	'molApiVersion', [
		function() {
	     return "0.x"
 	  }
  ]
).factory('datasetsMap', [ 'leafletData', 'leafletBoundsHelpers', 'leafletMapEvents',
  function(leafletData, leafletBoundsHelpers, leafletMapEvents) {
    var map = {
        center: { lat: 0, lng: 0, zoom: 3 },
        extent: leafletBoundsHelpers.createBoundsFromArray([[90, 180], [-90, -180]]),
        controls: { fullscreen: { position: 'topright' }},
        timestamp: Date.now(),
        // events: { map: { enable: ['zoomstart', 'drag', 'click', 'mousemove'], logic: 'emit' } },
        defaults: { minZoom: 2 },
        bounds: {},
        legend: {},
        legends: {},
        layers: {
          overlays: {},
          baselayers: {
            xyz: {
              name: 'OpenStreetMap (XYZ)',
              url: '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
              type: 'xyz',
              layerParams: { showOnSelector: false },
              layerOptions: { showOnSelector: false },
            }
          },
        },

        updateMapBounds: function(coordinates) {
          var padding = 5;
          map.bounds = leafletBoundsHelpers.createBoundsFromArray([
            [coordinates[0][2][1] + padding, coordinates[0][2][0] + padding],
            [coordinates[0][0][1] - padding, coordinates[0][0][0] - padding]
          ]);
        },

        setLegend: function(name) {
          map.legend = map.legends[name];
          document.styleSheets[0].addRule('.legend:before', 'content: "' + name + '";');
        },

        buildLegend: function(legendData) {
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
          return legend;
        },

        showOverlay: function(overlay) {
          map.setLegend(overlay);
          Object.keys(map.legends).forEach(function(name) {
            if (map.layers.overlays[name]) {
              map.layers.overlays[name].visible = name == overlay;
            }
          });
        },

        addOverlay: function(name, url, active, legendData, coordinates) {
          map.legends[name] = map.buildLegend(legendData);
          if (active) {
            map.setLegend(name);
            map.updateMapBounds(coordinates);
          }
          map.layers.overlays[name] = {
            name: name,
            type: 'xyz',
            doRefresh: true,
            visible: active,
            url: url,
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

      };
    return map;
}]);
