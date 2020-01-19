const router = require('express').Router();
const {
    createNote,
    updateNote
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

module.exports = router;
