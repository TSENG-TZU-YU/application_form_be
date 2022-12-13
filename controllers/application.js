const pool = require('../utils/db');
const moment = require('moment');

// /api/1.0/applicationData?state=1 & maxPrice=100 & minPrice=50 & maxPerson=20 & minPerson=10 & maxDate=20221010 & minPrice=20220910 & order=1 & search & page
async function getAllApp(req, res) {
    let userId = req.session;
    console.log('u',userId);
    // let Id = req.cookie.member;
    // console.log('u',Id);
    // console.log('u',sessionID);

    let [result] = await pool.execute(
        `SELECT a.*, s.name, u.applicant_unit 
      FROM application_form a 
      JOIN status s ON a.status_id = s.id
      JOIN users u ON a.user_id = u.id
      WHERE a.user_id = 1
       `
    );

    res.json({
        // pagination: {
        //   total,
        //   perPage,
        //   page,
        //   lastPage,
        // },
        result
    });
}

// /api/1.0/applicationData? id=1
// async function getUserIdApp(req, res) {
//   let [result] = await pool.execute(
//       `SELECT a.*, s.name, u.applicant_unit 
//     FROM application_form a 
//     JOIN status s ON a.status_id = s.id
//     JOIN users u ON a.user_id = u.id
//     WHERE a.user_id = 1
//      `
//   );

//   res.json({
//       result,
//       // userId
//   });
// }

module.exports = {
    getAllApp,
    // getUserIdApp,
};
