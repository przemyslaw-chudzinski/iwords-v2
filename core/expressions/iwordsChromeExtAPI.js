const router = require('express').Router();
const Expression = require('./expression');
const {validateContentProvider} = require('./content-providers');
const {Message, severity} = require('../message');

router.post('/expression/add', async (req, res) => {

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

module.exports = router;
