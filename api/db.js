import mysql from 'mysql';
export const db=mysql.createConnection({
  host:'sql12.freesqldatabase.com',
  user:"sql12742423",
  password:"jVuwEP3kPW",
  database:"sql12742423",
  port:3306
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

