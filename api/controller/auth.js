import {db} from '../db.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';
export const register=(req,res)=>{
  //check existing user
  const q ="SELECT * FROM user Where email = ? or username= ?"
  // [req.body.email, req.body.username]: 这是一个数组，包含了传递给查询的参数值。在 SQL 查询中，通常使用参数化查询来避免 SQL 注入攻击。db.query 方法会将这些参数值安全地插入到 SQL 查询语句中的占位符 ? 中。
  db.query(q,[req.body.email,req.body.username],(err,data)=>{
    if(err) return res.json(err)
    // 在这里，将字符串 "User already exists" 转换为 JSON 格式，并作为响应体发送给客户端。
    if(data.length) return res.status(409).json("User already exists")

    //hash the password and create a user
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const q="INSERT INTO user(`username`,`email`,`password`) VALUES (?)"
    const values=[
      req.body.username,
      req.body.email,
      hash
    ]
    db.query(q,[values],(err,data)=>{
      if(err) return res.json(err)
      return res.status(200).json("user has been created!")
    })
  })

}
export const login=(req,res)=>{
  //check user
  const q="SELECT * FROM user WHERE username= (?) "
  db.query(q,[req.body.username],(err,data)=>{
    // 这里的data通常是一个包含从数据库中查询结果的数组。
    //[
  // { id: 1, username: 'john_doe', email: 'john@example.com' },
  // { id: 2, username: 'jane_smith', email: 'jane@example.com' }
  // ]
    if(err)return res.json(err);
    if(data.length===0)return res.status(404).json('User not found!')
    //check password
  const isPasswordCorrect=bcrypt.compareSync(req.body.password, data[0].password);
  if(!isPasswordCorrect)return res.status(400).json('Wrong username or password');
  //使用 jwt.sign() 方法生成一个签名的 JWT ，第一个参数是有效载荷，即包含用户 id 的对象。第二个参数是用于签名 JWT 的密钥。
    const token=jwt.sign({id:data[0].id},"jwtkey")
    
   
    //res.cookie(name, value, [options]): 这是 Express 框架中响应对象的方法，用于设置 HTTP 响应的 cookie。
    // name: cookie 的名称，在示例中是 "token"。
    // value: 要设置的 cookie 的值，在这里是之前生成的 JWT token。
    // options: 一个可选的对象，用于设置 cookie 的选项。
    // httpOnly: 如果设置为 true，则表示只有服务器可以访问此 cookie，浏览器中的 JavaScript 无法访问。这有助于防止跨站点脚本攻击（XSS）。
    res.cookie("access_token",token,{httpOnly:true}).status(200).json(data)
  })
}
export const logout=(req,res)=>{
  res.clearCookie("access_token",{
    // sameSite: "none" 表示该 cookie 可以跨站点发送。secure: true 表示 cookie 只能通过 HTTPS 连接发送，增强安全性。
    sameSite:"none",
    secure:true
  }).status(200).json("User has been logged out")
}