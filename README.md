# 项目简介

## 一、项目名称

Philo Blog

## 二、项目描述

Philo Blog 是一个基于vscode进行编程的可以进行用户注册、登录、登出，发表文章，修改文章、删除文章的博客网站

## 三、技术栈

前端：react 、sass、axios、multer、moment

后端：node.js、express 、nodemon、bcrypt 、jwt

数据库：mysql

# 安装和配置

## 一、环境要求：

Node.js 18.20.2

Express 4.19.2

Npm 10.5.0

Mysql  8.1.0

React 18.0.0

Axios 0.27.2

Sass 1.55.0

jwt  9.0.2

## 二、安装步骤

### 1.克隆项目仓库

  git clone https://github.com/example/MyProject.git

### 2.进入项目目录并安装依赖

cd api  npm install

cd client  npm install

### 3.启动并连接数据库

在vscode拓展里下载 SQLTools  然后连接数据库

并在后端api文件里，创建db.js，进行相关的数据库配置和连接：

```javascript
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
```

# 项目结构

![image-20240624201602136](/Users/a1/Library/Application Support/typora-user-images/image-20240624201602136.png)

## 一、重要文件和目录介绍

### 1.api(backend)

后端代码，包含控制器、路由、主文件、数据库连接

#### server.js

这是后端主文件，主要是负责启动和配置后端服务，处理http请求，设置路由、连接数据库等核心功能。

在这个项目里，我只将其用来实现启动后端服务和设置路由级中间件等功能，而将数据库连接和具体的路由处理函数另写在单独的文件里。

同时在这个文件里，app.use(express.json())中间件会将请求体解析为JavaScript对象，这样后续我们就可以在路由处理器中通过req.body来直接地访问这些请求数据。

