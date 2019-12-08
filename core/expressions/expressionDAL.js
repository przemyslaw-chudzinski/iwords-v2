const Expression = require('./expression');
const _ = require('lodash');

function fetchExpression(userId, sortConfig = {}) {

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
        .where('userId', userId)
        .sort(sort)
        .select(select);
}

function fetchRepeatExpression(userId, sortConfig = {}) {

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
        .where('userId', userId)
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
            // TODO: Check process
            if (expression.repeat.state && correctAnswer) {
                expression.repeat.correctAnswers++
            } else {
                expression.repeat.incorrectAnswers++
            }

            /* If a word has sufficient number of repeats, then it resets the repeat state  */
            if (expression.repeat.state && expression.repeat.correctAnswers === 10) {
                expression.repeat.state = false;
                expression.repeat.correctAnswers = 0;
                expression.repeat.incorrectAnswers = 0;
            }

            /* Increments a answers of expression */
            if (correctAnswer) {
                expression.correctAnswers++;
            } else {
                expression.incorrectAnswers++;
                expression.repeat.state = true;
            }

            return expression.save();
        });
}

function fetchAllExpressions(userId, userConfig = {}) {

    const config = {
        select: {
            _id: 1,
            expression: 1,
            translations: 1,
            description: 1
        },
        ...userConfig
    };

    return Expression
        .find({})
        .where('userId', userId)
        .select(config.select);

}

function fetchStatisticsData(userId) {
    return fetchAllExpressions(userId,{
        select: {
            expression: 1,
            correctAnswers: 1,
            incorrectAnswers: 1
        }
    });
}

async function randomExpression(userId) {

    try {
        const expressions = await fetchAllExpressions(userId,{
            select: {
                expression: 1,
                translations: 1,
                correctAnswers: 1,
                incorrectAnswers: 1,
                repeat: 1
            }
        });
        const randomIndex = _.random(0, expressions.length - 1);
        return expressions[randomIndex];
    } catch (e) {
        return fetchExpression(userId);
    }
}

async function saveExpressions(expressions = null) {
    if (expressions && expressions.length) {
        return Expression.insertMany(expressions);
    }

    return null;
}

function countExpressionsInRepeat(userId) {
    console.log(userId);
    return Expression
        .find()
        .where('userId', userId)
        .where('repeat.state', 1)
        .countDocuments()
}

function countAllUserExpressions(userId) {
    return Expression
        .find()
        .where('userId', userId)
        .countDocuments();
}

function fetchRepeatExpressions(userId, limit = 5) {
    const sort = {
        field: 'desc',
        // updatedAt : 1
    };

    const select = {
        _id: 1,
        expression: 1,
        translations: 1,
        repeat: 1,
        description: 1
    };

    return Expression
        .find()
        .where('repeat.state', 1)
        .where('userId', userId)
        .sort(sort)
        .limit(limit)
        .select(select);
}

module.exports = {
    fetchExpression,
    incrementExpressionCounters,
    saveExpressions,
    fetchRepeatExpression,
    fetchStatisticsData,
    randomExpression,
    countExpressionsInRepeat,
    fetchRepeatExpressions,
    countAllUserExpressions
};
