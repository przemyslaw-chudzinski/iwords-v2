const BaseController = require('./base-controller');
const {ToastBuilder, Speech} = require('../classes');

class EditNoteController extends BaseController {

    constructor($scope, notesSrv, $mdToast) {
        super($scope);

        // setup
        this.notesSrv = notesSrv;
        this.$mdToast = $mdToast;
        this._speech = new Speech();

        // init state
        this.$scope.noteId = null;
        this.$scope.exprId = null;
        this.$scope.content = null;
        this.$scope.saving = false;
        this.$scope.canSpeak = this._speech.checkSupport();
        this.$scope.expressionTxt = null

        // assign template functions
        this.$scope.handleSaveNote = this._handleSaveNote.bind(this);
        this.$scope.speak = () => this.$scope.expressionTxt && this._speech.speak(this.$scope.expressionTxt);
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

        const toastBuilder = new ToastBuilder(this.$mdToast);

        this.notesSrv.updateNote(config)
            .then(() => {
                this.$scope.saving = false;

                toastBuilder
                    .setSeverity('success')
                    .addMessage('Notatka została zapisana')
                    .addCloseButton()
                    .setHideDelay(2000)
                    .show();

            })
            .catch(err => {
                toastBuilder
                    .setSeverity('error')
                    .addMessage('Wystąpił błąd podczas zapisu notatki')
                    .addCloseButton()
                    .neverHide()
                    .show();
            });
    }

}

module.exports = EditNoteController;
