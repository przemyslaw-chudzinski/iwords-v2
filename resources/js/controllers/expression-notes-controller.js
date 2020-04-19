const BaseController = require('./base-controller');
const {PaginationList, ToastBuilder, AddNoteManager} = require('../classes');

const defaultPagination = {
    page: 1,
    limit: 30
};

class ExpressionNotesController extends BaseController {

    constructor($scope, notesSrv, $mdDialog, $mdToast) {
        super($scope);

        // setup
        this.notesSrv = notesSrv;
        this.$mdDialog = $mdDialog;
        this.$mdToast = $mdToast;
        this._pagination = new PaginationList(defaultPagination);
        this._addNoteManager = new AddNoteManager(this.$mdDialog, this.notesSrv);

        // init state
        this.$scope.exprId = null;
        this.$scope.expression = null;
        this.$scope.notes = [];
        this.$scope.fetching = true;
        this.$scope.filterSearch = '';
        this.$scope.currentPage = this._pagination.page;

        // assign template functions
        this.$scope.handleFilterInputChange = this._handleFilterInputChange.bind(this);
        this.$scope.openNoteMenu = this._openNoteMenu.bind(this);
        this.$scope.handleAddNote = this._handleAddNote.bind(this);
        this.$scope.handleRemove = this._handleRemove.bind(this);
        this.$scope.prevPage = () => this._pagination.prevPage(this.onPageChange.bind(this));
        this.$scope.nextPage = () => this._pagination.nextPage(this.onPageChange.bind(this));
    }

    pageLoadedHook() {
        this._fetchNotes();
    }

    _fetchNotes() {
        this.notesSrv.fetchExpressionNotes({params: {page: this._pagination.page, limit: this._pagination.limit, search: this.$scope.filterSearch}, exprId: this.$scope.exprId})
            .then(this._handleFetchNotesSuccess.bind(this))
            .catch(this._handleFetchNotesError.bind(this));
    }

    onPageChange(page = 1, limit = 5) {
        this.$scope.fetching = true;
        this.notesSrv.fetchExpressionNotes({params: {page, limit, search: this.$scope.filterSearch}, exprId: this.$scope.exprId})
            .then(this._handleFetchNotesSuccess.bind(this))
            .catch(this._handleFetchNotesError.bind(this));
    }

    _handleFetchNotesSuccess(res) {
        if (res.data.total !== this._pagination.total) {
            this._pagination.total = res.data.total;
        }

        this.$scope.notes = res.data.data;
        this.$scope.fetching = false;
        this.$scope.prevPageDisable = this._pagination.page === 1 || this.$scope.fetching || this._pagination.total === 0;
        this.$scope.nextPageDisable = this._pagination.page === this._pagination.pageNumbers || this.$scope.fetching || this._pagination.total === 0;
        this.$scope.currentPage = this._pagination.page;
    }

    _handleFetchNotesError(error) {
        this.$scope.fetching = false;
        const toastBuilder = new ToastBuilder(this.$mdToast);
        toastBuilder
            .addMessage('Wystąpił problem z pobraniem notatek')
            .setSeverity('error')
            .addCloseButton('PONÓW')
            .neverHide()
            .show()
            .then(() => this._fetchNotes());
    }

    _handleFilterInputChange() {
        this.$scope.fetching = true;

        /* Reset pagination */
        this._pagination.page = defaultPagination.page;
        this._pagination.limit = defaultPagination.limit;

        this.notesSrv.fetchExpressionNotes({params: {page: this._pagination.page, limit: this._pagination.limit, search: this.$scope.filterSearch}, exprId: this.$scope.exprId})
            .then(this._handleFetchNotesSuccess.bind(this))
            .catch(this._handleFetchNotesError.bind(this));
    }

    _openNoteMenu($mdMenu, event) {
        $mdMenu.open(event);
    }

    /* Add new note UI logic */
    _handleAddNote(event) {
        const expr = {_id: this.$scope.exprId, expression: this.$scope.expression};

        this._addNoteManager.showAddNoteDialog(expr, event)
            .then(result => this._addNoteManager.saveNote(expr._id, result));
    }
    // ===========================================================================================

    /* Removing single note */
    _handleRemove(noteId, event) {
        this._showConfirmRemoveNoteDialog(event)
            .then(() => this._removeNote(noteId));
    }

    _showConfirmRemoveNoteDialog(event) {
        const confirm = this.$mdDialog.confirm()
            .title('Czy na pewno chcesz usunąć notatę?')
            .targetEvent(event)
            .ok('Tak, usuń')
            .cancel('Anuluj');

        return this.$mdDialog.show(confirm);
    }

    _removeNote(noteId) {
        const toastBuilder = new ToastBuilder(this.$mdToast);
        this.notesSrv.removeNote({noteId})
            .then(() => {
                toastBuilder
                    .setSeverity('success')
                    .addCloseButton()
                    .addMessage('Notatka została usunięta poprawnie')
                    .show();

                this._fetchNotes();
            })
            .catch(err => {
                toastBuilder
                    .addMessage('Wystąpił błąd. Notatka nie została usunięta poprawnie')
                    .addCloseButton()
                    .neverHide()
                    .setSeverity('error')
                    .show();
            });
    }
    // ===========================================================================================

}

module.exports = ExpressionNotesController;
