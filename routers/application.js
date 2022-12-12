const express = require('express');
const router = express.Router();
const appController = require('../controllers/application');
const path = require('path');


router.get('/app', appController.getApp);

module.exports = router;
