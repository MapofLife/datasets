angular.module('mol.datasets')
  .filter('trustUrl', function($sce) {
    return function(url) {
      return $sce.trustAsResourceUrl(url);
    };
  })
  .filter('unsafe', function($sce) {
    return function(str) {
      return $sce.trustAsHtml(str);
    };
  })
  .filter('filterSelected', function() {
    return function(rows, field, choices) {
      return rows.filter(function(row) {
        if (!choices[field.value]) { return true; }
        return !choices[field.value][row.value];
      });
    };
  })
  .filter('choiceFilter', function() {
    return function(rows, choices, fields, skip_column) {
      if (!fields) { return rows; }

      // Convert choices object into an array of arrays to make filtering easier
      var choice = fields.map(function(field) {
        var object = choices[field.value] || {};
        return field.value == skip_column ? []
          : Object.keys(object).filter(function(key) { return object[key]; });
      });
      if (!choice.reduce(function(prev, curr) { return prev + curr.length; }, 0)) { return rows; }

      // Filter the rows based upon the choices
      return rows.filter(function(row) {
        return row.every(function(column, c) {
          if (!choice[c].length) { return true; }
          return column.some(function(datum) {
            return choice[c].some(function(value) { return value === datum.value });
          });
        });
      });
    };
  })
  .filter('dsSearch', function() {
    return function(rows, term) {
      if (!term) { return rows; }

      // Filter the rows based upon the search term
      return rows.filter(function(row) {
        if (matchesValue(row[2][0].title, term) || matchesValue(row[5][0].value, term)) {
          return row;
        }
      });
    };
  }).filter('capitalize', function() {
    return function(input, scope) {
      if (input) {
        input = input.toLowerCase();
        return input.substring(0,1).toUpperCase()+input.substring(1);
      } else { return null}
    }
  });


function matchesValue(text, pattern) {
  pattern = pattern.toLowerCase().replace(/[-[\]{}()*+?.,\\^$|#]/g, "\\$&");
  return (text.toLowerCase().search(pattern) > -1);
}