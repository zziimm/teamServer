const express = require('express');
const { ObjectId } = require('mongodb');

const { client } = require('../database/index');
const db = client.db('minton');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const matchingData = await db.collection('matching').find({}).toArray();
    res.json({
      flag: true,
      message: '성공적으로 데이터를 가져왔습니다.',
      data: matchingData,
    });
  } catch (err) {
    res.json({
      flag: false,
      message: '데이터 불러오기 실패',
    });
  }
});

router.post('/matchingInsert', async (req, res) => {
  const result = req.body;
  const resultId = await db.collection('matching').insertOne({ ...result, joinMember: [req.user.userId] });
  await db.collection('myMatchList').insertOne({
    ...result,
    user: req.user._id,
    joinMember: [req.user.userId],
    postId: resultId.insertedId
  });
  await db.collection('myCalendar').insertOne({
    title: req.body.title,
    start: req.body.selectDate,
    user: req.user._id,
    postId: resultId.insertedId
  });
  res.send('저장성공')  
});

router.get('/matchingPost/:id', async (req, res) => {
  const result = await db.collection('matching').findOne({ _id: new ObjectId(req.params.id) });
  console.log(result);
  res.json({
    flag: true,
    message: '상세페이지 불러오기 성공',
    data: result
  })
});

router.delete('/deleteMatching/:id', async (req, res) => {
  try {
    await db.collection('matching').deleteOne({ _id: new ObjectId(req.params.id) });
    await db.collection('myCalendar').deleteMany({ postId: new ObjectId(req.params.id) })
    await db.collection('myMatchList').deleteMany({ postId: new ObjectId(req.params.id) })
    res.json({
      flag: true,
      message: '삭제 성공'
    });
  } catch (err) {
    res.json({
      flag: false,
      message: '삭제 실패'
    });
  }
});

router.patch('/editMatchPost/:id', async (req, res) => {
  console.log(req.body);
  const { title, content, selectDate, district, joinPersonnel, game, gender } = req.body;
  try {
    await db.collection('matching').updateOne({
      _id: new ObjectId(req.params.id)
    }, { $set: {
      title,
      content,
      selectDate,
      district,
      joinPersonnel,
      game,
      gender
    }
  });
    await db.collection('myMatchList').updateOne({
      user: req.user._id, postId: new ObjectId(req.params.id)
    }, { $set: {
      title,
      content,
      selectDate,
      district,
      joinPersonnel,
      game,
      gender
    }
  });
  await db.collection('myCalendar').updateOne({ user: new ObjectId(req.user._id) }, { $set: { title, start: selectDate } });
    res.json({
      flag: true,
      message: '수정 완료'
    });
  } catch (err) {
    console.error(err);
  }
});

module.exports = router;