module.exports = class YourExpressionsCtrlFactory {

    constructor($scope, expressionSrv, $mdDialog, notesSrv) {
        this._$scope = $scope;
        this._expressionSrv = expressionSrv;
        this._$mdDialog = $mdDialog;
        this._notesSrv = notesSrv;

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
        this._$scope.openExprMenu = this._openExprMenu.bind(this);
        this._$scope.handleAddNote = this._handleAddNote.bind(this);
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

    _openExprMenu($mdMenu, event) {
        $mdMenu.open(event);
    }

    _showAddNoteDialog(expr, event) {
        const confirm = this._$mdDialog.prompt()
            .title('Nowy dokument')
            .textContent(`
                Dodajesz notatkę dla wyrażenia ${expr.expression}.
                Po utworzeniu zostaniesz przekierowany do edytora, gdzie będziesz mógł edytować dokument
            `)
            .placeholder('Nazwa dokumentu')
            .targetEvent(event)
            .required(true)
            .ok('Utwórz')
            .cancel('Anuluj');

        return this._$mdDialog.show(confirm)
    }

    _handleAddNote(expr, event) {
        this._showAddNoteDialog(expr, event)
            .then(result => {
                this._saveNote(expr._id,result,err => {
                    if (err) {
                        return;
                    }
                    // TODO: Redirect to edit page
                });
            }, () => {});
    }

    _saveNote(exprId, title, next) {
        next = next || function () {};
        const ctx = {
            exprId,
            payload: {title}
        };
        this._notesSrv.saveNote(ctx)
            .then(() => next(null))
            .catch(err => {
                console.log('something went wrong', err);
                next(err);
            });
    }

};
