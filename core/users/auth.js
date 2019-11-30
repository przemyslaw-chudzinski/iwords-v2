module.exports = {
    ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
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
