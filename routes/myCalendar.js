const express = require('express');

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

router.post('/insert/:id', (req, res, next) => {
  const title = req.body.title;
  const start = req.body.start;
  const end = req.body.end;
  
  try {
    if (req.user) {
      db.collection('myCalendar').insertOne({
        title,
        start,
        end,
        user: req.user._id,
        postId: req.params.id
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


router.get('/myCalenderInsert', async (req, res) => {
  await db.collection('myCalendar').insertOne({
    title: "같이 칠사람 구합니다~~",
    start: "2023-12-08",
  });
  res.send('완료')
});




module.exports = router;
