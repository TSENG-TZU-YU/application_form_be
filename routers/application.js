// 啟用 express
const express = require("express");
const router = express.Router();
const pool = require("../utils/db");

//計票
// 取得票所
// http://localhost:3001/api/vote/vote_place
router.get("/vote_place", async (req, res) => {
  let [result] = await pool.execute(
    `SELECT vote_place.*,sum(candidate.number_of_votes)vote FROM vote_place JOIN candidate ON vote_place.id=candidate.vote_place_id GROUP BY vote_place.id `
  );
  res.json(result);
});



//取得候選人/票所
// http://localhost:3001/api/vote/candidate
router.post("/candidate", async (req, res) => {
  let [result] = await pool.execute(
    `SELECT candidate.*,vote_place.constituency_id,vote_place.vote_name FROM candidate LEFT JOIN vote_place ON candidate.vote_place_id=vote_place.id WHERE vote_place.vote_name=?`,
    [req.body.votePlace]
  );

  res.json(result);
});

//更新
// http://localhost:3001/api/vote/cnt/patch
router.patch("/cnt/patch", async (req, res) => {
  let arr = req.body;
  try {
    for (let data of arr) {
      let result = await pool.execute(
        `UPDATE candidate SET cnt=?,number_of_votes=? WHERE vote_place_id=? && id=? `,
        [data.cnt, data.number_of_votes, data.vote_place_id, data.id]
      );
    }
    res.json("susses");
  } catch (err) {
    console.log("err", err);
  }
});

//查看排名
// http://localhost:3001/api/vote/ranking
router.get("/ranking", async (req, res) => {
  let [result] = await pool.execute(
    `SELECT name,sum(number_of_votes)total,number,partisan FROM candidate  GROUP BY name , number ORDER BY total  DESC`
  );
  res.json(result);
});

//取得該編號的選區資訊
// http://localhost:3001/api/vote/ranking/number
router.post("/ranking/number", async (req, res) => {
  let [data] = await pool.execute(
    `SELECT * FROM candidate WHERE number=? GROUP BY number=?`,
    [req.body.number, req.body.number]
  );
  let [lConstituency] = await pool.execute(
    `SELECT vote_place.*,candidate.number,sum(candidate.number_of_votes)a FROM vote_place JOIN candidate ON vote_place.id=candidate.vote_place_id WHERE number=? && constituency_id=1 GROUP BY constituency_id`,
    [req.body.number]
  );
  let [lSub] = await pool.execute(
    `SELECT vote_place.*,candidate.number,sum(candidate.number_of_votes)vote FROM vote_place JOIN candidate ON vote_place.id=candidate.vote_place_id WHERE number=? && constituency_id=1 GROUP BY sub`,
    [req.body.number]
  );
  let [lNeighbor] = await pool.execute(
    `SELECT vote_place.*,candidate.number,sum(candidate.number_of_votes)vote FROM vote_place JOIN candidate ON vote_place.id=candidate.vote_place_id WHERE number=? && constituency_id=1 GROUP BY neighbor`,
    [req.body.number]
  );

  res.json({data,lConstituency,lSub,lNeighbor});
});

// 匯出
module.exports = router;
