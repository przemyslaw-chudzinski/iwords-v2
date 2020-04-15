const BaseController = require('./base-controller');

class EditNoteController extends BaseController {

    constructor($scope, notesSrv, $mdToast) {
        super($scope);

        // setup
        this.notesSrv = notesSrv;
        this.$mdToast = $mdToast;

        // init state
        this.$scope.noteId = null;
        this.$scope.exprId = null;
        this.$scope.content = null;
        this.$scope.saving = false;

        // assign template functions
        this.$scope.handleSaveNote = this._handleSaveNote.bind(this);
    }

    pageLoadedHook() {
        IWORDS.editors.editNoteEditor.init(this.$scope.content);
    }

    _handleSaveNote() {
        this.$scope.saving = true;
        IWORDS.editors.editNoteEditor.toJSON()
            .then(output => this._saveData(this.$scope.noteId.trim(), output))
            .catch(err => console.log('something went wrong', err));
    }

    _saveData(noteId, content) {

        const config = {
            payload: {content},
            noteId
        };

        this.notesSrv.updateNote(config)
            .then(() => {
                console.log('here');
                this.$scope.saving = false;
                this._showSuccessToast();
            })
            .catch(err => console.log('something went wrong', err));
    }

    _showSuccessToast() {
        const toast = this.$mdToast.show(
            this.$mdToast.simple()
                .textContent('Notatka została zapisana')
                .action('Zamknij')
                .position('top right')
                .hideDelay(3000));

        return toast;
    }

}

module.exports = EditNoteController;
