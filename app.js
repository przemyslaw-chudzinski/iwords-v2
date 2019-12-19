const express = require('express');
const exphbs  = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
const passport = require('passport');
const initializePassport = require('./core/users/passport-config');
const expressSession = require('express-session');
const flash = require('express-flash');
const {ensureAuthenticated, ensureNotAuthenticated} = require('./core/users/auth');
const {ensureApiKeyIsValid} = require('./core/users/iwordsChromeExtAuth');
const connectFlash = require('connect-flash');

/* Connect to database */
mongoose.connect('mongodb://localhost:27017/iwords-db', {useNewUrlParser: true, useUnifiedTopology: true})
    .catch(err => console.log('db conn err', err));

/* Template engine */
app.engine('.hbs', exphbs({defaultLayout: 'app-layout', extname: '.hbs'}));
app.set('view engine', '.hbs');

/* Global middleware */
app.use(express.static(path.resolve(__dirname,'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/* Express session */
// TODO: Set config object for properly options
app.use(expressSession({
    secret: 'some-session-secret', // TODO: Change it on production
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 10 * 60, // 60min,
        expires: new Date('23-01-2030') // TODO: Change it later
    }
}));

/* Connect flash */
// app.use(connectFlash());

/* Flash */
app.use(flash());
// app.use(connectSession());

app.use((req, res, next) => {
    /* When user put wrong credentials */
    res.locals.login_credentials_error = req.flash('error');
    /* Messages on the top of the page */
    res.locals.error_top_msg = req.flash('error_top_msg');
    res.locals.warning_top_msg = req.flash('warning_top_msg');
    res.locals.success_top_msg = req.flash('success_top_msg');
    res.locals.info_top_msg = req.flash('info_top_msg');
    /* Content flash messages */
    res.locals.success_msg = req.flash('success_msg');
    res.locals.info_msg = req.flash('info_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.warning_msg = req.flash('warning_msg');

    next();
});

/* Initializes passport */
initializePassport(passport);
app.use(passport.initialize());
app.use(passport.session());

/* API Routes */
app.use('/api/expressions', require('./core/expressions/expressionsAPI'));

/* API Iwords Chrome Extension */
const corsOptions = {
    origin: 'chrome-extension://',
    optionsSuccessStatus: 200
};
app.use('/api/chrome-ext', [cors(corsOptions), ensureApiKeyIsValid], require('./core/expressions/iwordsChromeExtAPI'));

/* Web Views */
app.use('/app', ensureAuthenticated, require('./routes/index'));
/* Auth Views */
app.use('/auth', ensureNotAuthenticated, require('./routes/auth'));
/* Controllers - layer for all sync requests in the app */
app.use('/controllers', require('./core/controllers'));

/* Server start */
const port = process.env.PORT || 3000;
app.listen(port);
