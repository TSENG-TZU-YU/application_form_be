const pool = require('../utils/db');
const moment = require('moment');
let nowDate = moment().format('YYYY-MM-DD HH:mm:ss');
// 增加狀態
async function addHandleState(caseNum, handler, state, remark, estTime, createTime) {
    let [postResult] = await pool.execute(
        'INSERT INTO select_states_detail (case_number, handler, select_state, remark, estimated_time, create_time) VALUES (?,?,?,?,?,?)',
        [caseNum, handler, state, remark, estTime, createTime]
    );
}

// /api/1.0/applicationData?state=1 & maxPrice=100 & minPrice=50 & maxPerson=20 & minPerson=10 & maxDate=20221010 & minPrice=20220910 & order=1 & search & page
async function getAllApp(req, res) {
    let userId = req.session.member.id;
    let handleName = req.session.member.name;
    console.log('ucc', req.session);
// return
    // user permissions=1
    let [result] = await pool.execute(
        `SELECT a.*, s.name, u.applicant_unit, COUNT(d.case_number_id) sum, SUM(d.checked) cou 
      FROM application_form a 
      JOIN status s ON a.status_id = s.id
      JOIN users u ON a.user_id = u.id
      JOIN application_form_detail d ON a.case_number = d.case_number_id
      WHERE a.user_id = ?
      GROUP BY d.case_number_id,s.name, u.applicant_unit
       `,
        [userId]
    );
    let [progressResult] = await pool.execute(
        `SELECT a.case_number, COUNT(d.case_number_id) sum, SUM(d.checked) cou
    FROM application_form a 
    JOIN status s ON a.status_id = s.id
    JOIN users u ON a.user_id = u.id
    JOIN application_form_detail d ON a.case_number = d.case_number_id
    WHERE a.user_id = ?
    GROUP BY d.case_number_id, s.name, u.applicant_unit
    ORDER BY a.create_time DESC
     `,
        [userId]
    );

    // handler permissions=3
    let [handlerResult] = await pool.execute(
        `SELECT a.*, s.name, u.applicant_unit, COUNT(d.case_number_id) sum, SUM(d.checked) cou 
    FROM application_form a 
    JOIN status s ON a.status_id = s.id
    JOIN users u ON a.user_id = u.id
    JOIN application_form_detail d ON a.case_number = d.case_number_id
    WHERE a.handler = ?
    GROUP BY d.case_number_id, s.name, u.applicant_unit
    ORDER BY a.create_time DESC
     `,
        [handleName]
    );

    // progress
    // let [progressResult] = await pool.execute(
    //     `SELECT a.case_number, COUNT(d.case_number_id) sum, SUM(d.checked) cou
    // FROM application_form a
    // JOIN application_form_detail d ON a.case_number = d.case_number_id
    // WHERE d.valid = ? AND a.user_id = ?
    // GROUP BY a.case_number,d.case_number_id
    //  `,
    //     [1, userId]
    // );

    res.json({
        // pagination: {
        //   total,
        //   perPage,
        //   page,
        //   lastPage,
        // },
        result,
        handlerResult,
    });
}

