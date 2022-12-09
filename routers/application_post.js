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
            `INSERT INTO application_form (case_number,user,handler,application_category,project_name,cycle,status_id, create_time ) VALUES (?,?,?,?,?,?,?,?)`,
            [r.number, r.id, r.handler, r.category, r.name, r.cycle, r.status, r.create_time]
        );
        for (let data of arr) {
            let [application_detail] = await pool.execute(
                `INSERT INTO application_form_detail (case_number_id,requirement_name,directions ) VALUES (?,?,?)`,
                [r.number, data.title, data.text]
            );
        }
        console.log(application);
    } catch (err) {
        console.log(err);
    }
});

// 匯出
module.exports = router;
