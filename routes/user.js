const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const { client } = require('../database/index');
const db = client.db('minton');
const router = express.Router();


router.get('/', async (req, res) => {
  const result = await db.collection('userInfo').find({}).toArray();
  res.json({
    flag: true,
    message: '불러오기 성공',
    data: result
  });
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (authError, user, info) => {
    console.log(user);
    // user: 성공 시 로그인한 사용자 정보
    // info: 실패 시 이유
    if (authError) {
      return res.status(500).json(authError);
    }
    if (!user) { 
      return res.status(401).json(info.message);
    }

    // logIn(): 사용자 정보를 세션에 저장하는 작업을 시작
    // passport.serializeUser가 호출됨
    // user 객체가 serializeUser로 넘어가게 됨
    req.logIn(user, (loginError) => {
      if (loginError) {
        return next(loginError);
      }
      res.json({
        flag: true,
        message: '로그인 성공',
        user
      });
    });
  })(req, res, next);
});

router.get('/loginUser', (req,res) => {
  res.json({
    flag: true,
    message: '유저정보 불러오기 성공',
    data: req.user
  });
});

router.post('/logout', (req, res, next) => {
  req.logout((logoutError) => {
    if (logoutError) {
      return next(logoutError);
    };
    res.json({
      flag: true,
      message: '로그아웃 되었습니다.'
    });
  });
});





module.exports = router;
