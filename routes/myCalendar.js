const express = require('express');
const { ObjectId } = require('mongodb');


const { client } = require('../database/index');
const db = client.db('minton');

const router = express.Router();

router.get('/', async (req, res) => {
  console.log('유저'+req.user);
  try {
    if (req.user) {
      const result = await db.collection('myCalendar').find({ user: req.user._id }).toArray();
      console.log(result);
      res.json({
        flag: true,
        message: '데이터 가져오기 성공',
        data: result
      });
    } else {
      throw new Error('로그인이 필요합니다.');
    }
  } catch (err) {
    res.json({
      flag: false,
      message: err.message
    });
  }
});

router.post('/directInsert', async (req, res, next) => {
  const title = req.body.title;
  const start = req.body.start;
  const end = req.body.end;
  
  try {
    if (req.user) {
      await db.collection('myCalendar').insertOne({
        title,
        start,
        end,
        user: req.user._id,
      });
      res.json({
        flag: true,
        message: '등록이 완료되었습니다!'
      });
    } else {
      throw new Error('로그인이 필요합니다.');
    }
  } catch (err) {
    res.json({
      flag: false,
      message: err.message,
    });
  }
});

router.post('/insert/:id', async (req, res, next) => {
  const title = req.body.title;
  const start = req.body.start;
  const district = req.body.district;
  const game = req.body.game;
  const joinPersonnel = req.body.joinPersonnel;
  const joinMember = req.body.joinMember;
  try {
      await db.collection('myCalendar').insertOne({
        title,
        start,
        user: req.user._id,
        postId: new ObjectId(req.params.id)
      });
      await db.collection('matching').updateOne({ _id: new ObjectId(req.params.id) }, { $push: { joinMember: req.user.userId } });
      await db.collection('myMatchList').insertOne({
        title,
        start,
        district,
        game,
        joinPersonnel,
        joinMember,
        user: req.user._id,
        postId: new ObjectId(req.params.id)
      });
      res.json({
        flag: true,
        message: '등록이 완료되었습니다!'
      });
  } catch (err) {
    res.json({
      flag: false,
      message: err.message,
    });
  }
});


module.exports = router;
