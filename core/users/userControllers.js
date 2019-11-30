const router = require('express').Router();
const passport = require('passport');

router.post('/login', (req, res, next) => {

    passport.authenticate('local', {
        successRedirect: '/app',
        failureRedirect: '/auth/login',
        failureFlash: true
    })(req, res, next);

});

module.exports = router;

