module.exports = function YourExpressionsCtrlFactory ($scope, expressionSrv) {

    $scope.pagination = {
        page: 1,
        limit: 30
    };
    $scope.expressions = [];
    $scope.prevPageDisable = true;
    $scope.nextPageDisable = false;
    /* Show card overlay */
    $scope.fetching = true;

    expressionSrv.fetchUsersExpressions({params: {...$scope.pagination}})
        .then(res => {
            $scope.expressions = res.data.data;
            /* Update pagination controls */
            const maxPageNumber = Math.ceil(res.data.total / $scope.pagination.limit);
            $scope.prevPageDisable = $scope.pagination.page === 1;
            $scope.nextPageDisable = $scope.pagination.page === maxPageNumber;
            /* Hide card overlay */
            $scope.fetching = false;
        })
        .catch(err => {
            console.log('something went wrong');
        });

    /* Opens list menu options */
    $scope.openMenu = function ($mdMenu, ev) {
        $mdMenu.open(ev);
    };

    /* Next page */
    $scope.nextPage = function () {
        $scope.pagination.page++;
        expressionSrv.fetchUsersExpressions({params: {...$scope.pagination}})
            .then(res => {
                $scope.expressions = res.data.data;
                /* Update pagination controls */
                const maxPageNumber = Math.ceil(res.data.total / $scope.pagination.limit);
                $scope.prevPageDisable = $scope.pagination.page === 1 || $scope.fetching;
                $scope.nextPageDisable = $scope.pagination.page === maxPageNumber || $scope.fetching;
                /* Hide card overlay */
                $scope.fetching = false;
            })
            .catch(err => {
                console.log('something went wrong');
            });
    };

    /* Prev page */
    $scope.prevPage = function () {
        $scope.pagination.page--;
        expressionSrv.fetchUsersExpressions({params: {...$scope.pagination}})
            .then(res => {
                $scope.expressions = res.data.data;
                /* Update pagination controls */
                const maxPageNumber = Math.ceil(res.data.total / $scope.pagination.limit);
                $scope.prevPageDisable = $scope.pagination.page === 1 || $scope.fetching;
                $scope.nextPageDisable = $scope.pagination.page === maxPageNumber || $scope.fetching;
                /* Hide card overlay */
                $scope.fetching = false;
            })
            .catch(err => {
                console.log('something went wrong');
            });

    };

};
