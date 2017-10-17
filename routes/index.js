var express = require('express')
var crypto = require('crypto')
var router = express.Router()
var jwt = require('jwt-simple')
var moment = require('moment')
var qiniu = require('qiniu')
var app = express()
var User = require('../model/user')
var db = require('../config')

app.set('jwtTokenSecret', 'MIGO')

function query(sql) {
  return new Promise(function(resolve, reject) {
    db.query(sql, function(err, result) {
      if (err) return reject(err)
      resolve(result)
    })
  })
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send({ name: 'hyw9' })
})

// 注册账号
router.post('/user', function(req, res, next) {
  const md5 = crypto.createHash('md5')
  md5.update(req.body.password)
  const password = md5.digest('hex')
  const sql = 'insert into user (telephone, password) values (?, ?)'
  db.query(sql, [req.body.telephone, password], function(err, result) {
    res.json(result)
  })
})

// 登录账号
router.post('/login', function(req, res, next) {
  const md5 = crypto.createHash('md5')
  md5.update(req.body.password)
  const password = md5.digest('hex')
  const sql = `select * from user where telephone = ? and password = ?`
  db.query(sql, [req.body.telephone, password], function(err, result) {
    if (result.length > 0) {
      var expires = moment()
        .add(7, 'days')
        .valueOf()
      var token = jwt.encode(
        {
          uid: result[0].id,
          exp: expires
        },
        app.get('jwtTokenSecret')
      )
      res.json({
        expires,
        token,
        user: result[0]
      })
    }
  })
})

// 发布评论
router.post('/create_comment', function(req, res, next) {
  const sql = `select * from user where telephone = ? and password = ?`
  db.query(sql, [req.body.telephone, password], function(err, result) {})
})

// /* POST
//  * 发布帖子
//  */
// router.post('/create_post', function(req, res, next) {
//   const created_by = jwt.decode(req.headers['secret-token'], app.get('jwtTokenSecret')).uid
//   const sql = `insert into post (title, img, created_by) values (?, ?, ${created_by})`
//   db.query(sql, [req.body.title, req.body.img], function(err, result) {
//     res.json(result)
//   })
// })

/**
 * GET
 * 获得文章列表
 */
router.get('/article', function(req, res, next) {
  // res.send(req.params)
  const sql = 'select * from article'
  db.query(sql, function(err, result) {
    res.json(result)
  })
})

// 发布评论
router.get('/get_uptoken', function(req, res, next) {
  const ak = 'xZxQTiyq-gMh-bTC-Ea4I4ps0bfWJR2Q5_ijaxh_'
  const sk = 'NbeJPPcmUg74uVNPVCKcOr831Lti-_MQ1tnRl_y2'
  const mac = new qiniu.auth.digest.Mac(ak, sk)
  const options = {
    scope: 'circle',
    expires: 7200
  }
  const putPolicy = new qiniu.rs.PutPolicy(options)
  const uploadToken = putPolicy.uploadToken(mac)
  res.json({ uploadToken })
})

module.exports = function(app) {
  app.use('/', router)
  app.use('/posts', require('./post'))
}
