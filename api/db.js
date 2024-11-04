import mysql from 'mysql';
export const db=mysql.createConnection({
  host:'localhost',
  user:"root",
  password:"qms199812230",
  database:"blog"
})

// 连接到数据库
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// 监听数据库连接错误
db.on('error', (err) => {
  console.error('MySQL error occurred:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('Database connection was closed.');
  } else {
    console.error('Unexpected error:', err.code);
  }
});

// 导出数据库连接对象
export default db;

