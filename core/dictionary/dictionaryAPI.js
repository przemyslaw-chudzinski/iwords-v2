const router = require('express').Router();
// const axios = require('axios');
// const cherio = require('cherio');
const DictionaryContentExtractor = require('./dictionary-integrations');

/* Search expressions by expression name */
router.get('/search', async (req, res) => {

    const searchText = req.query.searchText || '';

    try {

        const dikiResults = await DictionaryContentExtractor.extract(searchText, 'diki');

        return res.json(dikiResults);

    } catch (e) {
        // TODO
    }

});




module.exports = router;
