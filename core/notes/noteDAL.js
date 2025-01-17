const Note = require('./note');

function createNote(config = {}) {

    const _config = {
        userId: null,
        title: null,
        exprId: null,
        ...config
    };

    const note = new Note();

    if (_config.title) {
        note.title = _config.title;
    }

    if (_config.exprId) {
        note.expressionId = _config.exprId;
    }

    if (_config.userId) {
        note.userId = _config.userId;
    }

    return note.save();

}

function fetchNoteById(noteId) {

    return Note.findById(noteId);

}

function updateNote(config) {

    const _config = {
        userId: null,
        title: null,
        content: null,
        noteId: null,
        ...config
    };

    return new Promise(async (resolve, reject) => {

        try {
            const note = await Note.findById(_config.noteId);

            if (!note) {
                return reject(true);
            }

            if (_config.title) {
                note.title = _config.title;
            }

            if (_config.content) {
                note.content = _config.content;
            }

            note.updatedAt = new Date();

            note.save();

            resolve(null, note);


        } catch (e) {
            reject(e);
        }



    });

}

function fetchNotesByExpressionId(config = {}) {

    const _config = {
        select: {},
        exprId: null,
        userId: null,
        limit: null,
        skip: 0,
        search: '',
        sort: {},
        ...config
    };

    const title = new RegExp( _config.search, 'ig');

    return Note
        .find({
            title
        })
        .where('expressionId', _config.exprId)
        .where('userId', _config.userId)
        .limit(_config.limit)
        .skip(_config.skip)
        .sort(_config.sort)
        .select(_config.select);

}

function countAllExpressionNotes(config = {}) {

    const _config = {
        userId: null,
        search: '',
        exprId: null,
        ...config
    };

    const title = new RegExp( _config.search, 'ig');

    return Note
        .find({title, expressionId: _config.exprId})
        .where('userId', _config.userId)
        .countDocuments();
}

function removeNote(config = {}) {
    const _config = {
        userId: null,
        noteId: null,
        ...config
    };

    return Note
        .findOneAndDelete({
        userId: _config.userId,
        _id: _config.noteId
    });
}

function removeNotesAssociatedToExpr(config = {}) {
    const _config = {
        exprId: null,
        ...config
    };
    
    if (!_config.exprId) {
        return;
    }

    return Note.deleteMany({expressionId: _config.exprId});
}

module.exports = {
    createNote,
    fetchNoteById,
    updateNote,
    fetchNotesByExpressionId,
    countAllExpressionNotes,
    removeNote,
    removeNotesAssociatedToExpr
};
