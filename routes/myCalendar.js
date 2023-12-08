const express = require('express');

const { client } = require('../database/index');
const db = client.db('minton');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await db.collection('myCalendar').find({}).toArray();
    res.json({
      flag: true,
      message: '데이터 가져오기 성공',
      data: result
    });
  } catch (err) {
    res.json({
      flag: false,
      message: '데이터 불러오기 실패',
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
