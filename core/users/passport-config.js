const LocalStrategy = require('passport-local');
const {WrongLoginCredentialsMessage, InternalServerErrorMessage} = require("../message");
const {getUserByEmail, getUserById} = require('./userDAL');
const bcrypt = require('bcryptjs');

function initializePassport(passport) {
    passport.use(new LocalStrategy({usernameField: 'email'}, authenticateUser));
    passport.serializeUser((user, done) => {done(null, user.id)});
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await getUserById(id);
            done(null, user);
        } catch (e) {
            done(true, null);
        }
    });
}

async function authenticateUser(email, password, done = (...args) => {}) {
    // when email === null => failed
    // when password === null => failed

    let user = null;

    /* Find user by email */
    try {
        user = await getUserByEmail(email);
    } catch (e) {

    }

    if (!user) {
        return done(null, false, new WrongLoginCredentialsMessage());
    }

    /* Compare incoming password to existing password */
    try {
        if (await bcrypt.compare(password, user.password)) {
            return done(null, user, null);
        }
        return done(null, null, new WrongLoginCredentialsMessage());
    } catch (e) {
        return done(true, null, new InternalServerErrorMessage());
    }
}

module.exports = initializePassport;
