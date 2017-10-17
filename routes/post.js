var express = require('express')
var router = express.Router()
const db = require('../config')
var User = require('../model/user')
var _ = require('lodash')
var jwt = require('jwt-simple')
var app = express()
app.set('jwtTokenSecret', 'MIGO')

/* GET 
 * 获取帖子列表
 */
function query(sql) {
  return new Promise(function(resolve, reject) {
    db.query(sql, function(err, result) {
      if (err) return reject(err)
      resolve(result)
    })
  })
}

// 获取post列表
router.get('/', function(req, res, next) {
  const sql = `select * from post`
  query(sql).then(result => {
    const promiseArr = result.map(r => {
      return User.getUser(r.id)
    })
    Promise.all(promiseArr).then(dataArr => {
      const userList = _.keyBy(_.flatten(dataArr), 'id')
      result.map(r => Object.assign(r, { created_by: userList[r.id], comment: [] }))
      res.json(result)
    })
  })
})

// 创建post
router.post('/', function(req, res, next) {
  const created_by = jwt.decode(req.headers['secret-token'], app.get('jwtTokenSecret')).uid
  const sql = `insert into post (title, img, created_by) values (?, ?, ${created_by})`
  db.query(sql, [req.body.title, req.body.img], function(err, result) {
    res.json(result)
  })
})

// 发布评论
router.post('/comment', function(req, res, next) {
  const sql = `select * from user where telephone = ? and password = ?`
  db.query(sql, [req.body.telephone, password], function(err, result) {})
})

module.exports = router
