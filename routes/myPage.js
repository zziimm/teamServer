const express = require('express');
const { ObjectId } = require('mongodb');


const { client } = require('../database/index');
const db = client.db('minton');

const router = express.Router();

router.get('/matchList', async (req, res) => {
  try {
    const result = await db.collection('myMatchList').find({ user: req.user._id }).toArray();
    res.json({
      flag: true,
      message: '요청 성공',
      data: result
    });
  } catch (err) {
    console.error(err);
  }
});

router.post('/cancelMatch', async (req, res) => {
  const postId = req.body.postId;
  const userId = req.user._id;
  try {
    await db.collection('myMatchList').deleteOne({ postId: new ObjectId(postId), user: userId });
    await db.collection('myCalendar').deleteOne({ postId: new ObjectId(postId), user: userId });
    await db.collection('matching').updateOne({ _id: new ObjectId(postId)}, { $pull: { joinMember: req.user.userId } });
    await db.collection('myMatchList').updateOne({ postId: new ObjectId(postId)}, { $pull: { joinMember: req.user.userId } });
    res.json({
      flag: true,
      message: '일정 삭제 완료'
    });
  } catch (err) {
    console.error(err);
    res.json({
      flag: false,
      message: '일정 삭제 실패'
    });
  }
});

router.post('/winAlert', async (req, res) => {
  try {
    await db.collection('userInfo').updateOne({ userId: req.body.member }, { $set: { news: { name: "winOrLose", postId: req.body.postId } } })
    res.send('dd')
  } catch (err) {
    console.error(err);
  }
});




module.exports = router;