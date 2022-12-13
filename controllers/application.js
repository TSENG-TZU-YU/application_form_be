const pool = require('../utils/db');
const moment = require('moment');

// /api/1.0/applicationData?state=1 & maxPrice=100 & minPrice=50 & maxPerson=20 & minPerson=10 & maxDate=20221010 & minPrice=20220910 & order=1 & search & page
async function getAllApp(req, res) {
    let userId = req.session.member.id;
    console.log('ucc', userId);

    let [result] = await pool.execute(
        `SELECT a.*, s.name, u.applicant_unit 
      FROM application_form a 
      JOIN status s ON a.status_id = s.id
      JOIN users u ON a.user_id = u.id
      WHERE a.user_id = 1
       `,
        [userId]
    );

    res.json({
        // pagination: {
        //   total,
        //   perPage,
        //   page,
        //   lastPage,
        // },
        result,
    });
}

// /api/1.0/applicationData/12345
async function getUserIdApp(req, res) {
    const numId = req.params.num;
    // console.log(numId)

    //表單資料
    let [result] = await pool.execute(
        `SELECT a.*, s.name, u.applicant_unit
    FROM application_form a
    JOIN status s ON a.status_id = s.id
    JOIN users u ON a.user_id = u.id
    WHERE a.case_number = ? AND valid = ?`,
        [numId, 1]
    );

    //需求資料
    let [needResult] = await pool.execute(
        `SELECT * 
    FROM application_form_detail d
    WHERE d.case_number_id = ? AND valid = ?`,
        [numId, 1]
    );

    res.json({
        result,
        needResult,
    });
}

module.exports = {
    getAllApp,
    getUserIdApp,
};
