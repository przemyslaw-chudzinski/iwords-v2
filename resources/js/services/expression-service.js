const ServiceBase = require('./service-base');

/* Expression service */
class ExpressionService extends ServiceBase {
    constructor(http) {
        super();
        this._http = http;
        this._prefix = '/api/expressions';
    }

    fetchExpression() {
        return this._http.get(this._prefix + '/expression', {userId: this.userId});
    }

    fetchExpressions(ctx = {}) {
        const _ctx = {
            onlyRepeats: false,
            ...ctx
        };
        return this._http.get(this._prefix + '/expressions', {params: {onlyRepeats: _ctx.onlyRepeats, userId: this.userId}});
    }

    incrementAnswersCounter(ctx = {}) {
        const _ctx = {
            expressionId: null,
            correct: true,
            ...ctx
        };

        if (!_ctx.expressionId) {
            throw new Error('Missing expressionId value');
        }

        return this._http.post(this._prefix + '/expression/' + _ctx.expressionId + '/increment-counter', {correct: _ctx.correct});
    }

    fetchRepeatCount() {
        return this._http.get(this._prefix + '/repeat-count', {params: {userId: this.userId}});
    }

    fetchUsersExpressions(ctx = {params: {}}) {
        const queryParams = {
            page: 1,
            search: '',
            ...ctx.params
        };
        return this._http.get(this._prefix + '/user-expressions', {params: {userId: this.userId, ...queryParams}});
    }

    resetRepeatMode() {
        return this._http.post(this._prefix + '/reset-repeat-mode', {userId: this.userId});
    }

    fetchExpressionsInRepeatMode(ctx = {params: {}}) {
        const queryParams = {
            page: 1,
            ...ctx.params
        };
        return this._http.get(this._prefix + '/repeat-mode', {params: {userId: this.userId, ...queryParams}});
    }

    removeExpressionFromRepeatMode(ctx = {}) {
        return this._http.post(this._prefix + `/${ctx.exprId}/remove-from-repeat-mode`, {userId: this.userId});
    }

    toggleExpressionRepeatMode(ctx = {}) {
        const _ctx = {
            exprId: null,
            ...ctx
        };
        return this._http.put(this._prefix + `/${_ctx.exprId}`, {userId: this.userId});
    }
}

module.exports = function ExpressionSrvFactory($http) {
    return new ExpressionService($http);
};
