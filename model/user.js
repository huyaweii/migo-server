const db = require('../config')
function query(sql, id) {
  return new Promise(function(resolve, reject) {
    db.query(sql, [id], function(err, result) {
      if (err) return reject(err)
      resolve(result)
    })
  })
}

module.exports = {
  // 通过用户名获取用户信息
  getUser: id => {
    const sql = 'select * from user where id = ?'
    return query(sql, id)
  }
}
