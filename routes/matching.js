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

router.get('/matchingInsert', async (req, res) => {
  await db.collection('matching').insertOne({ 
    id: "badminton5",
    title: "연수 체육공원에서 배드민턴 같이 치실분~",
    content: "연수 체육공원에서 배드민턴 같이 치실분구합니다~",
    selectDate: "2023-11-08",
    gender: "여",
    joinPersonnel: "4",
    game: "복식경기",
    district: "인천"
  });
  res.send('저장성공')  

})

module.exports = router;