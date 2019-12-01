const router = require('express').Router();
const Expression = require('./expression');

router.post('/expression/add', async (req, res) => {

    const {expression, translations, exampleSentences, partOfSpeech} = req.body;
    const exprModel = new Expression();

    exprModel.expression = expression;
    exprModel.translations = translations;
    exprModel.exampleSentences = exampleSentences;
    exprModel.partOfSpeech = partOfSpeech;
    exprModel.userId = req.user._id;

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
