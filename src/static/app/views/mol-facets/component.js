angular.module('mol.facets', [])
  .directive('molFacets', [function() {
    return {
      restrict: 'E',
      templateUrl: 'static/app/views/mol-facets/partials/mol-facets.html',
      scope: {
        facets: '=',
        choices: '='
      },
      link: function(scope) {
        scope.$watch('facets', scope.updateValuesToLabels);
        scope.$watch('choices', scope.updateBadges, true);
      },
      controller: ['$scope', function($scope) {
        $scope.badges = [];
        $scope.facetBadges = {};
        $scope.getColumn = function(col) {
          return function(row) {
            return row[col];
          }
        };
        $scope.updateValuesToLabels = function() {
          if (!$scope.facets) { return; }
          $scope.values2labels = {};
          $scope.facets.fields.forEach(function(field, f) {
            $scope.values2labels[field.value] = {};
            $scope.facets.rows.forEach(function(row) {
              row[f].forEach(function(item) {
                $scope.values2labels[field.value][item.value] = item.title;
              });
            });
          });
        };
        $scope.badges4facet = function(facet) {
          return Object.keys($scope.choices[facet]).filter(function(choice) {
              return $scope.choices[facet][choice];
          }).reduce(function(prev, curr) {
              prev.push({
                facet: facet,
                value: curr,
                title: $scope.values2labels[facet][curr]
              });
              return prev;
            }, []);
        };
        $scope.updateBadges = function() {
          $scope.facetBadges = {};
          Object.keys($scope.choices).forEach(function(facet) {
            $scope.facetBadges[facet] = $scope.badges4facet(facet);
            return $scope.facetBadges[facet];
          });
          $scope.badges = Object.keys($scope.facetBadges).reduce(function(prev, curr) {
            return prev.concat($scope.facetBadges[curr]);
          }, []);
        };
        $scope.clear = function() {
          Object.keys($scope.choices).forEach(function(facet) {
            Object.keys($scope.choices[facet]).forEach(function(key) {
              $scope.choices[facet][key] = false;
            });
          });
        };
      }]
    };
  }]);
