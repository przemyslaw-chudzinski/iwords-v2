const router = require('express').Router();
const {
    createNote,
    updateNote,
    fetchNotesByExpressionId,
    countAllExpressionNotes,
    removeNote
} = require('./noteDAL');

/* Update single note */
router.post('/:id', async (req, res) => {

    const noteId = req.params.id;

    try {

        const config = {
            ...req.body,
            noteId
        };

        const updatedNote = await updateNote(config);

        res.status(200);
        await res.json({});

    } catch (e) {
        console.log(e);
        res.status(400);
        await res.json({error: true});
    }


});

/* Create note associated with expression */
router.post('/', async (req, res) => {

    const _title = req.body.title;
    const exprId = req.body.exprId;
    const userId = req.body.userId;
    const title = _title ? _title.trim() : null;

    const config = {
        title,
        exprId,
        userId
    };

    try {
        const note = await createNote(config);
        res.status(200);
        await res.json({noteId: note._id});
    } catch (e) {
        res.status(400);
        await res.json({error: true});
    }


});

/* Gets notes associated with expression id */
router.get('/:id', async (req, res) => {

    const userId = req.query.userId;
    const limit = +req.query.limit;
    const page = +req.query.page || null;
    const exprId = req.params.id || null;
    const search = req.query.search || '';

    const config = {
        userId,
        limit,
        skip: (page - 1) * limit,
        exprId,
        search
    };

    try {
        const _data = await fetchNotesByExpressionId(config);
        const total = await countAllExpressionNotes(config);

        const data = _data.map(item => {

            const _id = item._id;
            const title = item.title;

            return {
                _id,
                title
            };

        });

        res.status(200);
        await res.json({data, total});
    } catch (e) {
        res.status(400);
        await res.json({error: true});
    }

});

/* Remove single note */
router.delete('/:id', async (req, res) => {
    const userId = req.query.userId;
    const noteId = req.params.id;

    try {
        await removeNote({userId, noteId});
        res.status(200);
        await res.json({});
    } catch (e) {
        res.status(400);
        await res.json({error: true});
    }

});

module.exports = router;
