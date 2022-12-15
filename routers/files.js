// 啟用 express
const express = require('express');
const router = express.Router();
const pool = require('../utils/db');

// 抓取使用者上傳的檔案
// http://localhost:3001/api/files/getUserFile
router.get('/getUserFile/:num', async (req, res) => {
    const numId = req.params.num;

    let [getUserTotalFile] = await pool.execute(
        `SELECT * FROM upload_files_detail WHERE case_number_id=? && valid=1  ORDER BY create_time DESC`,
        [numId]
    );

    res.json(getUserTotalFile);
});

// 抓取處理者上傳的檔案
// http://localhost:3001/api/files/getHandlerFile
router.get('/getHandlerFile/:num', async (req, res) => {
    const numId = req.params.num;

    let [getUserTotalFile] = await pool.execute(
        `SELECT * FROM upload_files_detail WHERE case_number_id=? && valid=2  ORDER BY create_time DESC`,
        [numId]
    );

    res.json(getUserTotalFile);
});

// 抓取處理者上傳的檔案
// http://localhost:3001/api/files/getHandlerFileNo
router.get('/getHandlerFileNo/:num', async (req, res) => {
    const numId = req.params.num;

    let [getUserTotalFile] = await pool.execute(
        `SELECT status_id,application_category FROM application_form WHERE case_number=? `,
        [numId]
    );

    res.json(getUserTotalFile);
});

//http://localhost:3001/api/files
router.post('/', async (req, res) => {
    // res.download('uploads/築間.png');
    let file = __dirname + `/../uploads/${req.body.name}`;
    res.download(file);
    console.log(req.body.name);
});

// 匯出
module.exports = router;
