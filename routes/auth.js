const router = require('express').Router();

/* Login page */
router.get('/login', (req, res) => res.render('login', {layout: 'auth-layout'}));
/* Register page */
router.get('/register', (req, res) => res.render('register', {layout: 'auth-layout'}));

module.exports = router;
