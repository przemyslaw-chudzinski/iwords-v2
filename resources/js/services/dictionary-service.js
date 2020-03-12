const ServiceBase = require('./service-base');

/* Dictionary service */
class DictionaryService extends ServiceBase {
    constructor(http) {
        super();
        this._http = http;
        this._prefix = '/api/dictionary';
    }

    /**
     * @desc It searches the expressions by expression name
     * @param ctx
     * @return {*}
     */
    searchExpressions(ctx = {}) {
        const _ctx = {
            searchText: '',
            ...ctx
        };
        return this._http.get(this._prefix + '/search', {params: {searchText: _ctx.searchText, userId: this.userId}});
    }
}

module.exports = function DictionarySrvFactory($http) {
    return new DictionaryService($http);
};
