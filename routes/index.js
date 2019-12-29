const router = require('express').Router();
const {countAllUserExpressions} = require('../core/expressions/expressionDAL');

/* Main page */
router.get('/', (req, res) => res.render('index', {name: 'app.dashboard'}));
/* Learning page */
router.get('/learning', async (req, res) => {

    // req.flash('error_top_msg', 'some info');
    // res.render('learning', {expressionsCount: 0});

    const viewData = {
        name: 'app.learning',
        expressionsCount: 0,
        pageTitle: 'Tryb nauki'
    };

    try {
        viewData.expressionsCount = await countAllUserExpressions(req.user._id);
        res.render('learning', viewData);
    } catch (e) {
        req.flash('error_top_msg', 'Wystąpił nieoczekiwany błąd serwera. Nie możemy wczytać danych do nauki');
        res.render('learning', viewData);
    }

});
/* Import page */
router.get('/import', (req, res) => res.render('import', {}));
/* Dictionary */
router.get('/dictionary', (req, res) => res.render('dictionary', {}));
/* Statistics */
router.get('/statistics', (req, res) => res.render('statistics'));
/* Your expressions */
router.get('/your-expressions', async (req, res) => {

    const viewData = {
        name: 'app.yourExpressions',
        pageTitle: 'Twoje wyrażenia',
        hasExpressions: false
    };

    try {
        const total = await countAllUserExpressions(req.user._id);
        viewData.hasExpressions = total > 0;
        res.render('your-expressions', viewData);
    } catch (e) {
        req.flash('error_top_msg', 'Wystąpił nieoczekiwany błąd serwera. Nie możemy wczytać danych');
        res.render('your-expressions', viewData);
    }

});

module.exports = router;
