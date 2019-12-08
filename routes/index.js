const router = require('express').Router();
const {countAllUserExpressions} = require('../core/expressions/expressionDAL');

/* Main page */
router.get('/', (req, res) => res.render('index', {}));
/* Learning page */
router.get('/learning', async (req, res) => {

    // req.flash('error_top_msg', 'some info');
    // res.render('learning', {expressionsCount: 0});

    try {
        const expressionsCount = await countAllUserExpressions(req.user._id);
        res.render('learning', {expressionsCount});
    } catch (e) {
        req.flash('error_top_msg', 'Wystąpił nieoczekiwany błąd serwera. Nie możemy wczytać danych do nauki');
        res.render('learning', {expressionsCount: 0});
    }

});
/* Import page */
router.get('/import', (req, res) => res.render('import', {}));
/* Dictionary */
router.get('/dictionary', (req, res) => res.render('dictionary', {}));
/* Statistics */
router.get('/statistics', (req, res) => res.render('statistics'));

module.exports = router;
