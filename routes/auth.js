const router = require('express').Router();

router.get('/login', (req, res) => {

    res.render('login', {layout: 'auth-layout'});

});

module.exports = router;
