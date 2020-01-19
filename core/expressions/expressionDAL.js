const Expression = require('./expression');
const _ = require('lodash');

function fetchExpression(config = {}, sortConfig = {}) {

    const _config = {
        userId: null,
        ...config
    };

    const sort = {
        field: 'desc',
        updatedAt : 1,
        ...sortConfig
    };

    const select = {
        _id: 1,
        expression: 1,
        translations: 1,
        description: 1,
        partOfSpeech: 1,
        exampleSentences: 1
    };

    return Expression
        .findOne()
        .where('userId', _config.userId)
        .sort(sort)
        .select(select);
}

function fetchRepeatExpression(config = {}, sortConfig = {}) {

    const _config = {
        userId: null,
        ...config
    };

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
        description: 1,
        partOfSpeech: 1,
        exampleSentences: 1
    };

    return Expression
        .findOne()
        .where('repeat.state', 1)
        .where('userId', _config.userId)
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

function fetchAllExpressions(config = {}) {

    const _config = {
        select: {},
        userId: null,
        limit: null,
        skip: 0,
        search: '',
        ...config
    };

    const expression = new RegExp( _config.search, 'ig');

    return Expression
        .find({
            expression
        })
        .where('userId', _config.userId)
        .limit(_config.limit)
        .skip(_config.skip)
        .select(_config.select);

}

function fetchStatisticsData(userId) {
    return fetchAllExpressions({userId},{
        select: {
            expression: 1,
            correctAnswers: 1,
            incorrectAnswers: 1
        }
    });
}

async function randomExpression(userId) {

    try {
        const expressions = await fetchAllExpressions({
            select: {
                expression: 1,
                translations: 1,
                correctAnswers: 1,
                incorrectAnswers: 1,
                repeat: 1,
                partOfSpeech: 1,
                exampleSentences: 1
            },
            userId
        });
        const randomIndex = _.random(0, expressions.length - 1);
        return expressions[randomIndex];
    } catch (e) {
        return fetchExpression({userId});
    }
}

async function saveExpressions(expressions = null) {
    if (expressions && expressions.length) {
        return Expression.insertMany(expressions);
    }

    return null;
}

function countExpressionsInRepeat(userId) {
    return Expression
        .find()
        .where('userId', userId)
        .where('repeat.state', 1)
        .countDocuments();
}

function countAllUserExpressions(config = {}) {

    const _config = {
        userId: null,
        search: '',
        ...config
    };

    const expression = new RegExp( _config.search, 'ig');

    return Expression
        .find({expression})
        .where('userId', _config.userId)
        .countDocuments();
}

function fetchRepeatExpressions(config = {}) {

    const _config = {
        userId: null,
        limit: 5,
        skip: 0,
        ...config
    };

    const sort = {
        field: 'desc',
        // updatedAt : 1
    };

    const select = {
        _id: 1,
        expression: 1,
        translations: 1,
        repeat: 1,
        description: 1,
        partOfSpeech: 1,
        exampleSentences: 1
    };

    return Expression
        .find()
        .where('repeat.state', 1)
        .where('userId', _config.userId)
        .sort(sort)
        .limit(_config.limit)
        .skip(_config.skip)
        .select(select);
}

function resetRepeatMode(config = {}) {

    const _config = {
        userId: null,
        ...config
    };

    return Expression.updateMany(
        {userId: _config.userId},
        {'repeat.state': false, 'repeat.correctAnswers': 0, 'repeat.incorrectAnswers': 0},
        {runValidators: true}
    );

}

function countAllExpressionsInRepeatMode(config = {}) {
    const _config = {
        userId: null,
        ...config
    };

    return Expression
        .find({})
        .where('repeat.state', 1)
        .where('userId', _config.userId)
        .countDocuments();
}

async function removeExpressionFromRepeatMode(config = {}) {
    const _config = {
        userId: null,
        exprId: null,
        ...config
    };

    try {
        const expr = await Expression.findById(_config.exprId);
        if (!expr) {
            return null;
        }
        expr.repeat.state = false;
        expr.repeat.correctAnswers = 0;
        expr.repeat.incorrectAnswers = 0;
        expr.save();
        return expr;
    } catch (e) {

    }

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
    countAllUserExpressions,
    fetchAllExpressions,
    resetRepeatMode,
    countAllExpressionsInRepeatMode,
    removeExpressionFromRepeatMode
};
