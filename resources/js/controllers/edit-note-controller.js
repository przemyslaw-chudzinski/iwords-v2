module.exports = class EditNoteCtrlFactory {

    constructor($scope, notesSrv, $mdToast) {
        this._$scope = $scope;
        this._notesSrv = notesSrv;
        this._$mdToast = $mdToast;

        this._initState();
        this._init();
        this._assignTemplateFunctions();
    }

    _initState() {
        this._$scope.noteId = null;
        this._$scope.exprId = null;
        this._$scope.autosave = true;
    }

    _init() {
        this._editor = IWORDS.editors.editNoteEditor;
    }

    _assignTemplateFunctions() {
        this._$scope.handleSaveNote = this._handleSaveNote.bind(this);
    }

    _handleSaveNote() {
        this._editor && this._editor.toJSON()
            .then(output => this._saveData(this._$scope.noteId.trim(), output))
            .catch(err => console.log('something went wrong', err));
    }

    _saveData(noteId, content) {

        const config = {
            payload: {content},
            noteId
        };

        this._notesSrv.updateNote(config)
            .then(() => this._showSuccessToast())
            .catch(err => console.log('something went wrong', err));
    }

    _showSuccessToast() {
        const toast = this._$mdToast.show(
            this._$mdToast.simple()
                .textContent('Notatka została zapisana')
                .action('Zamknij')
                .hideDelay(3000));

        return toast;
    }

};
