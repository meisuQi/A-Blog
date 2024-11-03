// import mysql from 'mysql';
// export const db=mysql.createConnection({
//   host:'sql12.freesqldatabase.com',
//   user:"sql12742423",
//   password:"jVuwEP3kPW",
//   database:"sql12742423",
//   port:3306
// })

// // 连接到数据库
// db.connect((err) => {
//   if (err) {
//     console.error('Error connecting to MySQL:', err);
//     return;
//   }
//   console.log('Connected to MySQL database');
// });

// // 监听数据库连接错误
// db.on('error', (err) => {
//   console.error('MySQL error occurred:', err);
//   if (err.code === 'PROTOCOL_CONNECTION_LOST') {
//     console.error('Database connection was closed.');
//   } else {
//     console.error('Unexpected error:', err.code);
//   }
// });

// // 导出数据库连接对象
// export default db;

import mysql from 'mysql';

const db = mysql.createConnection({
    host: 'sql12.freesqldatabase.com', // 使用云数据库的主机名
    user: 'sql12742423',                // 数据库用户名
    password: 'jVuwEP3kPW',             // 数据库密码
    database: 'sql12742423',            // 数据库名
    port: 3306                           // 默认MySQL端口
});

// 连接数据库并处理错误
db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database.');
});
