import express from 'express'
import postRouters from "./routes/posts.js"
import authRouters from "./routes/auth.js"
import userRouters from "./routes/user.js"
import cookieParser from "cookie-parser" 
import bodyParser from 'body-parser';
import multer from 'multer'
const app=express();
// 增加请求体的大小限制
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

//HTTP请求的主体（body）在传输过程中是作为原始数据发送的。如果不进行解析，它只是一个未处理的字符串或二进制数据。
//express.json()中间件会将请求体解析为JavaScript对象，这样你可以在路由处理器中方便地访问这些数据。
app.use(express.json())
//当客户端发送请求时，浏览器会自动将相应的 Cookie 信息添加到请求头中，cookieParser 中间件负责解析这些 Cookie，并将解析后的数据附加到请求对象 (req) 上的 cookies 属性中
//这样，在你的后端路由处理函数中，如果需要读取或设置 Cookie，就可以直接通过 req.cookies 来访问和操作了。
app.use(cookieParser())


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


app.use('/api/posts',postRouters)
app.use('/api/auth',authRouters)
app.use('/api/user',userRouters)
app.listen(8080,()=>{
  console.log("connected to index...");
})