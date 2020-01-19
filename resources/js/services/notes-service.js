const ServiceBase = require('./service-base');

/* Statistics service */
class NotesService extends ServiceBase {

    constructor(http) {
        super();
        this.http = http;
        this.prefix = '/api/notes';
    }

    saveNote(ctx = {exprId: null, payload: {title: null}}) {
        const payload = {
            title: null,
            ...ctx.payload,
            userId: this.userId
        };
        return this.http.post(this.prefix + `/${ctx.exprId}`, payload);
    }
}

module.exports = function NotesSrvFactory($http) {
    return new NotesService($http);
};
