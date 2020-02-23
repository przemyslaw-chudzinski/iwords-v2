const BaseController = require('./base-controller');
const {withAddingNote, withListPagination} = require("../decorators");

class YourExpressionsCtrlFactory extends BaseController {

    constructor($scope, expressionSrv, $mdDialog, notesSrv, $mdToast) {
        super($scope);
        this.expressionSrv = expressionSrv;
        this.$mdDialog = $mdDialog;
        this.notesSrv = notesSrv;
        this.$mdToast = $mdToast;
    }

    initState() {
        super.initState();
        this.$scope.expressions = [];
        this.$scope.fetching = true;
        this.$scope.filterSearch = '';
    }

    pageLoadedHook() {
        this._fetchUsersExpressions();
    }

    assignTemplateFunctions() {
        this.$scope.handleFilterInputChange = this._handleFilterInputChange.bind(this);
        this.$scope.openExprMenu = this._openExprMenu.bind(this);
        this.$scope.handleAddNote = this._handleAddNote.bind(this);
        this.$scope.handleToggleExpressionRepeatMode = this._handleToggleExpressionRepeatMode.bind(this);
    }

    _fetchUsersExpressions() {
        this.expressionSrv.fetchUsersExpressions({params: {...this.$scope.pagination}})
            .then(res => {
                this.$scope.expressions = res.data.data;
                /* Update pagination controls */
                const maxPageNumber = this.calculateMaxPageNumber(res.data.total);
                this.$scope.prevPageDisable = this.$scope.pagination.page === 1;
                this.$scope.nextPageDisable = this.$scope.pagination.page === maxPageNumber;
                /* Hide card overlay */
                this.$scope.fetching = false;
            })
            .catch(err => {
                console.log('something went wrong');
            });
    }

    /* List pagination */
    onNextPage(pagination) {
        this.expressionSrv.fetchUsersExpressions({params: {...pagination, search: this.$scope.filterSearch}})
            .then(this._handleFetchUsersExpressions.bind(this))
            .catch(err => {
                console.log('something went wrong');
            });
    }

    onPrevPage(pagination) {
        this.expressionSrv.fetchUsersExpressions({params: {...pagination, search: this.$scope.filterSearch}})
            .then(this._handleFetchUsersExpressions.bind(this))
            .catch(err => {
                console.log('something went wrong');
            });
    }
    // ===========================================================================================

    _handleFetchUsersExpressions(res) {
        this.$scope.expressions = res.data.data;
        const total = res.data.total;
        /* Update pagination controls */
        const maxPageNumber = this.calculateMaxPageNumber(res.data.total);
        this.$scope.prevPageDisable = this.pagination.page === 1 || this.$scope.fetching || total === 0;
        this.$scope.nextPageDisable = this.pagination.page === maxPageNumber || this.$scope.fetching || total === 0;
        /* Hide card overlay */
        this.$scope.fetching = false;
    }

    _handleFilterInputChange() {
        this.$scope.fetching = true;
        /* Reset pagination */
        this.$scope.pagination = {
            page: 1,
            limit: 30
        };
        this.expressionSrv.fetchUsersExpressions({params: {...this.$scope.pagination, search: this.$scope.filterSearch}})
            .then(res => {
                this.$scope.expressions = res.data.data;
                /* Hide card overlay */
                this.$scope.fetching = false;
                /* Update pagination controls */
                const maxPageNumber = this.calculateMaxPageNumber(res.data.total);
                this.$scope.prevPageDisable = this.pagination.page === 1 || this.$scope.fetching;
                this.$scope.nextPageDisable = this.pagination.page === maxPageNumber || this.$scope.fetching;
            })
            .catch(err => {
                console.log('something went wrong');
            });
    }

    _openExprMenu($mdMenu, event) {
        $mdMenu.open(event);
    }

    /* Add new note UI logic */
    _handleAddNote(expression, event) {
        const expr = {_id: expression._id, expression: expression.expression};

        this.showAddNoteDialog(expr, event)
            .then(result => this.saveNote(expr._id, result));
    }
    // ===========================================================================================

    _toggleExpressionRepeatMode(expr) {
        this.expressionSrv.toggleExpressionRepeatMode({exprId: expr._id})
            .then(() => {

                const index = this.$scope.expressions.findIndex(item => item._id === expr._id);

                if (index !== -1) {
                    this.$scope.expressions[index].inRepeatState = !this.$scope.expressions[index].inRepeatState;
                }

                const textContent = expr.inRepeatState ? 'Wyrażenie zostało dodane do powtórek' : 'Wyrażenie zostało usunięte z powtórek';

                this.$mdToast.show(
                    this.$mdToast
                        .simple()
                        .textContent(textContent)
                        .hideDelay(3000)
                );

            })
            .catch(err => console.log('something went wrong', err));
    }

    _handleToggleExpressionRepeatMode(expr, event) {
        this._toggleExpressionRepeatMode(expr);
    }

}

module.exports = withAddingNote(withListPagination(YourExpressionsCtrlFactory));
