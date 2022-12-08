// 啟用 express
const express = require('express');
const router = express.Router();
const pool = require('../utils/db');

//登入
// http://localhost:3001/api/login
router.post('/', async (req, res) => {
    try {
        let rb = req.body;
        let [result] = await pool.execute('SELECT * FROM users WHERE applicant_unit=? && staff_code=? &&password=?', [
            rb.company,
            rb.no,
            rb.password,
        ]);
        if (result.length == 0) {
            return res.status(401).json({ message: '員編或密碼錯誤' });
        }
        let member = result[0];
        let user = { company: member.applicant_unit, user: member.staff_code, password: member.password };

        req.session.member = user;
        console.log('ss', req.session);
        res.json(user);
    } catch (err) {
        console.log(err);
    }
});

// 抓使用者資   TODO: SESSION
// http://localhost:3001/api/login/auth
router.get('/auth', async (req, res) => {
    let [result] = await pool.execute(`SELECT * FROM users WHERE applicant_unit=? && staff_code=? `, [
        req.session.member.company,
        req.session.member.user,
    ]);
    res.json(result);
});

// 匯出
module.exports = router;
