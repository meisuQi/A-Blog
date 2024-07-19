import express from 'express'
import { login, logout, register } from '../controller/auth.js';

//router：创建一个新的路由对象。这个对象用于定义路由及其处理函数。
const router=express.Router()
//router：创建一个新的路由对象。这个对象用于定义路由及其处理函数。
router.post("/register",register)
router.post("/login",login)
router.post("/logout",logout)


export default router;