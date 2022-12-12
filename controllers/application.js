const pool = require('../utils/db');
const moment = require('moment');


// /api/1.0/camping?state=1 & maxPrice=100 & minPrice=50 & maxPerson=20 & minPerson=10 & maxDate=20221010 & minPrice=20220910 & order=1 & search & page
async function getApp(req, res){
    let [total] = await pool.execute('SELECT COUNT(*) AS total FROM activity_camping WHERE valid = 1');
  total = total[0].total;

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