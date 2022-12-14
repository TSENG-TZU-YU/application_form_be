// 啟用 express
const express = require('express');
const router = express.Router();
const pool = require('../utils/db');

// 處理人
// http://localhost:3001/api/application_post
router.post('/', async (req, res) => {
    try {
        let r = req.body;
        let arr = req.body.need;
        let [application] = await pool.execute(
            `INSERT INTO application_form (case_number,user,user_id,handler,application_category,project_name,cycle,status_id, create_time ) VALUES (?,?,?,?,?,?,?,?,?)`,
            [r.number, r.name, r.id, r.handler, r.category, r.name, r.cycle, r.status, r.create_time]
        );
        for (let data of arr) {
            let [application_detail] = await pool.execute(
                `INSERT INTO application_form_detail (case_number_id,requirement_name,directions ) VALUES (?,?,?)`,
                [r.number, data.title, data.text]
            );
        }
    } catch (err) {
        console.log(err);
    }
});

router.post('/file', async (req, res) => {
    const arr = Object.values(req.files);

    for (let data of arr) {
        let uploadPath = __dirname + '/../uploads/' + data.name;
        data.mv(uploadPath, (err) => {
            if (err) {
                return res.send(err);
            }
        });
        try {
            let [files] = await pool.execute(
                'INSERT INTO upload_files_detail (case_number_id,name,create_time) VALUES (?,?,?)',
                [req.body.number, data.name, req.body.create_time]
            );
        } catch (err) {
            console.log(err);
        }
    }
    res.send('ok2');
    console.log('1', req.files);
});

// 匯出
module.exports = router;
