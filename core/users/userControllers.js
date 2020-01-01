const router = require('express').Router();
const passport = require('passport');
const {ensureNotAuthenticated, ensureAuthenticated} = require('./auth');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const User = require('../../core/users/user');
const {emailExists} = require('./userDAL');

/* Sign in */
router.post('/login', ensureNotAuthenticated, (req, res, next) => {

    passport.authenticate('local', {
        successRedirect: '/app',
        failureRedirect: '/auth/login',
        failureFlash: true
    })(req, res, next);

});

/* Sign up */
router.post('/register', ensureNotAuthenticated, async (req, res) => {

    let password = null;
    const name = req.body.name;
    const email = req.body.email;
    const userPassword = req.body.password;
    const repeatedPassword = req.body.repeatedPassword;

    /* Verify if name exists */
    if (!name) {
        req.flash('error_top_msg', 'Imię i nazwisko jest wymagane');
        res.redirect('/auth/register');
        return;
    }

    /* Verify if password exists */
    if (!userPassword || userPassword === '') {
        req.flash('error_top_msg', 'Hasło jest wymagane');
        res.redirect('/auth/register');
        return;
    }

    /* Verify if passwords are the same */
    if (userPassword !== repeatedPassword) {
        req.flash('error_top_msg', 'Podane hasła muszą być takie same');
        res.redirect('/auth/register');
        return;
    }

    /* Verify if email exists */
    if (!email) {
        req.flash('error_top_msg', 'Adres email jest wymagany');
        res.redirect('/auth/register');
        return;
    }

    /* Verify if email is valid */
    const emailValid = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email);
    if (!emailValid) {
        req.flash('error_top_msg', 'Adres email jest niepoprawny');
        res.redirect('/auth/register');
        return;
    }

    /* Verify if email has taken */
    try {

        const emailHasTaken = await emailExists(email);

        if (emailHasTaken) {
            req.flash('error_top_msg', 'Podany email jest już zajęty');
            res.redirect('/auth/register');
            return;
        }

    } catch (e) {

        req.flash('error_top_msg', 'Wystąpił błąd pdczas rejestracji');
        res.redirect('/auth/register');
        return;

    }


    /* Hashing password */
    try {

        password = bcrypt.hashSync(userPassword);

    } catch (e) {

        req.flash('error_top_msg', 'Wystąpił błąd pdczas rejestracji');
        res.redirect('/auth/register');
        return;

    }

    try {

        const user = new User({
            name,
            email,
            password,
            apiKeys: {
                chromeExt: {
                    token: uuid()
                }
            }
        });

        await user.save();
        req.flash('success_top_msg', 'Konto zostało utworzone poprawnie. Możesz się zalogować');
        res.redirect('/auth/login');

    } catch (e) {

        req.flash('error_top_msg', 'Wystąpił błąd pdczas rejestracji');
        res.redirect('/auth/register');

    }
});

/* Sign out */
router.get('/logout', ensureAuthenticated, (req, res) => {
    req.logout();
    req.flash('success_top_msg', 'Zostałeś poprawnie wylogowany');
    res.redirect('/auth/login');
});

module.exports = router;

