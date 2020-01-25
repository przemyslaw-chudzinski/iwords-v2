const ServiceBase = require('./service-base');

/* Statistics service */
class NotesService extends ServiceBase {

    constructor(http) {
        super();
        this.http = http;
        this.prefix = '/api/notes';
    }

    saveNote(ctx = {}) {
        const payload = {
            title: null,
            ...ctx,
            userId: this.userId
        };
        return this.http.post(this.prefix, payload);
    }

    updateNote(ctx = {noteId: null, payload: {}}) {

        const payload = {
            title: null,
            content: null,
            ...ctx.payload,
            userId: this.userId
        };

        return this.http.post(this.prefix + `/${ctx.noteId}`, payload);
    }

    fetchExpressionNotes(ctx = {params: {}, exprId: null}) {
        const queryParams = {
            page: 1,
            search: '',
            ...ctx.params
        };
        return this.http.get(this.prefix + `/${ctx.exprId}`, {params: {userId: this.userId, ...queryParams}});
    }

    removeNote(ctx = {}) {
        const _ctx = {
            noteId: null,
            ...ctx
        };
        return this.http.delete(this.prefix + `/${_ctx.noteId}`, {params: {userId: this.userId}});
    }


}

module.exports = function NotesSrvFactory($http) {
    return new NotesService($http);
};
