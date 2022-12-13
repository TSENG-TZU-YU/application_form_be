// 啟用 express
const express = require('express');
const router = express.Router();
const pool = require('../utils/db');

// 處理人
// http://localhost:3001/api/application_check
router.get('/', async (req, res) => {
    let [result] = await pool.execute(
        `SELECT application_form.*,status.name FROM application_form JOIN status ON application_form.status_id = status.id`
    );
    res.json(result);
    console.log('111',req.session)
});

// 匯出
module.exports = router;