app.use(cookieParser()中间件的目的是为了解析客户端发来的请求头里所携带的cookie，并将解析后的数据附加到请求对象（req）上的cookie属性中，这样在后端的router.delete("/:id",deletePost)这个API端点处，我可以直接用req.cookies来取读和设置cookie了

此外，在关于本项目的通过提交表单而上传图片文件的文件储存功能方面，需要用到multer这样一个node.js的中间件来进行相关的逻辑处理,在这个项目里，我选择的是将图片直接存储到服务器内部。

#### routes

在这个文件夹里，我分别定义了三个router对象：postRouters、authRouters、userRouters

#### dcontrollers

在这个文件夹里，分别编写了三个router对象的具体路由函数代码，包括sql语句、sql查询、响应数据，实现了用户的注册、登入登出、数据增删改查的功能

#### db.js

这个文件主要是进行数据库连接

### 2.client(frontend)

#### public 

public里面的upload是用来储存上传的照片

#### src

##### components

components文件夹里包含NavBar（导航栏）、Footer（页脚）、Menu（单篇文章旁的related articles）这三个前端组件

##### pages

pages文件夹中包含Home(主页)、Register（注册页面）、Login（登录页面）、Single（单篇文章）、Write（编辑文章页面）这五个组件

### 3.App.js

App.js里主要是进行了前端路由代码的编写，以实现pages里各页面之间的相互跳转

### 4.package.json

配置了代理，以解决前后端跨域问题

## 二、代码说明

### 1.关键功能模块

#### 用户模块

##### 1.用户注册

前端：pages/Register.jsx

```jsx
import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const [inputs, setInputs] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [err, setError] = useState(null);
//允许开发者在不需要用户手动点击链接的情况下，通过编程方式实现页面之间的导航。
  const navigate = useNavigate();

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  //异步函数在编程中的作用主要是处理那些可能耗时的操作，而不会阻塞程序的执行。它们允许程序在等待异步操作完成的同时继续执行其他任务，从而提高了程序的效率和响应性。
  const handleSubmit = async (e) => {
    //防止表单自动刷新
    e.preventDefault();
    try {
      //携带着inputs的内容发过去
      await axios.post("/auth/register", inputs);
      navigate("/login");
    } catch (err) {
      setError(err.response.data);
    }
  };

  return (
    <div className="auth">
      <h1>Register</h1>
      <form>
        <input
          required
          type="text"
          placeholder="username"
          name="username"
          onChange={handleChange}
        />
        <input
          required
          type="email"
          placeholder="email"
          name="email"
          onChange={handleChange}
        />
        <input
          required
          type="password"
          placeholder="password"
          name="password"
          onChange={handleChange}
        />
        <button onClick={handleSubmit}>Register</button>
        {err && <p>{err}</p>}
        <span>
          Do you have an account? <Link to="/login">Login</Link>
        </span>
      </form>
    </div>
  );
};

export default Register;

```

后端：controllers/auth.js

```jsx
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
```

##### 2.用户登录

前端：components/Login.jsx

```jsx
import React, { useContext } from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {useState} from 'react';
import axios from 'axios';
import { AuthContext } from '../context/authContext';
const Login = () => {
  const [inputs,setInputs]=useState({
    username:"",
    password:"",  
  })
const [err,setError]=useState(null);
const navigate=useNavigate()
//使用了 React 的 useContext 钩子从 AuthContext 中提取 login 状态。
const{login}=useContext(AuthContext)
const handleChange=e=>{
  setInputs(prev=>({...prev,[e.target.name]:e.target.value}))
}
const handleSubmit= async (e)=>{
  // e.preventDefault(): 这是事件对象 e 的一个方法，用于阻止默认事件行为。在这里，它被用来阻止表单的默认提交行为
  e.preventDefault()
  try{
   await login(inputs)
    navigate("/")
  }catch(err){
    setError(err.response.data)
  }
  
}
  return (
    <div className='auth'>
      <h1>Login</h1>
      <form >
        <input required type="text" placeholder='username' name="username" value={inputs.username} onChange={handleChange}/>
        <input required type="password" placeholder='password' name="password" value={inputs.password} onChange={handleChange}/>
        <button onClick={handleSubmit}  >Login</button>
        {err && <p>{err}</p>}
        <span>Don't you have an account? <Link to="/register">Register</Link> </span>
      </form>

    </div>
  )
}

export default Login;
```

需要 npm install jsonwebtoken

后端：controllers/auth.js

```jsx
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
  //生成一个有关userID的token
    const token=jwt.sign({id:data[0].id},"jwtkey")
    
   
    //res.cookie(name, value, [options]): 这是 Express 框架中响应对象的方法，用于设置 HTTP 响应的 cookie。
    // name: cookie 的名称，在示例中是 "token"。
    // value: 要设置的 cookie 的值，在这里是之前生成的 JWT token。
    // options: 一个可选的对象，用于设置 cookie 的选项。
    // httpOnly: 如果设置为 true，则表示只有服务器可以访问此 cookie，浏览器中的 JavaScript 无法访问。这有助于防止跨站点脚本攻击（XSS）。
    res.cookie("access_token",token,{httpOnly:true}).status(200).json(data)
  })
```

##### 3.用户登出

后端：controlled/auth.js

```jsx
export const logout=(req,res)=>{
  res.clearCookie("access_token",{
    // sameSite: "none" 表示该 cookie 可以跨站点发送。secure: true 表示 cookie 只能通过 HTTPS 连接发送，增强安全性。
    sameSite:"none",
    secure:true
  }).status(200).json("User has been logged out")
}
```

##### 4.用户认证

前端：context/authContext.jsx

```jsx
import axios from "axios";
import { createContext, useEffect, useState } from "react";

// 创建一个新的上下文对象 AuthContext，本身不包含任何数据，只是一个用于共享数据的“容器”
export const AuthContext = createContext();

// AuthContextProvider 是一个提供者组件，它使用 AuthContext.Provider 来指定上下文的值。
// AuthContextProvider 包裹的所有子组件都可以使用 useContext(AuthContext) 钩子访问这个上下文的值。
export const AuthContextProvider = ({ children }) => {
  //将string转化为object
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
	//发送登录请求并设置 currentUser 状态。
  const login = async (inputs) => {
    // 发送 POST 请求到 "auth/login" 端点，传递用户输入的登录信息，并等待响应。
    const res = await axios.post("auth/login", inputs);
    setCurrentUser(res.data);
  };
//发送注销请求并清除 currentUser 状态。
  const logout = async () => {
    await axios.post("auth/logout");
    setCurrentUser(null);
  };

  useEffect(() => {
    //每当currentUser改变时，就改变localStorage里的user，并将object转化为string
    localStorage.setItem("user", JSON.stringify(currentUser));
  }, [currentUser]);

  return (
    //// AuthContext.Provider 将上下文的值传递给{children}里所包含的所有组件。
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

```

这串代码使得各组件可以通过useContext(AuthContext) 钩子来实现对登录或登出状态信息的共享，因此在Single页面，也就可以根据判断当前用户与该本文章的用户之间的ID是否相等来决定是否显示修改和删除图标。

```jsx
 const {currentUser}=useContext(AuthContext);

{currentUser[0].username===post.username ? (<div className="edit">
        <Link to={`/write?edit=2`} state={post}><img src={edit} alt="" /></Link>
      <img onClick={handleDelete}src={Delete} alt="" />
      </div>
      ):''}
```

##### 5.密码管理

需要 npm install bcrypt

通过在用户注册时候，对密码进行加密，使得数据库中储存的是加密后的密码，从而加强账户的安全性：

```jsx
//hash the password and create a user
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);
```

同时在用户进行登录的时候，验证的也是将用户登录时的密码加密后与数据库中的密码进行比较：

```jsx
 //check password
  const isPasswordCorrect=bcrypt.compareSync(req.body.password, data[0].password);
  if(!isPasswordCorrect)return res.status(400).json('Wrong username or password');
```

#### 数据模块

##### 1.数据创建：添加新的数据

数据的添加主要是体现在用户的注册、文章的添加、文件（图片）的添加

用户添加：见用户模块/用户注册

文章和文件添加：pages/Write.jsx

```jsx
import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";

const Write = () => {
  //这里的state来自single.js里 <Link to={`/write?edit=2`} state={post}><img src={edit} alt="" /></Link>，目的是为了区分write是update还是新write11
  const state = useLocation().state;
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState(null);
  const [cat, setCat] = useState(state?.cat || "");

  const navigate = useNavigate();

  useEffect(() => {
    if (state) {
      setTitle(state.title);
      setDesc(state.desc);
    }
  }, [state]);

  const upload = async () => {
    try {
      //FormData 这个对象将用于存储我们想要发送的表单数据，包括文件和其他字段。 对象通常用于在前端向服务器发送文件上传请求，例如上传图片、视频或其他类型的文件
      const formData = new FormData();
      //这行代码将一个文件（file）添加到 FormData 对象中。 append 方法用于向 FormData 对象添加新的键值对。这里，"file" 是键，对应后端index.js里的upload.single('file')，file 是值。这个文件对象通常是从一个 <input type="file"> 元素中获取的。
      formData.append("file", file);
      const res = await axios.post("/upload", formData);
      return res.data;
    } catch (err) {
      console.log(err);
    }
  };

  const handleClick = async (e) => {
    e.preventDefault();
    const imgUrl = file ? await upload() : "";

    try {
      if (state) {
        await axios.put(`/posts/${state.id}`, {
          title,
          desc,
          cat,
          img: imgUrl,
        });
      } else {
        await axios.post(`/posts/`, {
          title,
          desc,
          cat,
          img: imgUrl,
          date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
        });
      }
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="add">
      <div className="content">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="editorContainer">
          <ReactQuill
            className="editor"
            theme="snow"
            value={desc}
            onChange={setDesc}
          />
        </div>
      </div>
      <div className="menu">
        <div className="item">
          <h1>Publish</h1>
          <span>
            <b>Status: </b> Draft
          </span>
          <span>
            <b>Visibility: </b> Public
          </span>
          <input
            style={{ display: "none" }}
            type="file"
            id="file"
            name=""
            onChange={(e) => setFile(e.target.files[0])}
          />
          <label className="file" htmlFor="file">
            Upload Image
          </label>
          <div className="buttons">
            <button>Save as a draft</button>
            <button onClick={handleClick}>Publish</button>
          </div>
        </div>
        <div className="item">
          <h1>Category</h1>
          {["art", "science", "technology", "cinema", "design", "food"].map((category) => (
            <div className="cat" key={category}>
              <input
                type="radio"
                checked={cat === category}
                name="cat"
                value={category}
                id={category}
                onChange={(e) => setCat(e.target.value)}
              />
              <label htmlFor={category}>{category.charAt(0).toUpperCase() + category.slice(1)}</label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Write;

```

后端：

文章的添加：controllers/post.js

```jsx
export const addPost=(req,res)=>{
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");
    const q="INSERT INTO posts(`title`,`desc`,`img`,`cat`,`date`,`uid`) VALUES (?)"
    const values=[
      req.body.title,
      req.body.desc,
      req.body.img,
      req.body.cat,
      req.body.date,
      userInfo.id
    ]
    db.query(q,[values],(err,data)=>{
      if (err) return res.status(500).json(err); 
      return res.json("Post has been created.")
    })
})
}

```

文件的添加：api/server.js

需要 npm install multer

```jsx
//npm DiskStorage  store img to server
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    //文件储存路径
    cb(null, '../client/public/upload')
  },
  filename: function (req, file, cb) {
    // image unique name
    cb(null, Date.now()+file.originalname)
  }
})
// 通过 multer() 函数的参数配置来设置文件上传的目标目录 dest
const upload=multer({storage: storage})

//upload.single('file')：这是 multer 中间件的方法，用于处理上传的单个文件。
//参数 'file' 表示表单中文件字段的名称，即客户端上传文件时，表单的name属性值为file
app.post('/api/upload', upload.single('file'), function (req, res) {
  const file=req.file;
  res.status(200).json(file.filename)
})
```

本项目的文件添加方式是单个文件添加，储存方式是储存在服务器内部。

##### 2.数据取读：取读现有数据

数据取读主要体现在对用户信息的取读、对文章数据的取读

用户信息的取读：controllers/auth.js

（1）注册时，判断用户名是否已经存在，在此需要查询数据库中的用户名

```jsx
export const register=(req,res)=>{
  //check existing user
  const q ="SELECT * FROM user Where email = ? or username= ?"
  // [req.body.email, req.body.username]: 这是一个数组，包含了传递给查询的参数值。在 SQL 查询中，通常使用参数化查询来避免 SQL 注入攻击。   db.query 方法会将这些参数值安全地插入到 SQL 查询语句中的占位符 ? 中。
  db.query(q,[req.body.email,req.body.username],(err,data)=>{
    if(err) return res.json(err)
    // 在这里，将字符串 "User already exists" 转换为 JSON 格式，并作为响应体发送给客户端。
    if(data.length) return res.status(409).json("User already exists")

```

（2）登录时，判断用户名、用户密码是否与数据库中的数据相匹配

```jsx
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
```

文章信息的取读：controllers/posts.js

（1）对所有文章信息的取读和对特定类型的文章信息的取读

```jsx
export const getPosts=(req,res)=>{
  // req.query 特指 URL 中 ? 后以及 # 前（如果有的话）的查询参数部分。
  //req.query.cat 是从 URL 的查询字符串中获取 cat 参数的值，比如art science...
  const  q=req.query.cat ? "SELECT * FROM posts WHERE cat= ? ":"SELECT * FROM posts";
  // req.query.cat 是从 HTTP 请求的查询字符串中获取的值，用于动态地填充 SQL 查询语句中的 ? 占位符。
  db.query(q,[req.query.cat],(err,data)=>{
    //res.json or res.send doesn't matter
    if(err)return res.status(500).send(err)
    return res.status(200).json(data)
  })
}
```

（2）对单篇文章信息的取读

```jsx
export const getPost = (req, res) => {
  // 根据当前文章ID，查询当前文章的对应的用户的文章ID、用户名、文章标题、文章详情、文章图片、用户头像、文章类型、文章发表时间的信息
  const q = "SELECT p.id,u.username, p.title, p.desc, p.img,u.img AS userImg, p.cat, p.date FROM user u JOIN posts p ON u.id = p.uid WHERE p.id = ?";
  
  // 执行数据库查询，传递正确的参数
  db.query(q, [req.params.id], (err, data) => {
    if (err) return res.status(500).json(err); // 返回适当的 HTTP 状态码
    if (data.length === 0) return res.status(404).json({ message: "Post not found" }); // 处理未找到的情况
    return res.status(200).json(data[0]); // 返回查询结果
  });
}；
```

##### 3.数据更新：修改现有数据

controllers/post.js

```jsx
export const updatePost=(req,res)=>{
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");
  const postId=req.params.id
   //jwt.verify() 方法用于验证 JWT 的有效性并解码其负载部分。如果验证成功，负载部分会被解码并传递给回调函数
  //JWT（JSON Web Token）是一个由三部分组成的字符串，分别是：
	//Header（头部）：包含令牌的类型（通常是 "JWT"）和所使用的签名算法（例如 HMAC SHA256）。
	//Payload（负载）：包含声明（claims），也就是实际传递的数据。常见的声明包括用户 ID、用户名、令牌的过期时间等。
	//Signature（签名）：用于验证令牌的真实性和完整性。
  //userInfo：如果 JWT 验证成功，该参数将包含解码后的 JWT 负载部分，即{id: data[0].id}，一个包含用户 id 的对象。
  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");
    const q="UPDATE posts SET `title`=?,`desc`=?,`img`=?,`cat`=? WHERE `id`=? AND `uid`=?"
    const values=[
      req.body.title,
      req.body.desc,
      req.body.img,
      req.body.cat
    ]
    db.query(q,[...values,postId,userInfo.id],(err,data)=>{
      if (err) return res.status(500).json(err); 
      return res.json("Post has been updated.")
    })
})
}
```

在本项目中，只有当文章作者是登录用户时，才有权限对文章内容进行修改

#### 4.数据删除：删除当前不需要的数据

删除文章：controllers/posts.js

```jsx
export const deletePost = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!"); 
  //这里的userInfo就是登录时的id:data[0].id}
  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const postId = req.params.id;
    const q = "DELETE FROM posts WHERE `id` = ? AND `uid` = ?";

    db.query(q, [postId, userInfo.id], (err, data) => {
      if (err) return res.status(403).json("You can delete only your post!");

      return res.json("Post has been deleted!");
    });
  });
};
```

在本项目中，只有当文章作者是登录用户时，才有权限对文章内容进行删除

#### 文件上传模块

##### 1.单文件(图片)上传

前端：components/Write.jsx

```jsx
const upload = async () => {
    try {
      //FormData 这个对象将用于存储我们想要发送的表单数据，包括文件和其他字段。 对象通常用于在前端向服务器发送文件上传请求，例如上传图片、视频或其他类型的文件
      const formData = new FormData();
      //这行代码将一个文件（file）添加到 FormData 对象中。 append 方法用于向 FormData 对象添加新的键值对。这里，"file" 是键，对应后端index.js里的upload.single('file')，file 是值。这个文件对象通常是从一个 <input type="file"> 元素中获取的。
      formData.append("file", file);
      const res = await axios.post("/upload", formData);
      return res.data;
    } catch (err) {
      console.log(err);
    }
  };
const handleClick = async (e) => {
    e.preventDefault();
    const imgUrl = file ? await upload() : "";
  try {
      if (state) {
        await axios.put(`/posts/${state.id}`, {
          title,
          desc,
          cat,
          img: imgUrl,
        });
      } else {
        await axios.post(`/posts/`, {
          title,
          desc,
          cat,
          img: imgUrl,
          date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
        });
      }
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

-------------------------------------------------------------------------------------------------------------------------
 <input
            style={{ display: "none" }}
            type="file"
            id="file"
            name=""
            onChange={(e) => setFile(e.target.files[0])}
          />
          <label className="file" htmlFor="file">
            Upload Image
          </label>
          <div className="buttons">
            <button>Save as a draft</button>
            <button onClick={handleClick}>Publish</button>
          </div>
```

后端：api/server.js

```jsx
//npm DiskStorage  store img to server
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../client/public/upload')
  },
  filename: function (req, file, cb) {
    // image unique name
    cb(null, Date.now()+file.originalname)
  }
})
// 通过 multer() 函数的参数配置来设置文件上传的目标目录 dest
const upload=multer({storage: storage})

//upload.single('file')：这是 multer 中间件的方法，用于处理上传的单个文件。
//参数 'file' 表示表单中文件字段的名称，即客户端上传文件时，文件字段的名字应为 'file'。即表单的name属性值
app.post('/api/upload', upload.single('file'), function (req, res) {
  const file=req.file;
  res.status(200).json(file.filename)
})

```

本项目目前仅支持单项目上传

#### API路由模块

##### 1.定义API端点

后端路由：

（1）用户相关路由

routes/auth.js

```jsx
import express from 'express'
import { login, logout, register } from '../controller/auth.js';

//router：创建一个新的路由对象。这个对象用于定义路由及其处理函数。
const router=express.Router()
//router：创建一个新的路由对象。这个对象用于定义路由及其处理函数。
router.post("/register",register)
router.post("/login",login)
router.post("/logout",logout)


export default router;
```

(2)文章相关路由

routes/posts.js

```jsx
import express from 'express'
import { addPost, deletePost, getPost, getPosts, updatePost } from '../controller/posts.js'


const router=express.Router()
router.get("/",getPosts)
router.get("/:id",getPost)
router.post("/",addPost)
router.delete("/:id",deletePost)
router.put("/:id",updatePost)


export default router;
```

（3）文件上传相关路由

api/server.js

```jsx
app.post('/api/upload', upload.single('file'), function (req, res) {
  const file=req.file;
  res.status(200).json(file.filename)
})
```

前端路由：

```jsx
//Home.js
const res= await axios.get(`/posts${cat}`)
//register
await axios.post("/auth/register", inputs);
//login
const res = await axios.post("auth/login", inputs);
//logout
await axios.post("auth/logout");
//single
const res= await axios.get(`/posts/${postId}`)
//writer
const res = await axios.post("/upload", formData);
```

##### 2.路由中间件

（1）全局中间件

api/server.js

```jsx
const app=express();
app.use('/api/posts',postRouters)
app.use('/api/auth',authRouters)
app.use('/api/user',userRouters)
```

### 2.主要组件及其作用

#### Home.jsx

本项目的主页，包含有导航栏、页脚、全部文章内容这三个部分

```jsx
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import {Link, useLocation} from 'react-router-dom'
const Home = () => {
  const[posts,setPosts]=useState([])
  
  const cat= useLocation().search
//  假设当前页面的 URL 是 http://example.com/posts?category=art&page=1，其中：useLocation().search 将返回 "?category=art&page=1"。
  useEffect(()=>{
    const fetchData=async()=>{
      try{
        const res= await axios.get(`/posts${cat}`)
        setPosts(res.data)
      }catch(err){
        console.log(err);
      }
    };
    fetchData()
  },[cat])

  const getText=(html)=>{
    const doc=new DOMParser().parseFromString(html,"text/html")
    return doc.body.textContent
  }
  return (
    <div className='home'>
      <div className="posts">
        {posts.map(post=>(
          <div className="post" key={post.id}>
          <div className="img">
            <img src={`../upload/${post.img}`}alt="" />
          </div>
          <div className="content">
            <Link className='link' to={`/post/${post.id}`}>
            <h1>{getText(post.title)}</h1>
            </Link>
            <p>{getText(post.desc)}</p>
            <button>Read More</button>
          </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Home
```

#### Register.jsx

本项目的注册页面，只有注册后，才能进行登录

```jsx
import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const [inputs, setInputs] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [err, setError] = useState(null);
//允许开发者在不需要用户手动点击链接的情况下，通过编程方式实现页面之间的导航。
  const navigate = useNavigate();

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  //异步函数在编程中的作用主要是处理那些可能耗时的操作，而不会阻塞程序的执行。它们允许程序在等待异步操作完成的同时继续执行其他任务，从而提高了程序的效率和响应性。
  const handleSubmit = async (e) => {
    //防止表单自动刷新
    e.preventDefault();
    try {
      //携带着inputs的内容发过去
      await axios.post("/auth/register", inputs);
      navigate("/login");
    } catch (err) {
      setError(err.response.data);
    }
  };

  return (
    <div className="auth">
      <h1>Register</h1>
      <form>
        <input
          required
          type="text"
          placeholder="username"
          name="username"
          onChange={handleChange}
        />
        <input
          required
          type="email"
          placeholder="email"
          name="email"
          onChange={handleChange}
        />
        <input
          required
          type="password"
          placeholder="password"
          name="password"
          onChange={handleChange}
        />
        <button onClick={handleSubmit}>Register</button>
        {err && <p>{err}</p>}
        <span>
          Do you have an account? <Link to="/login">Login</Link>
        </span>
      </form>
    </div>
  );
};

export default Register;

```

#### Login.jsx

本项目的登录页面,只有当用户登录后才能进行文章发布、修改等操作

```jsx
import React, { useContext } from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {useState} from 'react';
import axios from 'axios';
import { AuthContext } from '../context/authContext';
const Login = () => {
  const [inputs,setInputs]=useState({
    username:"",
    password:"",  
  })
const [err,setError]=useState(null);
const navigate=useNavigate()
//使用了 React 的 useContext 钩子从 AuthContext 中提取 login 状态。
const{login}=useContext(AuthContext)
const handleChange=e=>{
  setInputs(prev=>({...prev,[e.target.name]:e.target.value}))
}
const handleSubmit= async (e)=>{
  // e.preventDefault(): 这是事件对象 e 的一个方法，用于阻止默认事件行为。在这里，它被用来阻止表单的默认提交行为
  e.preventDefault()
  try{
   await login(inputs)
    navigate("/")
  }catch(err){
    setError(err.response.data)
  }
  
}
  return (
    <div className='auth'>
      <h1>Login</h1>
      <form >
        <input required type="text" placeholder='username' name="username" value={inputs.username} onChange={handleChange}/>
        <input required type="password" placeholder='password' name="password" value={inputs.password} onChange={handleChange}/>
        <button onClick={handleSubmit}  >Login</button>
        {err && <p>{err}</p>}
        <span>Don't you have an account? <Link to="/register">Register</Link> </span>
      </form>

    </div>
  )
}

export default Login;
```

#### Single.jsx

单篇文章，只有在此页面，当用户名=文章ID名，那么才能对文章内容进行删除和修改

```jsx
import React, { useContext, useEffect, useState } from 'react';
import edit from '../img/edit.png';
import Delete from '../img/delete.png';
import {Link, useLocation, useNavigate, useParams} from 'react-router-dom';
import Menu from '../components/Menu';
import axios from 'axios';
import moment from 'moment';
import { AuthContext } from '../context/authContext';

const Single = () => {
  const[post,setPost]=useState({})
  
  const location=useLocation()
  const navigate=useNavigate()
  const postId=location.pathname.split('/')[2]
  const {currentUser}=useContext(AuthContext);
  useEffect(()=>{
    const fetchData=async()=>{
      try{
        const res= await axios.get(`/posts/${postId}`)
        setPost(res.data)
      }catch(err){
        console.log(err);
      }
    };
    fetchData()
  },[postId])
  const handleDelete=async ()=>{
    try{
      await axios.delete(`/posts/${postId}`,{withCredentials: true})
      
      navigate("/")
    }catch(err){
      console.log(err);
    }
  };
  const getText = (html) =>{
    const doc = new DOMParser().parseFromString(html, "text/html")
    return doc.body.textContent
  }
  return (
    <div className='single'>
      <div className="content">
        <img src={`../upload/${post?.img}`}></img>
        <div className="user">
        {post.userImg &&<img src={post.userImg} alt="" />}
        <div className="info">
        <span>{post.username}</span>
        <p>Posted {moment(post.date).fromNow()}</p>
      </div>
      {currentUser[0].username===post.username ? (<div className="edit">
        <Link to={`/write?edit=2`} state={post}><img src={edit} alt="" /></Link>
      <img onClick={handleDelete}src={Delete} alt="" />
      </div>
      ):''}
      </div> 
      <h1>{getText(post.title)}</h1>
      {/* ：整个表达式dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.desc) }}的意思是，首先使用DOMPurify.sanitize方法净化post.desc变量中的HTML内容，然后将净化后的HTML作为__html属性的值，设置到<p>元素的内部 */}
      <p>{getText(post.desc)}</p> 
      </div>
      {/* 将 post.cat 的值作为 cat 属性传递给名为 Menu 的组件 */}
      <Menu cat={post.cat}/>
    </div>
  )
}

export default Single

```

#### Write.jsx

对文章进行修改或者发布新的文章

```jsx
import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";

const Write = () => {
  //这里的state来自single.js里 <Link to={`/write?edit=2`} state={post}><img src={edit} alt="" /></Link>，目的是为了区分write是update还是新write11
  const state = useLocation().state;
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState(null);
  const [cat, setCat] = useState(state?.cat || "");

  const navigate = useNavigate();

  useEffect(() => {
    if (state) {
      setTitle(state.title);
      setDesc(state.desc);
    }
  }, [state]);

  const upload = async () => {
    try {
      //FormData 这个对象将用于存储我们想要发送的表单数据，包括文件和其他字段。 对象通常用于在前端向服务器发送文件上传请求，例如上传图片、视频或其他类型的文件
      const formData = new FormData();
      //这行代码将一个文件（file）添加到 FormData 对象中。 append 方法用于向 FormData 对象添加新的键值对。这里，"file" 是键，对应后端index.js里的upload.single('file')，file 是值。这个文件对象通常是从一个 <input type="file"> 元素中获取的。
      formData.append("file", file);
      const res = await axios.post("/upload", formData);
      return res.data;
    } catch (err) {
      console.log(err);
    }
  };

  const handleClick = async (e) => {
    e.preventDefault();
    const imgUrl = file ? await upload() : "";

    try {
      if (state) {
        await axios.put(`/posts/${state.id}`, {
          title,
          desc,
          cat,
          img: imgUrl,
        });
      } else {
        await axios.post(`/posts/`, {
          title,
          desc,
          cat,
          img: imgUrl,
          date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
        });
      }
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="add">
      <div className="content">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="editorContainer">
          <ReactQuill
            className="editor"
            theme="snow"
            value={desc}
            onChange={setDesc}
          />
        </div>
      </div>
      <div className="menu">
        <div className="item">
          <h1>Publish</h1>
          <span>
            <b>Status: </b> Draft
          </span>
          <span>
            <b>Visibility: </b> Public
          </span>
          <input
            style={{ display: "none" }}
            type="file"
            id="file"
            name=""
            onChange={(e) => setFile(e.target.files[0])}
          />
          <label className="file" htmlFor="file">
            Upload Image
          </label>
          <div className="buttons">
            <button>Save as a draft</button>
            <button onClick={handleClick}>Publish</button>
          </div>
        </div>
        <div className="item">
          <h1>Category</h1>
          {["art", "science", "technology", "cinema", "design", "food"].map((category) => (
            <div className="cat" key={category}>
              <input
                type="radio"
                checked={cat === category}
                name="cat"
                value={category}
                id={category}
                onChange={(e) => setCat(e.target.value)}
              />
              <label htmlFor={category}>{category.charAt(0).toUpperCase() + category.slice(1)}</label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Write;

```

#### NavBar.jsx

文章导航栏，包含项目logo，文章分类板块、登录状态、write模块，其中当用户登录后，会显示用户名。当点击不同文章类型后，主页就会只显示该类型的文章

```jsx
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import Logo from "../img/logo.png";

const Navbar = () => {
  const { currentUser, logout } = useContext(AuthContext);

  return (
    <div className="navbar">
      <div className="container">
        <div className="logo">
          <Link to="/">
          <img src={Logo} alt="" />
          </Link>
        </div>
        <div className="links">
          <Link className="link" to="/?cat=art">
            <h6>ART</h6>
          </Link>
          <Link className="link" to="/?cat=science">
            <h6>SCIENCE</h6>
          </Link>
          <Link className="link" to="/?cat=technology">
            <h6>TECHNOLOGY</h6>
          </Link>
          <Link className="link" to="/?cat=philosophy">
            <h6>PHILOSOPHY</h6>
          </Link>
          <Link className="link" to="/?cat=marxism">
            <h6>MARXISM</h6>
          </Link>
          <Link className="link" to="/?cat=current_affair">
            <h6>CURRENT AFFAIR</h6>
          </Link>
          <span>{currentUser[0]?.username}</span>
          {currentUser ? (
            <span onClick={logout}>Logout</span>
          ) : (
            <Link className="link" to="/login">
              Login
            </Link>
          )}
          <div className="write">
            <Link className="link" to="/write">
              Write
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;

```

#### Footer.jsx

显示项目logo、版权信息

```jsx
import React from 'react'
import logo from '../img/logo.png';
const Footer1 = () => {
  return (
    <footer>
      <img src={logo} alt="" />
      <span>Made with Sue and <b>React.js</b></span>
    </footer>
  )
}

export default Footer1
```

#### Menu.jsx

出现在单篇文章右侧，显示出与该篇文章同类型的所有文章

```jsx
import axios from 'axios';
import React, { useEffect, useState } from 'react'

const Menu = ({cat}) => {
  const[posts,setPosts]=useState([])  
  useEffect(()=>{
    const fetchData=async()=>{
      try{
        // 这里的cat是数据库里post.cat的值
        const res= await axios.get(`/posts/?cat=${cat}`)
        setPosts(res.data)
      }catch(err){
        console.log(err);
      }
    };
    fetchData()
  },[cat])
  
  const getText = (html) =>{
    const doc = new DOMParser().parseFromString(html, "text/html")
    return doc.body.textContent
  }
  return (
    <div className="menu">
      <h1>Other posts you may like </h1>
      {posts.map(post=>(
        <div className="post" key={post.id}>
          <img src={`../upload/${post.img}`} alt="" />
          <h2>{getText(post.title)}</h2>
          <button>Read More</button>
        </div>
      ))}
    </div>
  )
}

export default Menu
```

#### controllers

##### Auth.js 

用户注册、登录、登出的后端逻辑

```jsx
import {db} from '../db.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';
//注册
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
//登录
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
//登出
export const logout=(req,res)=>{
  res.clearCookie("access_token",{
    // sameSite: "none" 表示该 cookie 可以跨站点发送。secure: true 表示 cookie 只能通过 HTTPS 连接发送，增强安全性。
    sameSite:"none",
    secure:true
  }).status(200).json("User has been logged out")
}
```

##### Posts.js

获取所有文章、特定类型文章，获取单篇文章，添加文章，删除文章，修改文章的后端逻辑处理

```jsx
import {db}from '../db.js'
import jwt from 'jsonwebtoken'
//获取所有文章、特定类型文章
export const getPosts=(req,res)=>{
  // req.query 特指 URL 中 ? 后以及 # 前（如果有的话）的查询参数部分。
  //req.query.cat 是从 URL 的查询字符串中获取 cat 参数的值，比如art science...
  const  q=req.query.cat ? "SELECT * FROM posts WHERE cat= ? ":"SELECT * FROM posts";
  // req.query.cat 是从 HTTP 请求的查询字符串中获取的值，用于动态地填充 SQL 查询语句中的 ? 占位符。
  db.query(q,[req.query.cat],(err,data)=>{
    //res.json or res.send doesn't matter
    if(err)return res.status(500).send(err)
    return res.status(200).json(data)
  })
}

//获取单篇文章
export const getPost = (req, res) => {
  // 确认 SQL 查询语句的正确性
  const q = "SELECT p.id,u.username, p.title, p.desc, p.img,u.img AS userImg, p.cat, p.date FROM user u JOIN posts p ON u.id = p.uid WHERE p.id = ?";
  
  // 执行数据库查询，传递正确的参数
  db.query(q, [req.params.id], (err, data) => {
    if (err) return res.status(500).json(err); // 返回适当的 HTTP 状态码
    if (data.length === 0) return res.status(404).json({ message: "Post not found" }); // 处理未找到的情况
    return res.status(200).json(data[0]); // 返回查询结果
  });
};

//添加文章
export const addPost=(req,res)=>{
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");
    const q="INSERT INTO posts(`title`,`desc`,`img`,`cat`,`date`,`uid`) VALUES (?)"
    const values=[
      req.body.title,
      req.body.desc,
      req.body.img,
      req.body.cat,
      req.body.date,
      userInfo.id
    ]
    db.query(q,[values],(err,data)=>{
      if (err) return res.status(500).json(err); 
      return res.json("Post has been created.")
    })
})
}

//删除文章
export const deletePost = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!"); 
  //这里的userInfo就是登录时的id:data[0].id}
  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const postId = req.params.id;
    const q = "DELETE FROM posts WHERE `id` = ? AND `uid` = ?";

    db.query(q, [postId, userInfo.id], (err, data) => {
      if (err) return res.status(403).json("You can delete only your post!");

      return res.json("Post has been deleted!");
    });
  });
};

//修改文章
export const updatePost=(req,res)=>{
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");
  const postId=req.params.id
  //检查提供的 JWT 是否有效
  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");
    const q="UPDATE posts SET `title`=?,`desc`=?,`img`=?,`cat`=? WHERE `id`=? AND `uid`=?"
    const values=[
      req.body.title,
      req.body.desc,
      req.body.img,
      req.body.cat
    ]
    db.query(q,[...values,postId,userInfo.id],(err,data)=>{
      if (err) return res.status(500).json(err); 
      return res.json("Post has been updated.")
    })
})
}
```

# 如何运行项目

## 一、启动后端服务器

cd api

npm start

## 二、启动前端服务器

cd client

npm start

## 三、在浏览器中打开 http://localhost:3000



# 常见问题及解决方案

## 1.跨域问题

一定要仔细检查前后端URL是否相匹配，如果不匹配就会出现AxiosError Failed to load resource: the server responded with a status of 404 (Not Found)的问题

## 2.useContext

在Single页面，进行对当前用户和当前文章ID的判断以决定是否显示修改和删除图标时，要注意通过用const {currentUser}=useContext(AuthContext)钩子传过来的cuurentUser是一个对象，因此在进行比较的时候，应写成{currentUser[0].username=post.username ，而不是{currentUser.username=post.username }，因为currentUser.username返回的是undefined.

## 3.sql语句

应当仔细检查sql语句的写法，否则将会查不到想查的结果，尤其是在controllers/posts里的获取单篇文章的sql语句里，由于user表和posts表都存在img这个column，如果都写成img就会造成冲突，因此需要给两个表起个别名，如 user u ,posts p ，然后通过 u.img ,p.img来区分两种的img，由此可以查询到理想的数据

## 4.img的路径

当通过multer将图片文件储存在本地服务器后，就需要将原来的在其他组件中写的img路径改成符合在multer中设置的文件路径，即'../client/public/upload'

## 5.<p>标签

由于我的write页面中的文本框运用的是富文本编辑器(npm react-quill),因此它会在用户输入或粘贴文本时自动添加 `<p>` 标签来包裹段落。这样做是为了确保 HTML 结构的完整性和语义性。为了去除掉这个无必要的<p>标签呈现，可以在相应部分添加如下代码：

```jsx
 const getText = (html) =>{
    const doc = new DOMParser().parseFromString(html, "text/html")
    return doc.body.textContent
  }
```

然后将要存在<p>标签的部分，调用geText函数，由此就会返回这个 HTML 文本中的纯文本内容

```jsx
<h1>{getText(post.title)}</h1>
      {/* ：整个表达式dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.desc) }}的意思是，首先使用DOMPurify.sanitize方法净化post.desc变量中的HTML内容，然后将净化后的HTML作为__html属性的值，设置到<p>元素的内部 */}
      <p>{getText(post.desc)}</p> 
      </div>
```

# 项目优化及后续添加功能

![image-20240625181119284](/Users/a1/Library/Application Support/typora-user-images/image-20240625181119284.png)

# 附录

本项目需要额外下载的一些库：

## 1.moment

目的是在single页面呈现出该文章发表时间与当下时间的差值

npm install moment 

## 2.multer

用于上传文件以及文件储存的功能实现

npm install multer   
   https://www.npmjs.com/package/multer

## 3. react-quill

富文本编辑器

npm react-quill

## 4.react-router-dom

用于实现前端页面跳转

 npm install react-router-dom

 https://reactrouter.com/en/main/start/tutorial

## 5.axios

用于编写前端路由

npm install axios

## 6.bcrypt

用于对密码加密

npm install bcryptjs

## 7.cookie-parser

用于解析HTTP请求中的

npm install cookie-parser

## 8.jsonwebtoken

用于生成和验证JSON Web 

npm install jsonwebtoken

## 9.nodemon

用于在开发时自动重启Node.js应用

npm install nodemon

## 10.mysql

npm  install mysql 

## 11.express

npm install express

## 12dompurify sanitize-html 

使用 DOMPurify 进行净化 HTML 内容，可以防止潜在的 XSS 攻击。

npm install dompurify sanitize-html 



# 项目更新部分

## 1.优化了注册页面和登录页面的样式

## 2.优化了home页面的图片显示部分，使得背景方框能随图片大小而实时调整

```jsx
// 使用 useRef 创建图片容器的引用数组 imgContainerRefs
  const imgContainerRefs = useRef([]);

  // 动态设置伪元素大小
  useEffect(() => {
    const updatePseudoElementSize = () => {
      //遍历 imgContainerRefs.current 数组，对每个数组元素执行特定的操作。
      //current: 是 useRef 返回的可变对象中的一个属性，用来存储当前的引用值，初始值为 []
      //imgContainer 是当前迭代的数组元素，代表一个 DOM 元素，通常是一个包含图片的容器元素，index 是当前元素的索引
      imgContainerRefs.current.forEach((imgContainer, index) => {
        //从当前 imgContainer 元素中查找第一个 <img> 标签，并将其引用赋给变量 img。
        const img = imgContainer.querySelector('img');
        if (img) {
          //img.offsetWidth: 是 img 元素的宽度，以像素为单位。offsetWidth 表示元素在不使用滚动条的情况下，将元素的边框外的宽度量测出来。
          //+ 'px': 是将 img.offsetWidth 转换为字符串，并附加 'px' 单位。
          const imgWidth = img.offsetWidth + 'px';
          const imgHeight = img.offsetHeight + 'px';
          //.style.setProperty('--img-width', imgWidth): 这是 DOM 元素的 CSS 操作方法，用于设置元素的 CSS 自定义属性。
          //--img-width: 是一个自定义属性名，以 -- 开头，表示这是一个 CSS 自定义属性，用于存储图片容器的宽度。
          //imgWidth: 是之前获取的 <img> 元素的宽度，并转换为字符串形式，附加了像素单位 'px'。
          imgContainer.style.setProperty('--img-width', imgWidth);
          imgContainer.style.setProperty('--img-height', imgHeight);
        }
      });
    };

    // 初始化伪元素大小
    updatePseudoElementSize();

    // 在窗口调整大小时更新伪元素大小
    window.addEventListener('resize', updatePseudoElementSize);
    return () => window.removeEventListener('resize', updatePseudoElementSize);
  }, [posts]);

  return (
    <div className='home'>
      <div className="posts">
        {posts.map((post, index) => (
          <div className="post" key={post.id}>
            <div className="img" ref={el => imgContainerRefs.current[index] = el}>
              <img src={`../upload/${post.img}`} alt="" />
            </div>
            <div className="content">
              <Link className='link' to={`/post/${post.id}`}>
                <h1>{getText(post.title)}</h1>
              </Link>
              <p>{getText(post.desc)}</p>
              <button>Read More</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
```

```scss
.home{
        .img{
          // flex-grow: 2：项目可以根据容器剩余空间进行扩展，占据可用剩余空间的两倍。flex-shrink: 1：项目可以根据需要进行收缩，以适应容器的空间。flex-basis: 0%：项目的初始主轴尺寸为 0，即所有空间都由 flex-grow 来分配
          flex: 2;
          position: relative;
          display: inline-block;
          margin-top: 50px;
          &::after{
            content: '';
            display: block;
            width: var(--img-width); /* 使用 CSS 自定义属性 */
            height: var(--img-height); /* 使用 CSS 自定义属性 */
            background-color: $lightGreen; /* 使用实际颜色代替 $lightGreen */
            position: absolute;
            top: 20px;
            left: -20px;
            z-index: -1;
          }
          img{
            width: 100%;
            // max-height: 400px; /* 最大高度 */
            object-fit: cover;
            display: block;
            margin: 10px;
            border:1px solid $lightGreen;
          }
        }
```

## 3.优化了文章显示形式，点击read more 可以显示全部的文章内容，点击read less 则只显示文章前400字的内容

```jsx
 // 新的状态来跟踪显示状态
  const [showFullContent, setShowFullContent] = useState({}); 
  
  // 切换文章显示状态
  const toggleReadMore = (id) => {
    setShowFullContent((prev) => ({
      // !prev[id] 是取反操作，最开始的状态是 false，当点击read more后变为true；
      //再点击一次read less就又会变为false。
      ...prev,
      [id]: !prev[id],
    }));
  };
  
  <div className="content">
              <Link className='link' to={`/post/${post.id}`}>
                <h1>{getText(post.title)}</h1>
              </Link>
              <p>
                {showFullContent[post.id]
                  ? getText(post.desc)
                  // .substring(0, 100) 对提取的纯文本内容进行截取，只保留前 400 个字符。... 表示截取后添加省略号，以指示内容被截断。
                  : `${getText(post.desc).substring(0, 400)}...`}
              </p>
              <button onClick={() => toggleReadMore(post.id)}>
                {showFullContent[post.id] ? "Show Less" : "Read More"}
              </button>
            </div>
```

## 4.优化富文本编辑器，使得在富文本编辑器里编辑的格式能够同时显示在网页中

```jsx
//Home.jsx
//npm install dompurify sanitize-html 使用 DOMPurify 进行净化 HTML 内容，可以防止潜在的 XSS 攻击。
import DOMPurify from 'dompurify';

<div
                className="post-desc"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(showFullContent[post.id]) ? post.desc : `${post.desc.substring(0, 400)}...` }}
              />
              <button onClick={() => toggleReadMore(post.id)}>
                {showFullContent[post.id] ? "Show Less" : "Read More"}
              </button>
            </div>




//single.jsx
import DOMPurify from 'dompurify';


{/* 使用 dangerouslySetInnerHTML 并对 HTML 进行净化 */}
        <div 
          className="post-content" 
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.desc) }} 
        />
      </div>
```

## 5.给single页面的menu添加按钮，使得点击read more可以直接导航到该文章的single页面

```jsx
//menu.js
 <Link className='read' to={`/post/${post.id}`}><button>Read More</button></Link>
 
 //app.js
 {
        path: "/",
        element: <Menu />,
      }
```

## 6.文章修改提交部分

在进行文章修改的时候，没有点击upload image的时候，之前上传的图片仍旧存在，只有当点击upload image的时候，如果没有上传文件，那么图片为无，如果上传了新的文件，那么图片就是新上传后的图片

1.  
2.  当用户进入编辑页面时，加载现有文章的数据，包括标题、描述、图片 URL 等。
3.  在上传新图片时，更新组件状态中的 `file` 状态，这样在保存文章时可以使用它来判断是否需要上传新图片。
4.  在保存文章时，根据是否有新上传的文件来决定发送给后端的数据。如果有新文件，则上传新文件并更新数据库中的图片字段；如果没有新文件，则只更新其他字段而保持原有图片。

```jsx
const Write = () => {
  const state = useLocation().state; // 获取来自路由的状态，用于判断是否是编辑模式
  
  useEffect(() => {
    if (state) {
     
      setCurrentImg(state.img); // 设置当前文章的图片 URL
    }
  }, [state]);

  // 上传文件函数
  const upload = async () => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post("/upload", formData);
      return res.data;
    } catch (err) {
      console.log(err);
    }
  };

  // 点击处理函数，用于发布或更新文章
  const handleClick = async (e) => {
    e.preventDefault();

    let imgUrl = currentImg; // 默认使用当前文章的图片 URL

    if (file) {
      // 如果有新上传的文件，则上传新文件并获取新的图片 URL
      imgUrl = await upload();
    }
    
    
      <div className="buttons">
            <button onClick={handleClick}>Publish</button>
          </div>
```

在这个更新后的组件中，注意以下几点：

- `file` 状态用于存储用户选择的文件。
- 在点击 "Publish" 按钮时，先判断是否有新上传的文件 (`file` 状态)，如果有则先上传新文件获取图片 URL，否则使用当前文章的图片 URL (`currentImg` 状态)。
- 在编辑文章时，初始加载时将当前文章的图片 URL 设置到 `currentImg` 状态，这样在保存时可以保持原有图片。

## 7.增加用户设置组件，可以实现修改用户名、密码、并且可以上传头像、修改头像等功能



## 8.注册页面添加短信或邮件认证功能

## 9.富文本编辑器里如何添加多张图片？

```jsx
//write


import Quill from "quill";

//导入了 Quill 富文本编辑器中的字体格式
const Font = Quill.import('formats/font');
//设置了允许在编辑器中使用的字体白名单，这里包括 Arial、Serif 和 Monospace。
Font.whitelist = ['arial', 'serif', 'monospace'];
//设置好的字体格式注册到 Quill 编辑器中，第二个参数 true 表示覆盖任何现有的字体设置
Quill.register(Font, true);

const modules = {
  //toolbar 是一个数组，定义了编辑器中显示的每个工具栏组件及其配置
  toolbar: [
    //定义了字体工具，使用了前面定义的字体白名单
    [{ 'font': Font.whitelist }],
    //定义字体大小
    [{ 'size': ['small', false, 'large', 'huge'] }],
    //定义了文字颜色和背景色工具
    [{ 'color': [] }, { 'background': [] }],
    //定义了文本对齐工具，可以选择左对齐、居中、右对齐等
    [{ 'align': [] }],
    //定义了文本对齐工具，可以选择左对齐、居中、右对齐等
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    //定义了文本对齐工具，可以选择左对齐、居中、右对齐等
    ['bold', 'italic', 'underline', 'strike'],
    //定义了文本对齐工具，可以选择左对齐、居中、右对齐等
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    //定义了链接和插入图片的工具。
    ['link', 'image'],
    //定义了清除格式的工具，可以清除选中文本的所有样式和格式
    ['clean']
  ],
  //指的是在 react-quill 富文本编辑器中，剪贴板操作不会按照视觉格式来匹配粘贴的文本内容。这意味着在复制和粘贴文本时，编辑器不会尝试保留原始文本的视觉样式，而是将其转换为编辑器当前的样式设置。这样做可以更好地控制粘贴内容的一致性和预期行为，避免因为不同网页或文本编辑器的样式差异导致的意外结果。
  clipboard: {
    matchVisual: false,
  }
};
//formats 数组列出了编辑器中支持的所有格式
const formats = [
  'font',
  'size',
  'color',
  'background',
  'align',
  'indent',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'link', 'image'
];
```

### 注意在进行这部操作的时候，会报如下三个错：

#### 1.`PayloadTooLargeError: request entity too large`

 表示发送的请求体（request body）太大，超过了服务器允许的最大大小。默认情况下，`body-parser` 中间件的限制是 100KB。如果上传的文件或发送的数据超过这个大小，就会出现这个错误。

```
PayloadTooLargeError: request entity too large
    at readStream (/Users/a1/Desktop/programs/ Full Stack Blog App Tutorial/api/node_modules/raw-body/index.js:163:17)
    at getRawBody (/Users/a1/Desktop/programs/ Full Stack Blog App Tutorial/api/node_modules/raw-body/index.js:116:12)
    at read (/Users/a1/Desktop/programs/ Full Stack Blog App Tutorial/api/node_modules/body-parser/lib/read.js:79:3)
    at jsonParser (/Users/a1/Desktop/programs/ Full Stack Blog App Tutorial/api/node_modules/body-parser/lib/types/json.js:138:5)
    at Layer.handle [as handle_request] (/Users/a1/Desktop/programs/ Full Stack Blog App Tutorial/api/node_modules/express/lib/router/layer.js:95:5)
    at trim_prefix (/Users/a1/Desktop/programs/ Full Stack Blog App Tutorial/api/node_modules/express/lib/router/index.js:328:13)
    at /Users/a1/Desktop/programs/ Full Stack Blog App Tutorial/api/node_modules/express/lib/router/index.js:286:9
    at Function.process_params (/Users/a1/Desktop/programs/ Full Stack Blog App Tutorial/api/node_modules/express/lib/router/index.js:346:12)
    at next (/Users/a1/Desktop/programs/ Full Stack Blog App Tutorial/api/node_modules/express/lib/router/index.js:280:10)
    at expressInit (/Users/a1/Desktop/programs/ Full Stack Blog App Tutorial/api/node_modules/express/lib/middleware/init.js:40:5)
PayloadTooLargeError: request entity too large
    at readStream (/Users/a1/Desktop/programs/ Full Stack Blog App Tutorial/api/node_modules/raw-body/index.js:163:17)
    at getRawBody (/Users/a1/Desktop/programs/ Full Stack Blog App Tutorial/api/node_modules/raw-body/index.js:116:12)
    at read (/Users/a1/Desktop/programs/ Full Stack Blog App Tutorial/api/node_modules/body-parser/lib/read.js:79:3)
    at jsonParser (/Users/a1/Desktop/programs/ Full Stack Blog App Tutorial/api/node_modules/body-parser/lib/types/json.js:138:5)
    at Layer.handle [as handle_request] (/Users/a1/Desktop/programs/ Full Stack Blog App Tutorial/api/node_modules/express/lib/router/layer.js:95:5)
    at trim_prefix (/Users/a1/Desktop/programs/ Full Stack Blog App Tutorial/api/node_modules/express/lib/router/index.js:328:13)
    at /Users/a1/Desktop/programs/ Full Stack Blog App Tutorial/api/node_modules/express/lib/router/index.js:286:9
    at Function.process_params (/Users/a1/Desktop/programs/ Full Stack Blog App Tutorial/api/node_modules/express/lib/router/index.js:346:12)
    at next (/Users/a1/Desktop/programs/ Full Stack Blog App Tutorial/api/node_modules/express/lib/router/index.js:280:10)
    at expressInit (/Users/a1/Desktop/programs/ Full Stack Blog App Tutorial/api/node_modules/express/lib/middleware/init.js:40:5)

```

解决方法：

```jsx
//server.js
import bodyParser from 'body-parser';
// 增加请求体的大小限制
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
```

#### 2.数据库desc字段的data type设置得太小了

解决方法：

将数据库desc字段的data type设置为long text即可

#### 3.一个名为 `babel-preset-react-app` 的依赖正在使用 `@babel/plugin-proposal-private-property-in-object` 插件，但它没有在自己的依赖项中声明这一插件。目前，这个插件存在于你的 `node_modules` 文件夹中，但这是因为一些不相关的原因。如果某些依赖项发生变化，这可能会导致项目在未来的某个时间点出现错误。

```
webpack compiled with 1 warning
One of your dependencies, babel-preset-react-app, is importing the
"@babel/plugin-proposal-private-property-in-object" package without
declaring it in its dependencies. This is currently working because
"@babel/plugin-proposal-private-property-in-object" is already in your
node_modules folder for unrelated reasons, but it may break at any time.

babel-preset-react-app is part of the create-react-app project, which
is not maintianed anymore. It is thus unlikely that this bug will
ever be fixed. Add "@babel/plugin-proposal-private-property-in-object" to
your devDependencies to work around this error. This will make this message
go away.
ChatGPT

```

解决方法：

在后端package.json的devDependencies中添加

```jsx
"devDependencies": {
    "@babel/plugin-proposal-private-property-in-object": "^7.14.5"  
  }
```



## 10.添加评论、点赞、分享（收藏）功能

## 11.优化single页面的logout

## 12.增加搜索用户（关注用户（maybe拉黑））、文章功能

## 13.在write页面，在没有点击publish的时候，status显示draft.visiblity也可以选择，点击 save as draft时，不发表，但是文本也没有消失，即使刷新页面，在此点击draft的时候，可以在富文本编辑器里显示出draft的文本内容，但是点击publish的时候就发表。

