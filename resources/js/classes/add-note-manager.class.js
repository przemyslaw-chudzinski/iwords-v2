class AddNoteManager {

    constructor($mdDialog, notesSrv) {
        this.$mdDialog = $mdDialog;
        this.notesSrv = notesSrv;
    }

    showAddNoteDialog(expr, event) {
        const confirm = this.$mdDialog.prompt()
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

        return this.$mdDialog.show(confirm);
    }

    saveNote(exprId, title) {
        const ctx = {
            exprId,
            title
        };
        return this.notesSrv.saveNote(ctx)
            .then(res => {
                this.saveNoteSuccess(res.data.noteId, exprId);
            })
            .catch(err => {
                console.log('something went wrong', err);
                next(err);
                this.saveNoteFailure(err, exprId)
            });
    }

    saveNoteSuccess(noteId, exprId) {
        window.location.href = `/app/notes/${noteId}/${exprId}`;
    }

    saveNoteFailure(err, exprId) {
        // Handle save note error
    }

}

module.exports = AddNoteManager;
