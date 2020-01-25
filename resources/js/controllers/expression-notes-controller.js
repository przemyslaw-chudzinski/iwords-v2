const BaseController = require('./base-controller');
const {withAddingNote} = require("../decorators");

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
        this.$scope.prevPageDisable = true;
        this.$scope.nextPageDisable = false;
        this.$scope.fetching = true;
        this.$scope.filterSearch = '';
        this.$scope.pagination = {
            page: 1,
            limit: 30
        };
    }

    assignTemplateFunctions() {
        this.$scope.nextPage = this._nextPage.bind(this);
        this.$scope.prevPage = this._prevPage.bind(this);
        this.$scope.handleFilterInputChange = this._handleFilterInputChange.bind(this);
        this.$scope.openNoteMenu = this._openNoteMenu.bind(this);
        this.$scope.handleAddNote = this._handleAddNote.bind(this);
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

    _nextPage() {
        this.$scope.pagination.page++;
        this.notesSrv.fetchExpressionNotes({params: {...this.$scope.pagination, search: this.$scope.filterSearch}, exprId: this.$scope.exprId})
            .then(this._handleFetchNotesSuccess.bind(this))
            .catch(err => {
                console.log('something went wrong');
            });
    }

    _prevPage() {
        this.$scope.pagination.page--;
        this.notesSrv.fetchExpressionNotes({params: {...this.$scope.pagination, search: this.$scope.filterSearch}, exprId: this.$scope.exprId})
            .then(this._handleFetchNotesSuccess.bind(this))
            .catch(err => {
                console.log('something went wrong');
            });
    }

    _handleFetchNotesSuccess(res) {
        this.$scope.notes = res.data.data;
        const total = res.data.total;
        /* Update pagination controls */
        const maxPageNumber = Math.ceil(res.data.total / this.$scope.pagination.limit);
        this.$scope.prevPageDisable = this.$scope.pagination.page === 1 || this.$scope.fetching || total === 0;
        this.$scope.nextPageDisable = this.$scope.pagination.page === maxPageNumber || this.$scope.fetching || total === 0;
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
        this.notesSrv.fetchExpressionNotes({params: {...this.$scope.pagination, search: this.$scope.filterSearch}, exprId: this.$scope.exprId})
            .then(res => {
                this.$scope.notes = res.data.data;
                /* Hide card overlay */
                this.$scope.fetching = false;
                /* Update pagination controls */
                const maxPageNumber = Math.ceil(res.data.total / this.$scope.pagination.limit);
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


}

module.exports = withAddingNote(ExpressionNotesCtrlFactory);
