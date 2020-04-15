const {Message, severity} = require("../message");
const {validateContentProvider} = require("./content-providers");
const router = require('express').Router();
const {
    fetchExpression,
    incrementExpressionCounters,
    fetchRepeatExpression,
    fetchStatisticsData,
    randomExpression,
    countExpressionsInRepeat,
    fetchRepeatExpressions,
    fetchAllExpressions,
    countAllUserExpressions,
    resetRepeatMode,
    countAllExpressionsInRepeatMode,
    removeExpressionFromRepeatMode,
    toggleExpressionRepeatMode,
    removeExpressionById,
    fetchExpressionsByExpression
} = require('./expressionDAL');

const {countAllExpressionNotes, removeNotesAssociatedToExpr} = require('../notes/noteDAL');

const {map} = require('async');

const Expression = require('./expression');

/* Routes */

router.get('/expression', (req, res) => {

    fetchExpression(req.query.userId)
        .then(record => {
            res.status(200);
            res.json(record);
        })
        .catch(err =>  {
            res.status(400);
            res.json({error: true});
        });
});


/* Returns a bunch of expressions to learn in one set */
router.get('/expressions', async (req, res) => {

    const onlyRepeats = req.query.onlyRepeats;
    const userId = req.query.userId;

    try {

        let data = [];
        // const repeatCount = await countExpressionsInRepeat();

        if (onlyRepeats === 'false') {
            const expr1 = await fetchRepeatExpression({userId});
            const expr2 = await fetchExpression({userId});
            const expr3 = await randomExpression(userId);
            data = [expr1, expr2, expr3].filter(value => !!value);
        } else {
            data = await fetchRepeatExpressions({userId});
        }

        res.status(200);
        await res.json({data});

    } catch (e) {
        res.status(400);
        await res.json({error: true});
    }

});

/* Returns number of all user's expressions */
router.get('/count', async (req, res) => {

    const userId = req.query.userId;

    try {
        const quantity = await countAllUserExpressions({userId});

        res.status(200);
        await res.json({quantity});

    } catch (e) {
        res.status(400);
        await res.json({error: true});
    }

});

/* Increment answers counter */
router.post('/expression/:id/increment-counter', (req, res) => {

    const id = req.params.id;
    const correctAnswer = req.body.correct;

    incrementExpressionCounters({id, correctAnswer})
        .then(() => {
            res.status(200);
            res.json({});
        })
        .catch(err => {
            res.status(400);
            res.json({error: true});
        });

});

// router.post('/import', upload.single('csv'), (req, res) => {
//
//     const filename = req.file.filename;
//     const results = [];
//
//     fs.createReadStream(path.resolve(__dirname, '..', '..', 'uploads', filename))
//         .pipe(csvParser())
//         .on('data', ({expression, translations, description}) => {
//             expression = expression.trim().toLowerCase();
//
//             translations = translations
//                 .trim()
//                 .split(',')
//                 .map(t => t.trim().toLowerCase())
//                 .filter(t => t && t.length && t !== '');
//
//             description = description ? description.trim() : '';
//
//             if (expression && expression.length && expression !== '' && translations && translations.length) {
//                 results.push({expression, translations, description});
//             }
//         })
//         .on('end', async () => {
//             try {
//                 await saveExpressions(results);
//                 res.status(200);
//                 await res.json({});
//             } catch (e) {
//                 res.status(400);
//                 await res.json({error: true});
//             }
//         });
//
// });

/* Statistics */
router.get('/statistics', (req, res) => {

    fetchStatisticsData(req.query.userId)
        .then(data => {
            res.status(200);
            res.json(data);
        })
        .catch(err =>  {
            res.status(400);
            res.json({error: true});
        });
});

/* Returns basic statistics */
router.get('/statistics/basic', async (req, res) => {

    try {
        let correctAnswers = 0;
        let incorrectAnswers = 0;

        const inRepeatMode = await countAllExpressionsInRepeatMode({userId: req.query.userId});
        const allUserExpressions = await fetchAllExpressions({userId: req.query.userId});

        allUserExpressions.forEach(expr => {
            correctAnswers += expr.correctAnswers;
            incorrectAnswers += expr.incorrectAnswers;
        });

        res.status(200);
        await res.json({
            correctAnswers,
            incorrectAnswers,
            inRepeatMode
        });

    } catch (e) {
        res.status(400);
        await res.json({error: true});
    }

});

/* Repeat count */
router.get('/repeat-count', (req, res) => {

    countExpressionsInRepeat(req.query.userId)
        .then(repeatCount => {
            res.status(200);
            res.json({repeatCount});
        })
        .catch(err => {
            res.status(400);
            res.json({error: true});
        });

});

