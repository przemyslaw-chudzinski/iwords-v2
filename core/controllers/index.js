const router = require('express').Router();

router.use('/auth', require('../users/userControllers'));

module.exports = router;
