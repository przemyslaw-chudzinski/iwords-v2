/* Expression service */
class ExpressionService {
    constructor(http) {
        this.http = http;
    }

    fetchExpression() {
        return this.http.get('/api/expressions/expression');
    }

    fetchExpressions() {
        return this.http.get('/api/expressions/expressions');
    }

    incrementAnswersCounter(expressionId, correct = true) {
        return this.http.post('/api/expressions/expression/' + expressionId + '/increment-counter', {correct});
    }
}

module.exports = function ExpressionSrvFactory($http) {
    return new ExpressionService($http);
};
