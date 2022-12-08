const { default: axios } = require("axios");
const express = require("express");
const app = express();

require("dotenv").config();

const port = process.env.SERVER_PORT;
const pool = require("./utils/db.js");
const path = require("path");
const cors = require("cors");
const corsOptions = {

  credentials: true,
  origin: ["http://localhost:3000"],
};
app.use(cors(corsOptions));
app.use(express.json());


//申請表
let application_get=require('./routers/application_get');
app.use('/api/application_get',application_get);



// 啟動 server，並且開始 listen 一個 port
app.listen(port, () => {
  console.log(`server start at ${port}`);
});
