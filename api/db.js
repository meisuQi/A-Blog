// import mysql from 'mysql';
// export const db=mysql.createConnection({
//   host:'localhost',
//   user:"root",
//   password:"qms199812230",
//   database:"blog"
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
// import { Pool } from 'pg';
// // 创建 PostgreSQL 连接池
// const pool = new Pool({
//   host: 'dpg-csjo201u0jms73b3n1k0-a',  // Render 提供的主机名
//   port: 5432,                         // 默认 PostgreSQL 端口
//   user: 'blog_zoe7_user',             // Render 提供的用户名
//   password: 'UucjRVNgu8NgEuECeTKBy7OCPJSIYTc8',  // Render 提供的密码
//   database: 'blog_zoe7',              // Render 提供的数据库名称
// });

// // 连接到数据库
// pool.connect((err) => {
//   if (err) {
//     console.error('Error connecting to PostgreSQL:', err);
//     return;
//   }
//   console.log('Connected to PostgreSQL database');
// });

// // 监听数据库连接错误
// pool.on('error', (err) => {
//   console.error('PostgreSQL error occurred:', err);
//   if (err.code === 'PROTOCOL_CONNECTION_LOST') {
//     console.error('Database connection was closed.');
//   } else {
//     console.error('Unexpected error:', err.code);
//   }
// });

// // 导出数据库连接对象
// export default pool;

import pg from 'pg';
const { Pool } = pg;

// 配置 PostgreSQL 连接池
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// 连接到数据库
pool.connect((err) => {
  if (err) {
    console.error('Error connecting to PostgreSQL:', err);
    return;
  }
  console.log('Connected to PostgreSQL database');
});

// 导出数据库连接池
export default pool;
