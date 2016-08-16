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
  .filter('excludeSelected', function() {
    return function(values, field, choices) {
      return values.filter(function(value) {
        if (!choices[field.value]) { return true; }
        return !choices[field.value][value];
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
  .filter('overlayFilter', function() {
    return function(rows, fields, state) {
      if (!fields) { return rows; }
      var fieldMap = {};
      var viz = {};
      var col = -1;
      fields.forEach(function(field, i) {
        fieldMap[field.value] = field;
        if (field.type == 'viz') { col = i; }
      });
      rows.forEach(function(row) {
        row[col].forEach(function(item) {
          item.value.forEach(function(val) {
            val.split(',').forEach(function(name) { viz[name] = 1; })
          });
        });
      });
      var overlays = Object.keys(viz).map(function(v) { return fieldMap[v].title; });
      if (!state.params.dataset) {
        overlays.unshift('No. of datasets');
        overlays = overlays.filter(function(opt) { return opt != 'No. of species'; });
      }
      return overlays;
    };
  });
