const { default: axios } = require('axios');
const express = require('express');
const app = express();

require('dotenv').config();

const port = process.env.SERVER_PORT;
const pool = require('./utils/db.js');
const path = require('path');
const cors = require('cors');
const corsOptions = {
    credentials: true,
    origin: ['http://localhost:3000'],
};
app.use(cors(corsOptions));
app.use(express.json());

// 啟用 session
const expressSession = require('express-session');
// 把 session 存在硬碟中
var FileStore = require('session-file-store')(expressSession);
app.use(
    expressSession({
        store: new FileStore({
            // session 儲存的路徑
            path: path.join(__dirname, '..', 'sessions'),
        }),
        secret: process.env.SESSION_SECRET,
        // 如果 session 沒有改變的話，要不要重新儲存一次？
        resave: false,
        // 還沒初始化的，要不要存
        saveUninitialized: false,
    })
);

//登入
let login = require('./routers/login');
app.use('/api/login', login);

//申請表
let application_get = require('./routers/application_get');
app.use('/api/application_get', application_get);

// 啟動 server，並且開始 listen 一個 port
app.listen(port, () => {
    console.log(`server start at ${port}`);
});
