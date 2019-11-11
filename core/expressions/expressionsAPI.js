const router = require('express').Router();
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
const path = require('path');
const {
    fetchExpression,
    incrementExpressionCounters,
    saveExpressions,
    fetchRepeatExpression,
    fetchStatisticsData,
    randomExpression,
    countExpressionsInRepeat,
    fetchRepeatExpressions
} = require('./expressionDAL');

const fileFilter = (req, file, next) => {
    if (file.mimetype.split('/').includes('csv')) {
        return next(null, true);
    }

    return next(new Error('Wrong mimeType'), false);
};

const storage = multer.diskStorage({
    destination(req, file, next) {
        next(null, './uploads/');
    },
    filename(req, file, next) {
        next(null, new Date().toISOString() + '_' + file.originalname);
    }
});

const upload = multer({storage, fileFilter});

/* Routes */

router.get('/expression', (req, res) => {

    // const type = req.query.type || null; // new, repeat

    fetchExpression()
        .then(record => {
            res.status = 200;
            res.json(record);
        })
        .catch(err =>  {
            res.status = 400;
            res.json({error: true});
        });
});


/* Returns a bunch of expressions to learn in one set */
router.get('/expressions', async (req, res) => {

    const onlyRepeats = req.query.onlyRepeats;

    try {

        let data = [];
        // const repeatCount = await countExpressionsInRepeat();

        if (onlyRepeats === 'false') {
            const expr1 = await fetchRepeatExpression();
            const expr2 = await fetchExpression();
            const expr3 = await randomExpression();
            data = [expr1, expr2, expr3].filter(value => !!value);
        } else {
            data = await fetchRepeatExpressions();
        }

        res.status = 200;
        await res.json({data});

    } catch (e) {
        res.status = 400;
        await res.json({error: true});
    }

});

/* Increment answers counter */
router.post('/expression/:id/increment-counter', (req, res) => {

    const id = req.params.id;
    const correctAnswer = req.body.correct;

    incrementExpressionCounters({id, correctAnswer})
        .then(() => {
            res.status = 200;
            res.json({});
        })
        .catch(err => {
            res.status = 400;
            res.json({error: true});
        });

});

router.post('/import', upload.single('csv'), (req, res) => {

    const filename = req.file.filename;
    const results = [];

    fs.createReadStream(path.resolve(__dirname, '..', '..', 'uploads', filename))
        .pipe(csvParser())
        .on('data', ({expression, translations, description}) => {
            expression = expression.trim().toLowerCase();

            translations = translations
                .trim()
                .split(',')
                .map(t => t.trim().toLowerCase())
                .filter(t => t && t.length && t !== '');

            description = description.trim();

            if (expression && expression.length && expression !== '' && translations && translations.length) {
                results.push({expression, translations, description});
            }
        })
        .on('end', async () => {
            try {
                await saveExpressions(results);
                res.status = 200;
                await res.json({});
            } catch (e) {
                res.status = 500;
                await res.json({error: true});
            }
        });

});

/* Statistics */

router.get('/statistics', (req, res) => {

    fetchStatisticsData()
        .then(data => {
            res.status = 200;
            res.json(data);
        })
        .catch(err =>  {
            res.status = 400;
            res.json({error: true});
        });
});

/* Repeat count */
router.get('/repeat-count', (req, res) => {

    countExpressionsInRepeat()
        .then(repeatCount => {
            res.status = 200;
            res.json({repeatCount});
        })
        .catch(err => {
            res.status = 400;
            res.json({error: true});
        });

});

module.exports = router;
