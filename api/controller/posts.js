// import { db } from '../db.js';
// import jwt from 'jsonwebtoken';

// export const getPosts = (req, res) => {
//   const q = req.query.cat ? "SELECT * FROM posts WHERE cat = ?" : "SELECT * FROM posts";
//   db.query(q, [req.query.cat], (err, data) => {
//     if (err) return res.status(500).json(err);
//     return res.status(200).json(data);
//   });
// };

// export const getPost = (req, res) => {
//   const q = "SELECT p.id, u.username, p.title, p.desc, p.img, u.img AS userImg, p.cat, p.date " +
//             "FROM user u JOIN posts p ON u.id = p.uid WHERE p.id = ?";
//   db.query(q, [req.params.id], (err, data) => {
//     if (err) return res.status(500).json(err);
//     if (data.length === 0) return res.status(404).json({ message: "Post not found" });
//     return res.status(200).json(data[0]);
//   });
// };

// export const addPost = (req, res) => {
//   const token = req.cookies.access_token;
//   if (!token) return res.status(401).json("Not authenticated!");

//   jwt.verify(token, "jwtkey", (err, userInfo) => {
//     if (err) return res.status(403).json("Token is not valid!");
//         const q = "INSERT INTO posts(`title`, `desc`, `img`, `cat`, `date`, `uid`) VALUES (?)";
//         const values = [
//           req.body.title,
//           req.body.desc,
//           req.body.img,
//           req.body.cat,
//           req.body.date,
//           userInfo.id
//         ];

//         db.query(q, [values], (err, data) => {
//           if (err) {
//             console.error('Error inserting post:', err);
//             return res.status(500).json(err);
//           }

//           return res.json("Post has been created.");
//         });
//       });
//   };
// ;

// export const deletePost = (req, res) => {
//   const token = req.cookies.access_token;
//   if (!token) return res.status(401).json("Not authenticated!");

//   jwt.verify(token, "jwtkey", (err, userInfo) => {
//     if (err) return res.status(403).json("Token is not valid!");

//     const postId = req.params.id;
//     const q = "DELETE FROM posts WHERE `id` = ? AND `uid` = ?";

//     db.query(q, [postId, userInfo.id], (err, data) => {
//       if (err) return res.status(403).json("You can delete only your post!");

//       return res.json("Post has been deleted!");
//     });
//   });
// };

// export const updatePost = (req, res) => {
//   const token = req.cookies.access_token;
//   if (!token) return res.status(401).json("Not authenticated!");

//   const postId = req.params.id;
//   jwt.verify(token, "jwtkey", (err, userInfo) => {
//     if (err) return res.status(403).json("Token is not valid!");

//     const q = "UPDATE posts SET `title` = ?, `desc` = ?, `img` = ?, `cat` = ? WHERE `id` = ? AND `uid` = ?";
//     const values = [
//       req.body.title,
//       req.body.desc,
//       req.body.img,
//       req.body.cat,
//       postId,
//       userInfo.id
//     ];

//     db.query(q, values, (err, data) => {
//       if (err) return res.status(500).json(err);
//       return res.json("Post has been updated.");
//     });
//   });
// };

import pool from '../db.js';
import jwt from 'jsonwebtoken';

export const getPosts = async (req, res) => {
  const q = req.query.cat ? "SELECT * FROM posts WHERE cat = $1" : "SELECT * FROM posts";
  
  try {
    const { rows: data } = await pool.query(q, req.query.cat ? [req.query.cat] : []);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const getPost = async (req, res) => {
  const q = `
    SELECT p.id, u.username, p.title, p.desc, p.img, u.img AS userImg, p.cat, p.date 
    FROM "user" u 
    JOIN posts p ON u.id = p.uid 
    WHERE p.id = $1
  `;
  
  try {
    const { rows: data } = await pool.query(q, [req.params.id]);
    if (data.length === 0) return res.status(404).json({ message: "Post not found" });
    return res.status(200).json(data[0]);
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const addPost = async (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "jwtkey", async (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = "INSERT INTO posts(title, desc, img, cat, date, uid) VALUES ($1, $2, $3, $4, $5, $6)";
    const values = [
      req.body.title,
      req.body.desc,
      req.body.img,
      req.body.cat,
      req.body.date,
      userInfo.id
    ];

    try {
      await pool.query(q, values);
      return res.json("Post has been created.");
    } catch (err) {
      console.error('Error inserting post:', err);
      return res.status(500).json(err);
    }
  });
};

export const deletePost = async (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "jwtkey", async (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const postId = req.params.id;
    const q = "DELETE FROM posts WHERE id = $1 AND uid = $2";

    try {
      const { rowCount } = await pool.query(q, [postId, userInfo.id]);
      if (rowCount === 0) return res.status(403).json("You can delete only your post!");
      return res.json("Post has been deleted!");
    } catch (err) {
      return res.status(500).json(err);
    }
  });
};

export const updatePost = async (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  const postId = req.params.id;
  jwt.verify(token, "jwtkey", async (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = "UPDATE posts SET title = $1, desc = $2, img = $3, cat = $4 WHERE id = $5 AND uid = $6";
    const values = [
      req.body.title,
      req.body.desc,
      req.body.img,
      req.body.cat,
      postId,
      userInfo.id
    ];

    try {
      await pool.query(q, values);
      return res.json("Post has been updated.");
    } catch (err) {
      return res.status(500).json(err);
    }
  });
};
