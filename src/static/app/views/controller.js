angular.module('mol.controllers')
  .controller('molDatasetsCtrl', ['$scope', 'molApi', '$stateParams', '$rootScope', '$state',
    function($scope, molApi, $stateParams, $rootScope, $state) {

  $rootScope.$state = $state;
  $scope.model = {
      choices: {},
      fields: [],
      rows: [],
      byregion: {
        regionTypes: [{
          'title': 'Political boundaries',
          'type': 'countries',
          'dataset_id': 'e9707baa-46e2-4ec4-99b6-86b1712e02de'
        }, {
          'title': 'Mountain Ranges',
          'type': 'mountains',
          'dataset_id': 'b7cc3596-5fce-4546-b583-b482520fc01f'
        }],
        productTypes: [{
          'title': 'Expert Range Maps',
          'type': 'range'
        }, {
          'title': 'Regional Checklists',
          'type': 'regionalchecklist'
        }, {
          'title': 'Local inventories',
          'type': 'localinv'
        }, {
          'title': 'Gridded surveys',
          'type': 'griddedrangeatlas'
        }, {
          'title': 'Point observations',
          'type': 'points'
        }],
        currentRegionList: undefined,
        currentDatasetList: undefined,
        selectedRegionType: undefined,
        selectedProductType: [
          'griddedrangeatlas', 
          'localinv', 
          'points',
          'range', 
          'regionalchecklist'
        ],
        selectedRegion: undefined,
        sortType: 'dataset_title',
        sortReverse: false,
        loading: false
      }
  };
  $scope.model.byregion.selectedRegionType = $scope.model.byregion.regionTypes[0];

  // Add facets to the state
  $scope.$watch('model.choices', function (n, o) { 
    if (n && n != o) {
      var dtlist = [], sglist = [];
      if (n.product_type) {
        angular.forEach(n.product_type, function (value, key) {
          if (value) this.push(key);
        }, dtlist);
      }
      if (n.taxogroup) {
        angular.forEach(n.taxogroup, function (value, key) {
          if (value) this.push(key);
        }, sglist);
      }

      $state.go($state.current.name, {
        dt: dtlist.join(','),
        sg: sglist.join(',')
      });
    }
  }, true);

  // Check for region type change
  $scope.$watch('model.byregion.selectedRegionType', function (n, o) { 
    if (n && n != o) {
      loadRegionsForType();
    }
  }, true);

  // Check for region change
  $scope.$watch('model.byregion.selectedRegion', function (n, o) { 
    if (n && n != o) {
      $scope.model.byregion.currentDatasetList = undefined;
    }
  }, true);

  $scope.initialize = function() {
    molApi({service: 'datasets/inventory', loading: true}).then(function(response) {
      $scope.model.fields = response.data.fields;
      $scope.model.rows = response.data.rows;

      /* Add in the product_type and taxogroup choices
       * "product_type" choices based on the "dt" url param
       * "taxogroup" choices based on the "sg" url param
       */
      if ($state.params.dt) {
        $scope.model.choices['product_type'] = {};
        angular.forEach(getAsArray($state.params.dt), function(v, idx) {
          $scope.model.choices['product_type'][v] = true;
        });
      }
      if ($state.params.sg) {
        $scope.model.choices['taxogroup'] = {};
        angular.forEach(getAsArray($state.params.sg), function (v, k) {
          $scope.model.choices['taxogroup'][v] = true;
        });
      }
    });

    var defRegionType = ($state.params.regiontype || $scope.model.byregion.regionTypes[0].type);
    $scope.model.byregion.selectedRegionType = $scope.model.byregion.regionTypes.find(function(rt) {
      return rt.type.toLowerCase() === defRegionType.toLowerCase();
    });

    if ($state.params.regionid) {
      $scope.model.byregion.selectedRegion = {region_id: $state.params.regionid};
      $scope.getRegionDatasets();
    }

    loadRegionsForType();
  };

  $scope.getValue = function(row, columnName) {
    var index = $scope.model.fields.reduce(function(prev, curr, i) {
      return curr.value == columnName ? i : prev;
    }, -1);
    return row[index].map(function(item) { return item.value; }).join(' ');
  };

  $scope.sortColumn = 0;
  $scope.reverse = false;

  $scope.toggleSort = function(i) {
    if (i == $scope.sortColumn) {
      $scope.reverse = ! $scope.reverse;
    } else {
      $scope.sortColumn = i;
      $scope.reverse = false;
    }
  };

  $scope.sortComparator = function(a, b) {
    var aa = a.value,
        bb = b.value,
        type = $scope.model.fields[$scope.sortColumn].type;
    if (type == 'number') {
      return +aa > +bb ? 1: (+aa < +bb ? -1 : 0);
    }
    return aa > bb ? 1 : (aa < bb ? -1 : 0);
  };

  $scope.columnValue = function(row) {
    return row[$scope.sortColumn].map(function(v) { return v.title; }).join(' ');
  };

  $scope.getProductType = function(value) {
    return $scope.model.byregion.productTypes.find(function(v){return v.type === value }).title;
  };

  $scope.getRegionDatasets = function() {
    $scope.model.byregion.loading = true;
    var rdurl = 'spatial/regions/datasets?region_id=' + $scope.model.byregion.selectedRegion.region_id;
    rdurl += '&product_type=' + $scope.model.byregion.selectedProductType.join();
    molApi({service: rdurl, loading: true}).then(function(response) { 
      $scope.model.byregion.currentDatasetList = response.data;
      $scope.model.byregion.loading = false;
    });
  };

  function getAsArray(obj) {
    if (angular.isString(obj)) return obj.split(',');
    if (angular.isArray(obj)) return obj;
    return undefined;
  }

  function loadRegionsForType() {
    $scope.model.byregion.loading = true;
    $scope.model.byregion.currentRegionList = undefined;
    $scope.model.byregion.selectedRegion = undefined;
    $scope.model.byregion.currentDatasetList = undefined;
    var rturl = 'spatial/regions/list?dataset_id=' + $scope.model.byregion.selectedRegionType.dataset_id;
    molApi({service: rturl, loading: true}).then(function(response) {

      if ($scope.model.byregion.selectedRegionType.type == 'countries') {
        var result = _(response.data).filter({ download: true })
          .sortBy('attributes.country').groupBy(function (g) {
            if (g.attributes && g.attributes.country) {
              return g.attributes.country || 'Countries';
            }
            return 'Countries';
          }).map(function (g) { g[0].firstInGroup = true; return g; })
          .flatten().value();
        
        $scope.model.byregion.currentRegionList = result;
      } else {
        $scope.model.byregion.currentRegionList = response.data;
      }

      if ($state.params.region) {
        $scope.model.byregion.selectedRegion = $scope.model.byregion.currentRegionList.find(function(reg) {
          return reg.name.toLowerCase() === $state.params.region.toLowerCase();
        });
      }

      $scope.model.byregion.loading = false;
    });
  }

  $scope.initialize();
}]);
