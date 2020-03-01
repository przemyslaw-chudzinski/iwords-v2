const BaseController = require('./base-controller');
const {PaginationList} = require('../classes');

const defaultPagination = {
    page: 1,
    limit: 5
};

class YourExpressionsController extends BaseController {

    constructor($scope, expressionSrv, notesSrv, $mdToast) {
        super($scope);

        // setup
        this.expressionSrv = expressionSrv;
        this.notesSrv = notesSrv;
        this.$mdToast = $mdToast;
        this._pagination = new PaginationList(defaultPagination);

        // init state
        this.$scope.expressions = [];
        this.$scope.fetching = true;
        this.$scope.filterSearch = '';
        this.$scope.currentPage = this._pagination.page;

        // assign template functions
        this.$scope.handleFilterInputChange = this._handleFilterInputChange.bind(this);
        this.$scope.openExprMenu = ($mdMenu, event) => $mdMenu.open(event);
        this.$scope.handleAddNote = this._handleAddNote.bind(this);
        this.$scope.handleToggleExpressionRepeatMode = this._handleToggleExpressionRepeatMode.bind(this);

        this.$scope.prevPage = () => this._pagination.prevPage(this.onPageChange.bind(this));
        this.$scope.nextPage = () => this._pagination.nextPage(this.onPageChange.bind(this));
    }

    pageLoadedHook() {
        this._fetchUsersExpressions();
    }

    _fetchUsersExpressions() {
        this.expressionSrv.fetchUsersExpressions({params: {page: this._pagination.page, limit: this._pagination.limit, search: this.$scope.filterSearch}})
            .then(this._handleFetchExpressionSuccess.bind(this))
            .catch(err => {
                console.log('something went wrong');
            });
    }

    /* List pagination */
    onPageChange(page = 1, limit = 5) {
        this.$scope.fetching = true;
        this.expressionSrv.fetchUsersExpressions({params: {page, limit, search: this.$scope.filterSearch}})
            .then(this._handleFetchExpressionSuccess.bind(this))
            .catch(err => {
                console.log('something went wrong');
            });
    }
    // ===========================================================================================

    _handleFetchExpressionSuccess(res) {
        // When total has changed then update pagination total
        if (res.data.total !== this._pagination.total) {
            this._pagination.total = res.data.total;
        }
        this.$scope.expressions = res.data.data;
        this.$scope.fetching = false;
        this.$scope.prevPageDisable = this._pagination.page === 1 || this.$scope.fetching || this._pagination.total === 0;
        this.$scope.nextPageDisable = this._pagination.page === this._pagination.pageNumbers || this.$scope.fetching || this._pagination.total === 0;
        this.$scope.currentPage = this._pagination.page;
    }

    _handleFilterInputChange() {
        this.$scope.fetching = true;

        /* Reset pagination */
        this._pagination.page = defaultPagination.page;
        this._pagination.limit = defaultPagination.limit;

        this.expressionSrv.fetchUsersExpressions({params: {page: this._pagination.page, limit: this._pagination.limit, search: this.$scope.filterSearch}})
            .then(this._handleFetchExpressionSuccess.bind(this))
            .catch(err => {
                console.log('something went wrong');
            });
    }

    /* Add new note UI logic */
    _handleAddNote(expression, event) {
        const expr = {_id: expression._id, expression: expression.expression};
        this.notesSrv.showAddNoteDialog(expr, event);
    }
    // ===========================================================================================

    _handleToggleExpressionRepeatMode(expr, event) {
        this.expressionSrv.toggleExpressionRepeatMode({exprId: expr._id})
            .then(() => {
                const index = this.$scope.expressions.findIndex(item => item._id === expr._id);
                const textContent = expr.inRepeatState ? 'Wyrażenie zostało dodane do powtórek' : 'Wyrażenie zostało usunięte z powtórek';

                if (index !== -1) {
                    this.$scope.expressions[index].inRepeatState = !this.$scope.expressions[index].inRepeatState;
                }

                this.$mdToast.show(
                    this.$mdToast
                        .simple()
                        .textContent(textContent)
                        .hideDelay(3000)
                );

            })
            .catch(err => console.log('something went wrong', err));
    }

}

module.exports = YourExpressionsController;
