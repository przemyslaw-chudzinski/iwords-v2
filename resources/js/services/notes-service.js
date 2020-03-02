const ServiceBase = require('./service-base');

class NotesService extends ServiceBase {

    constructor(http, $mdDialog) {
        super();
        this._http = http;
        this._$mdDialog = $mdDialog;
        this._prefix = '/api/notes';
    }

    saveNote(ctx = {}) {
        const payload = {
            title: null,
            ...ctx,
            userId: this.userId
        };
        return this._http.post(this._prefix, payload);
    }

    updateNote(ctx = {noteId: null, payload: {}}) {

        const payload = {
            title: null,
            content: null,
            ...ctx.payload,
            userId: this.userId
        };

        return this._http.post(this._prefix + `/${ctx.noteId}`, payload);
    }

    fetchExpressionNotes(ctx = {params: {}, exprId: null}) {
        const queryParams = {
            page: 1,
            search: '',
            ...ctx.params
        };
        return this._http.get(this._prefix + `/${ctx.exprId}`, {params: {userId: this.userId, ...queryParams}});
    }

    removeNote(ctx = {}) {
        const _ctx = {
            noteId: null,
            ...ctx
        };
        return this._http.delete(this._prefix + `/${_ctx.noteId}`, {params: {userId: this.userId}});
    }

    showAddNoteDialog(expr, event, callback = () => {}) {
        const confirm = this._$mdDialog.prompt()
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

        return this._$mdDialog.show(confirm)
            .then(title => this.saveNote({exprId: expr._id, title}))
            .then(res => this._saveNoteSuccess(res.data.noteId, expr._id))
            .catch(err => callback(err));
    }

    _saveNoteSuccess(noteId, exprId) {
        window.location.href = `/app/notes/${noteId}/${exprId}`;
    }
}

module.exports = function NotesSrvFactory($http, $mdDialog) {
    return new NotesService($http, $mdDialog);
};
