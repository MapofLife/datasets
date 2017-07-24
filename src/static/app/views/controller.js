angular.module('mol.controllers')
  .controller('molDatasetsCtrl', ['$scope', 'molApi', '$stateParams', '$rootScope', '$state',
    function($scope, molApi, $stateParams, $rootScope, $state) {

  $rootScope.$state = $state;
  $scope.model = {
      choices: {},
      fields: [],
      rows: [],
  };

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

  $scope.initialize = function() {
    molApi({service: 'inventory/datasets', loading: true}).then(function(response) {
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

  function getAsArray(obj) {
    if (angular.isString(obj)) return obj.split(',');
    if (angular.isArray(obj)) return obj;
    return undefined;
  }

  $scope.initialize();
}]);
