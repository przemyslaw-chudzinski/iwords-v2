const ServiceBase = require('./service-base');

/* Expression service */
class ExpressionService extends ServiceBase {
    constructor(http) {
        super();
        this.http = http;
        this.prefix = '/api/expressions';
    }

    fetchExpression() {
        return this.http.get(this.prefix + '/expression', {userId: this.userId});
    }

    fetchExpressions(onlyRepeats = false) {
        return this.http.get(this.prefix + '/expressions', {params: {onlyRepeats, userId: this.userId}});
    }

    incrementAnswersCounter(expressionId, correct = true) {
        return this.http.post(this.prefix + '/expression/' + expressionId + '/increment-counter', {correct});
    }

    fetchRepeatCount() {
        return this.http.get(this.prefix + '/repeat-count', {params: {userId: this.userId}});
    }

    fetchUsersExpressions(ctx = {params: {}}) {
        const queryParams = {
            page: 1,
            search: '',
            ...ctx.params
        };
        return this.http.get(this.prefix + '/user-expressions', {params: {userId: this.userId, ...queryParams}});
    }

    resetRepeatMode() {
        return this.http.post(this.prefix + '/reset-repeat-mode', {userId: this.userId});
    }

    fetchExpressionsInRepeatMode(ctx = {params: {}}) {
        const queryParams = {
            page: 1,
            ...ctx.params
        };
        return this.http.get(this.prefix + '/repeat-mode', {params: {userId: this.userId, ...queryParams}});
    }

    removeExpressionFromRepeatMode(ctx = {}) {
        return this.http.post(this.prefix + `/${ctx.exprId}/remove-from-repeat-mode`, {userId: this.userId});
    }

    toggleExpressionRepeatMode(ctx = {}) {
        const _ctx = {
            exprId: null,
            ...ctx
        };
        return this.http.put(this.prefix + `/${_ctx.exprId}`, {userId: this.userId});
    }
}

module.exports = function ExpressionSrvFactory($http) {
    return new ExpressionService($http);
};
