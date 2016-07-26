angular.module('mol.controllers')
  .controller('molDatasetsCtrl', ['$scope', 'molApi', '$stateParams', '$rootScope', '$state',
    function($scope, molApi, $stateParams, $rootScope, $state) {

  $rootScope.$state = $state;
  $scope.model = {
      choices: {},
      facets: { fields:[], rows:[] },
      filterByIds: []
  };

  $scope.initialize = function() {
    molApi({service: 'inventory/datasets', loading: true}).then(function(response) {
      $scope.model.facets = response.data;
      console.log(response.data);
    });
  };

  $scope.getValue = function(row, columnName) {
    var index = $scope.model.facets.fields.reduce(function(prev, curr, i) {
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
        type = $scope.model.facets.fields[$scope.sortColumn].type;
    if (type == 'number') {
      return +aa > +bb ? 1: (+aa < +bb ? -1 : 0);
    }
    return aa > bb ? 1 : (aa < bb ? -1 : 0);
  };

  $scope.columnValue = function(row) {
    return row[$scope.sortColumn].map(function(v) { return v.title; }).join(' ');
  };

  $scope.initialize();
}]);
