const mix = require('laravel-mix');

mix
    .sass('./resources/scss/main.scss', './public/css/app.css')
    .js('./resources/js/index.js', './public/js/app.js');
