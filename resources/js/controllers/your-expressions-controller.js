const BaseController = require('./base-controller');
const {PaginationList, ToastBuilder} = require('../classes');

const defaultPagination = {
    page: 1,
    limit: 30
};

class YourExpressionsController extends BaseController {

    constructor($scope, expressionSrv, notesSrv, $mdToast, $mdDialog) {
        super($scope);

        // setup
        this.expressionSrv = expressionSrv;
        this.notesSrv = notesSrv;
        this.$mdToast = $mdToast;
        this.$mdDialog = $mdDialog;
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
        this.$scope.handleRemoveExpression = this._handleRemoveExpression.bind(this);
        this.$scope.goToNotes = expr => window.location.href = `/app/notes/expression/${expr._id}`;
    }

    pageLoadedHook() {
        this._fetchUsersExpressions();
    }

    _fetchUsersExpressions() {
        this.$scope.fetching = true;
        this.expressionSrv.fetchUsersExpressions({params: {page: this._pagination.page, limit: this._pagination.limit, search: this.$scope.filterSearch}})
            .then(this._handleFetchExpressionSuccess.bind(this))
            .catch(this._handleFetchingExpressionsError.bind(this));
    }

    /* List pagination */
    onPageChange(page = 1, limit = 5) {
        this.$scope.fetching = true;
        this.expressionSrv.fetchUsersExpressions({params: {page, limit, search: this.$scope.filterSearch}})
            .then(this._handleFetchExpressionSuccess.bind(this))
            .catch(this._handleFetchingExpressionsError.bind(this));
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
            .catch(this._handleFetchingExpressionsError.bind(this));
    }

    /* Add new note UI logic */
    _handleAddNote(expression, event) {
        const expr = {_id: expression._id, expression: expression.expression};
        this.notesSrv.showAddNoteDialog(expr, event);
    }
    // ===========================================================================================

    _handleToggleExpressionRepeatMode(expr, event) {

        const toastBuilder = new ToastBuilder(this.$mdToast);

        this.expressionSrv.toggleExpressionRepeatMode({exprId: expr._id})
            .then(() => {
                const index = this.$scope.expressions.findIndex(item => item._id === expr._id);
                const textContent = expr.inRepeatState
                    ? `Wyrażenie ${expr.expression} zostało usunięte z powtórek` :
                    `Wyrażenie ${expr.expression} zostało dodane do powtórek`;

                if (index !== -1) {
                    this.$scope.expressions[index].inRepeatState = !this.$scope.expressions[index].inRepeatState;
                }

                toastBuilder
                    .setSeverity('success')
                    .addMessage(textContent)
                    .addCloseButton()
                    .neverHide()
                    .show();


            })
            .catch(err => {
                toastBuilder
                    .setSeverity('error')
                    .addMessage('Wystąpił błąd podczas zmiany statusu wyrażenia')
                    .addCloseButton()
                    .show();
            });
    }

    _handleRemoveExpression(expression, event) {
        const confirmDialog = this.$mdDialog.confirm()
            .title('Czy na pewno chcesz usunąć to wyrażenie?')
            .textContent('Ta operacja usunie wyrażenie oraz wszystkie powiązane z nią materiały, notatki itp')
            .targetEvent(event)
            .ok('Tak, usuń wyrażenie')
            .cancel('Anuluj');

        const toastBuilder = new ToastBuilder(this.$mdToast);

        this.$mdDialog.show(confirmDialog)
            .then(() => this.expressionSrv.removeExpression({exprId: expression._id}))
            .then(() => {
                this.$scope.expressions = this.$scope.expressions.filter(expr => expr._id !== expression._id);
                toastBuilder
                    .addMessage(`Wyrażenie ${expression.expression} zostało usunięte poprawnie`)
                    .addCloseButton()
                    .setSeverity('success')
                    .show();
            })
            .catch(err => {
                toastBuilder
                    .addMessage(`Wystąpił błąd podczas usuwania wyrażenia ${expression.expression}`)
                    .addCloseButton()
                    .setSeverity('error')
                    .show();
            });
    }

    _handleFetchingExpressionsError(error) {
        this.$scope.fetching = false;
        const toastBuilder = new ToastBuilder(this.$mdToast);
        toastBuilder
            .addCloseButton('ODŚWIERZ')
            .addMessage('Wystąpił nieoczekiwany problem z probraniem wyrażeń')
            .setSeverity('error')
            .neverHide()
            .show()
            .then(() => this._fetchUsersExpressions())
    }

}

module.exports = YourExpressionsController;
