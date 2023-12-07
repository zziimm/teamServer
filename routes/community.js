const express = require('express');

const { client } = require('../database/index');
const db = client.db('minton');

const router = express.Router();

// router.get('/', async (req, res) => {
//   const communityData = await db.collection('community').find({}).toArray();
//   res.json({
//     flag: true,
//     message: '성공적으로 데이터를 가져왔습니다.',
//     data: communityData
//   });
// });

router.get('/communityInsert', async (req, res) => {
  await db.collection('community').insertOne({ 
    title:'몽몽몽몽',
    content: '고고고고'
  });
  res.send('저장성공')  

})

module.exports = router;