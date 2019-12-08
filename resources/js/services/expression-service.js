const ServiceBase = require('./service-base');

/* Expression service */
class ExpressionService extends ServiceBase {
    constructor(http) {
        super();
        this.http = http;
    }

    fetchExpression() {
        return this.http.get('/api/expressions/expression', {userId: this.userId});
    }

    fetchExpressions(onlyRepeats = false) {
        return this.http.get('/api/expressions/expressions', {params: {onlyRepeats, userId: this.userId}});
    }

    incrementAnswersCounter(expressionId, correct = true) {
        return this.http.post('/api/expressions/expression/' + expressionId + '/increment-counter', {correct});
    }

    fetchRepeatCount() {
        return this.http.get('/api/expressions/repeat-count', {params: {userId: this.userId}});
    }
}

module.exports = function ExpressionSrvFactory($http) {
    return new ExpressionService($http);
};
