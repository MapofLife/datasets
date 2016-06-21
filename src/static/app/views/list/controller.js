angular.module('mol.controllers')
    .controller('molDatasetsListCtrl', ['$scope', '$rootScope', '$state', 'molApi',
        function($scope, $rootScope, $state, molApi) {
            $scope.loading = true;
            $scope.dslist = [];
            $scope.activeTabIndex = 0;
            molApi({
                "service": "datasets/list",
                "version": "1.0",
                "loading": true
            }).then(function(result) {
                $scope.dslist = result.data;
                $scope.loading = false;
            });
        }
    ]);
