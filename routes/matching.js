const express = require('express');

const { client } = require('../database/index');
const db = client.db('minton');

const router = express.Router();

router.get('/', async (req, res) => {
  const matchingData = await db.collection('matching').find({}).toArray();
  res.json({
    flag: true,
    message: '성공적으로 데이터를 가져왔습니다.',
    data: matchingData
  });
});

router.post('/matchingInsert', async (req, res) => {
  const result = req.body;
  console.log(result);
  await db.collection('matching').insertOne({ ...result });
  res.send('저장성공')  
})

module.exports = router;