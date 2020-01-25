const BaseController = require('./base-controller');
const {withAddingNote, withListPagination} = require("../decorators");

class ExpressionNotesCtrlFactory extends BaseController {

    constructor($scope, notesSrv, $mdDialog) {
        super($scope);
        this.notesSrv = notesSrv;
        this.$mdDialog = $mdDialog;
    }

    initState() {
        super.initState();
        this.$scope.exprId = null;
        this.$scope.expression = null;
        this.$scope.notes = [];
        this.$scope.fetching = true;
        this.$scope.filterSearch = '';
    }

    assignTemplateFunctions() {
        this.$scope.handleFilterInputChange = this._handleFilterInputChange.bind(this);
        this.$scope.openNoteMenu = this._openNoteMenu.bind(this);
        this.$scope.handleAddNote = this._handleAddNote.bind(this);
        this.$scope.handleRemove = this._handleRemove.bind(this);
    }

    pageLoadedHook() {
        this._fetchNotes();
    }

    _fetchNotes() {
        this.notesSrv.fetchExpressionNotes({params: {...this.$scope.pagination}, exprId: this.$scope.exprId})
            .then(res => {
                this.$scope.notes = res.data.data;
                /* Update pagination controls */
                const maxPageNumber = Math.ceil(res.data.total / this.$scope.pagination.limit);
                this.$scope.prevPageDisable = this.$scope.pagination.page === 1;
                this.$scope.nextPageDisable = this.$scope.pagination.page === maxPageNumber;
                /* Hide card overlay */
                this.$scope.fetching = false;
            })
            .catch(err => {
                console.log('something went wrong');
            });
    }

    onNextPage(pagination) {
        this.notesSrv.fetchExpressionNotes({params: {...pagination, search: this.$scope.filterSearch}, exprId: this.$scope.exprId})
            .then(this._handleFetchNotesSuccess.bind(this))
            .catch(err => {
                console.log('something went wrong');
            });
    }

    onPrevPage(pagination) {
        this.notesSrv.fetchExpressionNotes({params: {...pagination, search: this.$scope.filterSearch}, exprId: this.$scope.exprId})
            .then(this._handleFetchNotesSuccess.bind(this))
            .catch(err => {
                console.log('something went wrong');
            });
    }

    _handleFetchNotesSuccess(res) {
        this.$scope.notes = res.data.data;
        const total = res.data.total;
        /* Update pagination controls */
        const maxPageNumber = this.calculateMaxPageNumber(total);
        this.$scope.prevPageDisable = this.$scope.pagination.page === 1 || this.$scope.fetching || total === 0;
        this.$scope.nextPageDisable = this.$scope.pagination.page === maxPageNumber || this.$scope.fetching || total === 0;
        /* Hide card overlay */
        this.$scope.fetching = false;
    }

    _handleFilterInputChange() {
        this.$scope.fetching = true;
        /* Reset pagination */
        this.resetPagination();
        this.notesSrv.fetchExpressionNotes({params: {...this.$scope.pagination, search: this.$scope.filterSearch}, exprId: this.$scope.exprId})
            .then(res => {
                this.$scope.notes = res.data.data;
                /* Hide card overlay */
                this.$scope.fetching = false;
                /* Update pagination controls */
                const maxPageNumber = this.calculateMaxPageNumber(red.data.total);
                this.$scope.prevPageDisable = this.$scope.pagination.page === 1 || this.$scope.fetching;
                this.$scope.nextPageDisable = this.$scope.pagination.page === maxPageNumber || this.$scope.fetching;
            })
            .catch(err => {
                console.log('something went wrong');
            });
    }

    _openNoteMenu($mdMenu, event) {
        $mdMenu.open(event);
    }

    /* Add new note UI logic */
    _handleAddNote(event) {
        const expr = {_id: this.$scope.exprId, expression: this.$scope.expression};

        this.showAddNoteDialog(expr, event)
            .then(result => this.saveNote(expr._id, result));
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
        this.notesSrv.removeNote({noteId})
            .then(() => this._fetchNotes())
            .catch(err => console.log('something went wrong', err))
    }
    // ===========================================================================================

}

module.exports = withAddingNote(
    withListPagination(ExpressionNotesCtrlFactory)
);