async function getCaseHistory(req, res) {
    const caseNum = req.params.case;
    console.log(caseNum);

    // 案件審核歷程
    let [result] = await pool.execute(
        `SELECT * 
  FROM select_states_detail 
  WHERE case_number = ?
  ORDER BY create_time DESC
   `,
        [caseNum]
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
    FROM application_form_detail 
    WHERE case_number_id = ?`,
        [numId]
    );
    let [needSum] = await pool.execute(
        `SELECT SUM(checked) AS checked
  FROM application_form_detail 
  WHERE case_number_id = ?`,
        [numId]
    );
    //審核結果
    let [handleResult] = await pool.execute(
        `SELECT * 
    FROM select_states_detail
    WHERE case_number = ? 
    ORDER BY create_time DESC`,
        [numId]
    );

    //可選擇狀態
    let [selectResult] = await pool.execute(`SELECT * 
    FROM status 
    WHERE name NOT IN ('評估中','已補件','取消申請','已修改需求')`);

    // handler
    // let myself = result[0].handler;
    // console.log(myself);
    let [handlerResult] = await pool.execute(`SELECT * FROM handler `);

    let [getFile] = await pool.execute(
        `SELECT a.*,b.create_time FROM upload_files_detail a JOIN application_form b ON a.case_number_id=b.case_number WHERE case_number_id = ? && b.valid=1`,
        [numId]
    );

    res.json({
        result,
        needResult,
        needSum,
        handleResult,
        selectResult,
        handlerResult,
        getFile,
    });
}

// need checked
async function putNeedChecked(req, res) {
    const { needId } = req.params;
    // console.log('n',needId);
    let [result] = await pool.execute('UPDATE application_form_detail SET checked=? WHERE id = ?', [0, needId]);
    console.log('put', result);
    res.json({ message: '取消成功' });
}
async function putUnNeedChecked(req, res) {
    const { needId } = req.params;
    let [result] = await pool.execute('UPDATE application_form_detail SET checked=? WHERE id = ?', [1, needId]);
    // console.log('put', result);
    res.json({ message: '勾選成功' });
}

// post 審理結果
async function handlePost(req, res) {
    // let nowDate = moment().format('YYYY-MM-DD HH:mm:ss');
    // console.log(req.body[0]);
    let v = req.body;
    console.log(v)
  
    // 加入審核狀態
    if (v.status !== '案件進行中') {
        let [result] = await pool.execute(
            'INSERT INTO select_states_detail (case_number, handler, select_state, remark, estimated_time,create_time) VALUES (?,?,?,?,?,?)',
            [v.caseNumber, v.handler, v.status, v.remark, '', nowDate]
        );
    } else {
        let [result] = await pool.execute(
            'INSERT INTO select_states_detail (case_number, handler, select_state, remark, estimated_time,create_time) VALUES (?,?,?,?,?,?)',
            [v.caseNumber, v.handler, v.status, v.remark, v.finishTime, nowDate]
        );
    }

    // 取得更新狀態id
    let [states] = await pool.execute('SELECT * FROM status');
    let [newState] = states.filter((d) => {
        return d.name === v.status;
    });
    // console.log('new', newState)
    // 更新申請表單狀態

    let [updateResult] = await pool.execute('UPDATE application_form SET status_id = ? WHERE case_number = ?', [
        newState.id,
        v.caseNumber,
    ]);

    if (v.status === '轉件中') {
        let [result] = await pool.execute(
          'INSERT INTO select_states_detail (case_number, handler, select_state, remark, estimated_time,create_time) VALUES (?,?,?,?,?,?)',
          [v.caseNumber, v.handler, v.status, v.remark, v.finishTime, nowDate]
        );
    }

    // console.log('addCalendar', states);
    res.json({ message: '新增成功' });
}

// put 狀態 4 -> 5
async function handleChangeState(req, res) {
    const { caseNum } = req.params;
    let handler = req.body.handler;
    // console.log(caseNum);
    let [result] = await pool.execute('UPDATE application_form SET status_id=? WHERE case_number = ?', [5, caseNum]);

    addHandleState(caseNum, handler, '評估中', '', '', nowDate);

    console.log('put', result);
    res.json({ message: '勾選成功' });
}

// post 需求
async function handlePostNeed(req, res) {
    let user = req.session.member.name;
    let handler = req.body[0];
    let v = req.body[1];
    let caseNum = v[0].case_number_id;
    // console.log(user);
    // console.log(v.length);

    let [delResult] = await pool.execute('DELETE FROM application_form_detail WHERE case_number_id = ? ', [caseNum]);

    for (let i = 0; i < v.length; i++) {
        let [postResult] = await pool.execute(
            'INSERT INTO application_form_detail (case_number_id, requirement_name, directions, checked, valid) VALUES (?,?,?,?,?)',
            [v[i].case_number_id, v[i].requirement_name, v[i].directions, 0, 1]
        );
    }

    // 變更表單狀態
    let [updateResult] = await pool.execute('UPDATE application_form SET status_id = ? WHERE case_number = ?', [
        13,
        caseNum,
    ]);

    addHandleState(caseNum, user, '已修改需求', '', '', nowDate);

    // console.log('addCalendar', states);
    res.json({ message: '新增成功' });
}

// put 接收需求
async function handleAcceptNeed(req, res) {
    const caseNum = req.params.num;
    // console.log(caseNum);

    let [result] = await pool.execute('UPDATE application_form SET status_id=? WHERE case_number = ?', [6, caseNum]);

    // console.log('addCalendar', states);
    res.json({ message: '接收成功' });
}

// put 取消申請
async function handleCancleAcc(req, res) {
    const caseNum = req.params.num;
    let user = req.body.user;
    // console.log(caseNum, user);

    let [result] = await pool.execute('UPDATE application_form SET status_id=? WHERE case_number = ?', [10, caseNum]);

    addHandleState(caseNum, user, '取消申請', '', '', nowDate);

    // console.log('addCalendar', states);
    res.json({ message: '接收成功' });
}

async function handlePostFile(req, res) {
    const numId = req.params.num;
    const arr = Object.values(req.files);
    let v = req.body;
    // 轉換類型名稱
    let [category] = await pool.execute('SELECT * FROM application_category');
    let [newState] = category.filter((d) => {
        return d.name === v.No;
    });

    for (let i = 0; i < arr.length; i++) {
        let uploadPath = __dirname + '/../uploads/' + arr[i].name;
        arr[i].mv(uploadPath, (err) => {
            if (err) {
                return res.send(err);
            }
        });
        try {
            let [files] = await pool.execute(
                'INSERT INTO upload_files_detail (case_number_id,name,file_no,valid,create_time) VALUES (?,?,?,?,?)',
                [numId, arr[i].name, newState.number + v.fileNo + [i], v.valid, v.create_time]
            );
        } catch (err) {
            console.log(err);
        }
    }

    res.send('ok2');
}

module.exports = {
    getAllApp,
    getUserIdApp,
    putNeedChecked,
    putUnNeedChecked,
    handlePost,
    handlePostNeed,
    getCaseHistory,
    handleAcceptNeed,
    handleChangeState,
    handleCancleAcc,
    handlePostFile,
};
