// 啟用 express
const express = require('express');
const router = express.Router();
const pool = require('../utils/db');

// 抓取使用者上傳的檔案
// http://localhost:3001/api/files/getUserFile
router.get('/getUserFile/:num', async (req, res) => {
    const numId = req.params.num;

    let [getUserTotalFile] = await pool.execute(
        `SELECT * FROM upload_files_detail WHERE case_number_id=? && (valid=1||valid=0)  ORDER BY create_time DESC`,
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

// 上傳檔案更新狀態(已補件)
// http://localhost:3001/api/files/patchStatus
router.patch('/patchStatus/:num', async (req, res) => {
    const numId = req.params.num;

    let [getUserTotalFile] = await pool.execute(` UPDATE application_form SET status_id=? WHERE case_number = ? `, [
        8,
        numId,
    ]);

    res.json(getUserTotalFile);
});

// 抓取申請者上傳的檔案(已補件)
// http://localhost:3001/api/files/getUpdateFile
router.get('/getUpdateFile/:num', async (req, res) => {
    const numId = req.params.num;

    let [getUserTotalFile] = await pool.execute(
        `SELECT a.*,b.case_number,b.remark,c.status_id FROM upload_files_detail a LEFT JOIN select_states_detail b ON a.	create_time=b.up_files_time JOIN application_form c ON a.case_number_id=c.case_number WHERE c.case_number=? && c.status_id=? && a.valid=? && b.select_state=? &&(b.receive_files_time is null || b.receive_files_time='')  `,
        [numId, 8, 1, '需補件']
    );
    // let [getUserTotalFile] = await pool.execute(
    //     `SELECT remark FROM select_states_detail WHERE case_number=?  && select_state=? && (receive_files_time is null || receive_files_time='') ORDER BY create_time DESC LIMIT 1`,
    //     [numId, '需補件']
    // );

    res.json(getUserTotalFile);
});

// 上傳檔案更新狀態(接收補件)
// http://localhost:3001/api/files/acceptFile
router.patch('/acceptFile/:num', async (req, res) => {
    const numId = req.params.num;
    let v = req.body;

    let [getUserTotalFile] = await pool.execute(
        `UPDATE select_states_detail SET receive_files_time=? WHERE case_number =? && 	up_files_time=? && select_state=? && (receive_files_time is null || receive_files_time='') `,
        [v.receiveTime, numId, v.create_time, '需補件']
    );
    await pool.execute(`UPDATE application_form SET status_id=? WHERE case_number = ? `, [6, numId]);

    res.json(getUserTotalFile);
});

// UPDATE upload_files_detail SET receive_files_time='1' WHERE case_number ='167116505' && 	up_files_time='2022-12-16 12:32:10' && valid='1' && select_state='需補件' && (receive_files_time is null || receive_files_time='')

//下載檔案
//http://localhost:3001/api/files
router.post('/', async (req, res) => {
    // res.download('uploads/築間.png');
    let file = __dirname + `/../uploads/${req.body.name}`;
    res.download(file);
    console.log(req.body.name);
});

// 匯出
module.exports = router;
