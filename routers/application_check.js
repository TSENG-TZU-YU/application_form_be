// 啟用 express
const express = require('express');
const router = express.Router();
const pool = require('../utils/db');

// 處理人
// http://localhost:3001/api/application_check
router.get('/', async (req, res) => {
    let [result] = await pool.execute(`SELECT * FROM application_form`);
    res.json(result);
});

// 匯出
module.exports = router;
