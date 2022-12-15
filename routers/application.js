const express = require('express');
const router = express.Router();
const appController = require('../controllers/application');
// const authMid = require('../middlewares/auth');


// checked
router.put('/checked/:needId', appController.putNeedChecked);
router.put('/unChecked/:needId', appController.putUnNeedChecked);

// post 審理結果
router.post('/postHandle', appController.handlePost);

// put 狀態 4 -> 5
router.post('/changeState/:caseNum', appController.handleChangeState);

// post 修改需求
router.post('/postAddNeed', appController.handlePostNeed);
router.put('/putAcceptNeed/:num', appController.handleAcceptNeed);

// 取消申請
router.post('/cancleAcc/:num', appController.handleCancleAcc);


// 審核歷程
router.get('/getCaseHistory/:case', appController.getCaseHistory);

// 全部列表資料
router.get('/', appController.getAllApp);
router.get('/:num', appController.getUserIdApp);

module.exports = router;
