const router = require('express').Router();
const {countAllUserExpressions} = require('../core/expressions/expressionDAL');
const {fetchNoteById} = require('../core/notes/noteDAL');

/* Main page */
router.get('/', (req, res) => res.render('index', {name: 'app.dashboard'}));
/* Learning page */
router.get('/learning', async (req, res) => {

    const viewData = {
        name: 'app.learning',
        expressionsCount: 0,
        pageTitle: 'Tryb nauki'
    };

    try {
        viewData.expressionsCount = await countAllUserExpressions({userId: req.user._id});
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
router.get('/statistics', (req, res) => {
    const viewData = {
        name: 'app.statistics',
        pageTitle: 'Statystyki'
    };

    res.render('statistics', viewData);
});
/* Your expressions */
router.get('/your-expressions', async (req, res) => {

    const viewData = {
        name: 'app.yourExpressions',
        pageTitle: 'Twoje wyrażenia',
        hasExpressions: false
    };

    try {
        const total = await countAllUserExpressions({userId: req.user._id});
        viewData.hasExpressions = total > 0;
        res.render('your-expressions', viewData);
    } catch (e) {
        req.flash('error_top_msg', 'Wystąpił nieoczekiwany błąd serwera. Nie możemy wczytać danych');
        res.render('your-expressions', viewData);
    }

});

/* Edit note */
router.get('/notes/:id/:exprId?', async (req, res) => {

    const noteId = req.params.id;
    const exprId = req.params.exprId;

    if (!noteId) {
        res.render('404');
        return;
    }

    const viewData = {
        name: 'app.notes.edit',
        pageTitle: '',
        content: '',
        noteId,
        exprId
    };

    try {
        const note = await fetchNoteById(noteId);

        if (!note) {
            res.render('404');
            return;
        }

        viewData.pageTitle = `Edytujesz notatkę - ${note.title}`;
        viewData.content = note.content;
        res.render('edit-note', viewData);

    } catch (e) {
        console.log(e);
        req.flash('error_top_msg', 'Wystąpił nieoczekiwany błąd serwera. Nie możemy wczytać danych');
        res.render('error');
    }

});

module.exports = router;
