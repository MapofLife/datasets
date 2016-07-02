// For convenience...
/**
 * https://gist.github.com/1049426
 *
 * Usage:
 *
 *   "{0} is a {1}".format("Tim", "programmer");
 *
 */
String.prototype.format = function(i, safe, arg) {
  function format() {
      var str = this,
          len = arguments.length+1;

      for (i=0; i < len; arg = arguments[i++]) {
          safe = typeof arg === 'object' ? JSON.stringify(arg) : arg;
          str = str.replace(RegExp('\\{'+(i-1)+'\\}', 'g'), safe);
      }
      return str;
  }
  format.native = String.prototype.format;
  return format;
}();

angular.module('percentage', [])
.filter('percentage', function ($window) {
    return function (input, decimals, suffix) {
        decimals = angular.isNumber(decimals)? decimals :  3;
        suffix = suffix || '%';
        if ($window.isNaN(input)) {
            return '';
        }
        return Math.round(input * Math.pow(10, decimals + 2))/Math.pow(10, decimals) + suffix;
    };
});
angular.module('km2', [])
.filter('km2', function ($window) {
    return function (input, decimals, suffix) {
        suffix = suffix || ' km²';
        if ($window.isNaN(parseFloat(input))) {
            return '';
        }
        return input + suffix;
    };
});

angular.module('imageHelpers',[]).directive('errSrc', function() {
  return {
    link: function(scope, element, attrs) {
      var defaultSrc = attrs.src;
      element.bind('error', function() {
        if(attrs.errSrc) {
            element.attr('src', attrs.errSrc);
        }
        else if(attrs.src) {
            element.attr('src', defaultSrc);
        }
      });
    }
  };
})
.directive("mySrc", function() {
    return {
      link: function(scope, element, attrs) {
        var img, loadImage;
        img = null;

        loadImage = function() {

          element[0].src = "/app/img/img-loading.gif";
          element[0].style.display='none';

          img = new Image();
          img.src = attrs.mySrc;

          img.onload = function() {
            element[0].src = attrs.mySrc;
              element[0].style.display='';
          };
        };

        scope.$watch((function() {
          return attrs.mySrc;
        }), function(newVal, oldVal) {
          if (oldVal !== newVal) {
            loadImage();
          }
        });
      }
    };
  });