/* Get logged user expressions */
router.get('/user-expressions', async (req, res) => {

    const page = +req.query.page || null;
    const search = req.query.search || '';
    const userId = req.query.userId;
    const limit = +req.query.limit;
    const sortDate = req.query.sortDate || 'desc';

    const sort = {
        createdAt: sortDate
    };

    const config = {
        userId,
        search,
        limit,
        sort,
        skip: (page - 1) * limit
    };

    try {
        const _data = await fetchAllExpressions(config);
        const total = await countAllUserExpressions(config);
        /* Mapping on required object */
        const data = _data.map(item => {

            const inRepeatState = item.repeat.state;
            const repeatCount = +(item.correctAnswers + item.incorrectAnswers);
            const effectivity = +((item.correctAnswers / repeatCount) * 100).toPrecision(2);
            const latest = new Date().getTime() < item.createdAt.getTime() + 1000 * 60 * 60 * 48;
            // const notesCount = await countAllExpressionNotes({userId, search, exprId: item._id});

            return {
                _id: item._id,
                expression: item.expression,
                translations: item.translations,
                inRepeatState,
                repeatCount,
                effectivity,
                latest,
                notesCount: 0
            };

        });

        map(data, function (expr, next) {

            countAllExpressionNotes({userId, search, exprId: expr._id})
                .then(notesCount => {
                    expr.notesCount = notesCount;
                    next(null, expr);
                })
                .catch();

        }, function (err, data) {

            res.json({data, total});

        });

        // await res.json({data, total});

    } catch (e) {
        res.status(400);
        await res.json({error: true});
    }

});

/* Rests all expressions in repeat mode */
router.post('/reset-repeat-mode', async (req, res) => {

    const userId = req.body.userId;

    const config = {
        userId
    };

    try {
        await resetRepeatMode(config);
        res.status(200);
        await res.json({});
    } catch (e) {
        res.status(400);
        await res.json({error: true});
    }

});

/* Get expressions which are in repeat mode */
router.get('/repeat-mode', async (req, res) => {

    const userId = req.query.userId;
    const limit = +req.query.limit;
    const page = +req.query.page || null;

    const config = {
        userId,
        limit,
        skip: (page - 1) * limit
    };

    try {
        const _data = await fetchRepeatExpressions(config);
        const total = await countAllExpressionsInRepeatMode(config);

        const data = _data.map(item => {

            const _id = item._id;
            const expression = item.expression;
            const translations = item.translations;

            return {
                _id,
                expression,
                translations
            };

        });

        res.status(200);
        await res.json({data, total});
    } catch (e) {
        console.log(e);
        res.status(400);
        await res.json({error: true});
    }

});

/* Removes expression from repeat mode */
/* TODO: This route will be removed and replaced into toggle */
router.post('/:id/remove-from-repeat-mode', async (req, res) => {

    const exprId = req.params.id;
    const userId = req.body.userId;

    const config = {
        userId,
        exprId
    };

    try {
        const expr = await removeExpressionFromRepeatMode(config);

        if (!expr) {
            res.status(404);
            await res.json({});
            return;
        }

        res.status(200);
        await res.json({});

    } catch (e) {
        res.status(400);
        await res.json({});
        console.log(e);
    }

});

/* Toggle expression repeat mode */
router.put('/:id', async (req, res) => {

    const exprId = req.params.id;
    const userId = req.body.userId;

    const config = {
        userId,
        exprId
    };

    try {
        await toggleExpressionRepeatMode(config);
        res.status(200);
        await res.json({});

    } catch (e) {
        res.status(400);
        await res.json({});
    }

});

/* Removes single expression and associated with it things */
router.delete('/:id', async (req, res) => {

    const exprId = req.params.id;

    if (!exprId) {
        res.status(400);
        return await res.json({error: true});
    }

    try {
        await removeNotesAssociatedToExpr({exprId});
        await removeExpressionById({exprId});

        res.status(200);
        await res.json({});

    } catch (e) {
        res.status(400);
        return await res.json({error: true});
    }

});

/* Add new expression to the iwords */
router.post('/expressions', async (req, res) => {

    const {expression, translations, exampleSentences, partOfSpeech, provider} = req.body;

    if (!validateContentProvider(provider)) {
        res.status(500);
        return res.json({error: true, message: new Message('Unknown content provider', severity.error)});
    }

    const exprModel = new Expression();

    exprModel.expression = expression;
    exprModel.translations = translations;
    exprModel.exampleSentences = exampleSentences;
    exprModel.partOfSpeech = partOfSpeech;
    exprModel.userId = req.user._id;
    exprModel.provider = provider;

    try {
        const newExpr = await exprModel.save();
        res.status(200);
        await res.json({_id: newExpr._id});
    } catch (e) {
        res.status(400);
        await res.json({error: true});
    }

});

/* Checks if expression has already existed */
router.post('/expression/check-if-exists', async (req, res) => {

    const expression = req.body.expression;

    try {
        const results = await fetchExpressionsByExpression({expression});

        if (results && results.length) {
            res.status(200);
            return await res.json({exists: true, results});
        }

        res.status(200);
        await res.json({exists: false, results: []});

    } catch (e) {
        res.status(400);
        await res.json({error: true});
    }


});

module.exports = router;
