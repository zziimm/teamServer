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
      data: matchingData
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
  console.log(result);
  await db.collection('matching').insertOne({ ...result });
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

module.exports = router;