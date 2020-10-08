const mix = require('laravel-mix');
// require('laravel-mix-tailwind');

/* Core application */
mix
    .sass('./resources/scss/main.scss', './public/css/app.css')
    .js('./resources/js/index.js', './public/js/app.js');


/* Landing page */
mix
    .sass('./resources/landing-page/scss/main.scss', './public/landing-page/css/app.css')
    .js('./resources/landing-page/js/index.js', './public/landing-page/js/app.js');
