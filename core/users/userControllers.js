const router = require('express').Router();
const passport = require('passport');
const {ensureNotAuthenticated, ensureAuthenticated} = require('./auth');

/* Sign in */
router.post('/login', ensureNotAuthenticated, (req, res, next) => {

    passport.authenticate('local', {
        successRedirect: '/app',
        failureRedirect: '/auth/login',
        failureFlash: true
    })(req, res, next);

});

/* Sign out */
router.get('/logout', ensureAuthenticated, (req, res) => {
    req.logout();
    req.flash('success_top_msg', 'Zostałeś poprawnie wylogowany');
    res.redirect('/auth/login');
});

module.exports = router;

