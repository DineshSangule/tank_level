const db = require('../config/db');

const addUser = (user, callback) => {
  const sql = 'INSERT INTO userss (userId, name, password, mobile,role) VALUES (?, ?, ?,?,?)';
  db.query(sql, [user.userId, user.name, user.password, user.mobile], callback);
};

const getUserByUserId = (userId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM userss WHERE userId = ?';
    db.query(sql, [userId], (err, result) => {
      if (err) return reject(err);
      resolve(result[0]); 
    });
  });
};


module.exports = { addUser, getUserByUserId };
