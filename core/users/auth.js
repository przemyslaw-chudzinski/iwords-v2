module.exports = {
    ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
            res.locals.user = {
                _id: req.user._id,
                name: req.user.name
            };
            return next();
        }
        req.flash('warning_top_msg', 'Musisz być zalogowany aby zoabzyć tą stronę');
        res.redirect('/auth/login');
    },
    ensureNotAuthenticated(req, res, next) {
        if (!req.isAuthenticated()) {
            return next();
        }
        res.redirect('/app');
    }
};
