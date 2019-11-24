const express = require('express');
const exphbs  = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');

/* Connect to database */
mongoose.connect('mongodb://localhost:27017/iwords-db', {useNewUrlParser: true, useUnifiedTopology: true})
    .catch(err => console.log('db conn err', err));

app.engine('.hbs', exphbs({defaultLayout: 'app-layout', extname: '.hbs'}));
app.set('view engine', '.hbs');

/* Global middleware */
app.use(express.static(path.resolve(__dirname,'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/* API Routes */
app.use('/api/expressions', require('./core/expressions/expressionsAPI'));

/* API Iwords Chrome Extension */
const corsOptions = {
    origin: 'chrome-extension://',
    optionsSuccessStatus: 200
};
app.use('/api/chrome-ext', cors(corsOptions), require('./core/expressions/iwordsChromeExtAPI'));

/* Web Routes */
app.use('/app', require('./routes/index'));

/* Auth routes */
app.use('/auth', require('./routes/auth'));

/* Server start */
const port = process.env.PORT || 3000;
app.listen(port);
