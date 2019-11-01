const Expression = require('./expression');
const _ = require('lodash');

function fetchExpression(sortConfig = {}) {

    const sort = {
        field: 'desc',
        updatedAt : 1,
        ...sortConfig
    };

    const select = {
        _id: 1,
        expression: 1,
        translations: 1,
        description: 1
    };

    return Expression
        .findOne()
        .sort(sort)
        .select(select);
}

function fetchRepeatExpression(sortConfig = {}) {

    const sort = {
        field: 'desc',
        updatedAt : 1,
        ...sortConfig
    };

    const select = {
        _id: 1,
        expression: 1,
        translations: 1,
        repeat: 1,
        description: 1
    };

    return Expression
        .findOne()
        .where('repeat.state', 1)
        .sort(sort)
        .select(select);

    // if (expression.repeat.state)

    // return expression;
}

function incrementExpressionCounters({id, correctAnswer}) {
    return Expression.findById(id)
        .then(expression => {
            expression.updatedAt = new Date().toISOString();

            /* When expression has repeat state active/inactive */
            if (expression.repeat.state && correctAnswer) {
                expression.repeat.correctAnswers++;
            } else if (expression.repeat.state && !correctAnswer) {
                expression.repeat.incorrectAnswers++;
                expression.repeat.correctAnswers = 0;
                expression.repeat.incorrectAnswers = 0;
            }

            /* If a word has sufficient number of repeats, then it resets the repeat state  */
            if (expression.repeat.state && expression.repeat.correctAnswers === 10) {
                expression.repeat.state = false;
                expression.repeat.correctAnswers = 0;
                expression.repeat.incorrectAnswers = 0;
            }

            /* Increments a answers of word */
            if (correctAnswer) {
                expression.correctAnswers++;
            } else {
                expression.incorrectAnswers++;
                expression.repeat.state = true;
            }

            return expression.save();
        });
}

function fetchAllExpressions(userConfig = {}) {

    const config = {
        select: {
            _id: 1,
            expression: 1,
            translations: 1,
            description: 1
        },
        ...userConfig
    };

    return Expression.find({}).select(config.select);

}

function fetchStatisticsData() {
    return fetchAllExpressions({
        select: {
            expression: 1,
            correctAnswers: 1,
            incorrectAnswers: 1
        }
    });
}

async function randomExpression() {

    try {
        const expressions = await fetchAllExpressions({
            select: {
                expression: 1,
                correctAnswers: 1,
                incorrectAnswers: 1,
                repeat: 1
            }
        });
        const randomIndex = _.random(0, expressions.length - 1);
        return expressions[randomIndex];
    } catch (e) {
        return fetchExpression();
    }
}

async function saveExpressions(expressions = null) {
    if (expressions && expressions.length) {
        return Expression.insertMany(expressions);
    }

    return null;
}

module.exports = {
    fetchExpression,
    incrementExpressionCounters,
    saveExpressions,
    fetchRepeatExpression,
    fetchStatisticsData,
    randomExpression
};
