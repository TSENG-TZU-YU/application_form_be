const express = require('express');
const router = express.Router();
const appController = require('../controllers/application');
// const authMid = require('../middlewares/auth');

// const path = require('path');

// 全部列表資料
router.get('/', appController.getAllApp);
// router.get('/:num', appController.getUserIdApp);


module.exports = router;
