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
    /* Filter search */
    $scope.filterSearch = '';

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
        expressionSrv.fetchUsersExpressions({params: {...$scope.pagination, search: $scope.filterSearch}})
            .then(res => {
                $scope.expressions = res.data.data;
                const total = res.data.total;
                /* Update pagination controls */
                const maxPageNumber = Math.ceil(res.data.total / $scope.pagination.limit);
                $scope.prevPageDisable = $scope.pagination.page === 1 || $scope.fetching || total === 0;
                $scope.nextPageDisable = $scope.pagination.page === maxPageNumber || $scope.fetching || total === 0;
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
        expressionSrv.fetchUsersExpressions({params: {...$scope.pagination, search: $scope.filterSearch}})
            .then(res => {
                $scope.expressions = res.data.data;
                const total = res.data.total;
                /* Update pagination controls */
                const maxPageNumber = Math.ceil(res.data.total / $scope.pagination.limit);
                $scope.prevPageDisable = $scope.pagination.page === 1 || $scope.fetching || total === 0;
                $scope.nextPageDisable = $scope.pagination.page === maxPageNumber || $scope.fetching || total === 0;
                /* Hide card overlay */
                $scope.fetching = false;
            })
            .catch(err => {
                console.log('something went wrong');
            });

    };

    /* Filter input change handler */
    $scope.handleFilterInputChange = function () {
        // console.log($scope.filterSearch);
        $scope.fetching = true;
        /* Reset pagination */
        $scope.pagination = {
            page: 1,
            limit: 30
        };
        expressionSrv.fetchUsersExpressions({params: {...$scope.pagination, search: $scope.filterSearch}})
            .then(res => {
                $scope.expressions = res.data.data;
                /* Hide card overlay */
                $scope.fetching = false;
                /* Update pagination controls */
                const maxPageNumber = Math.ceil(res.data.total / $scope.pagination.limit);
                $scope.prevPageDisable = $scope.pagination.page === 1 || $scope.fetching;
                $scope.nextPageDisable = $scope.pagination.page === maxPageNumber || $scope.fetching;
            })
            .catch(err => {
                console.log('something went wrong');
            });
    };

};
