const mysql = require('mysql');

// 연결할 DB 정보입력
const connection = mysql.createConnection({
    host: 'database-1.cv7utmpmdsdz.ap-northeast-2.rds.amazonaws.com',
    user: 'admin',
    password: '11111111',
    database: 'miniproject',
    port: '3306',
});

connection.connect();

module.exports = connection;