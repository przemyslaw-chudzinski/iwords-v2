const router = require('express').Router();

/* Main page */
router.get('/', (req, res) => res.render('index', {}));
/* Learning page */
router.get('/learning', (req, res) => res.render('learning', {}));
/* Import page */
router.get('/import', (req, res) => res.render('import', {}));
/* Dictionary */
router.get('/dictionary', (req, res) => res.render('dictionary', {}));
/* Statistics */
router.get('/statistics', (req, res) => res.render('statistics'));

module.exports = router;
