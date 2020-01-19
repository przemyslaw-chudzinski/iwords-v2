module.exports = class YourExpressionsCtrlFactory {

    constructor($scope, expressionSrv) {
        this._$scope = $scope;
        this._expressionSrv = expressionSrv;

        this._initState();
        this._init();
        this._assignTemplateFunctions();
    }

    _initState() {
        this._$scope.pagination = {
            page: 1,
            limit: 30
        };
        this._$scope.expressions = [];
        this._$scope.prevPageDisable = true;
        this._$scope.nextPageDisable = false;
        this._$scope.fetching = true;
        this._$scope.filterSearch = '';
    }

    _init() {
        this._fetchUsersExpressions();
    }

    _assignTemplateFunctions() {
        this._$scope.nextPage = this._nextPage.bind(this);
        this._$scope.prevPage = this._prevPage.bind(this);
        this._$scope.handleFilterInputChange = this._handleFilterInputChange.bind(this);
    }

    _fetchUsersExpressions() {
        this._expressionSrv.fetchUsersExpressions({params: {pagination: this._$scope.pagination}})
            .then(res => {
                this._$scope.expressions = res.data.data;
                /* Update pagination controls */
                const maxPageNumber = Math.ceil(res.data.total / this._$scope.pagination.limit);
                this._$scope.prevPageDisable = this._$scope.pagination.page === 1;
                this._$scope.nextPageDisable = this._$scope.pagination.page === maxPageNumber;
                /* Hide card overlay */
                this._$scope.fetching = false;
            })
            .catch(err => {
                console.log('something went wrong');
            });
    }

    _nextPage() {
        this._$scope.pagination.page++;
        this._expressionSrv.fetchUsersExpressions({params: {...this._$scope.pagination, search: this._$scope.filterSearch}})
            .then(this._handleFetchUsersExpressions.bind(this))
            .catch(err => {
                console.log('something went wrong');
            });
    }

    _prevPage() {
        this._$scope.pagination.page--;
        this._expressionSrv.fetchUsersExpressions({params: {...this._$scope.pagination, search: this._$scope.filterSearch}})
            .then(this._handleFetchUsersExpressions.bind(this))
            .catch(err => {
                console.log('something went wrong');
            });
    }

    _handleFetchUsersExpressions(res) {
        this._$scope.expressions = res.data.data;
        const total = res.data.total;
        /* Update pagination controls */
        const maxPageNumber = Math.ceil(res.data.total / this._$scope.pagination.limit);
        this._$scope.prevPageDisable = this._$scope.pagination.page === 1 || this._$scope.fetching || total === 0;
        this._$scope.nextPageDisable = this._$scope.pagination.page === maxPageNumber || this._$scope.fetching || total === 0;
        /* Hide card overlay */
        this._$scope.fetching = false;
    }

    _handleFilterInputChange() {
        this._$scope.fetching = true;
        /* Reset pagination */
        this._$scope.pagination = {
            page: 1,
            limit: 30
        };
        this._expressionSrv.fetchUsersExpressions({params: {...this._$scope.pagination, search: this._$scope.filterSearch}})
            .then(res => {
                this._$scope.expressions = res.data.data;
                /* Hide card overlay */
                this._$scope.fetching = false;
                /* Update pagination controls */
                const maxPageNumber = Math.ceil(res.data.total / this._$scope.pagination.limit);
                this._$scope.prevPageDisable = this._$scope.pagination.page === 1 || this._$scope.fetching;
                this._$scope.nextPageDisable = this._$scope.pagination.page === maxPageNumber || this._$scope.fetching;
            })
            .catch(err => {
                console.log('something went wrong');
            });
    }

}
