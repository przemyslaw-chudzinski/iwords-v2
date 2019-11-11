/* Expression service */
class ExpressionService {
    constructor(http) {
        this.http = http;
    }

    fetchExpression() {
        return this.http.get('/api/expressions/expression');
    }

    fetchExpressions(onlyRepeats = false) {
        return this.http.get('/api/expressions/expressions', {params: {onlyRepeats}});
    }

    incrementAnswersCounter(expressionId, correct = true) {
        return this.http.post('/api/expressions/expression/' + expressionId + '/increment-counter', {correct});
    }

    fetchRepeatCount() {
        return this.http.get('/api/expressions/repeat-count');
    }
}

module.exports = function ExpressionSrvFactory($http) {
    return new ExpressionService($http);
};
