const express = require('express')
const bcrypt = require('bcrypt')
const { client } = require('../database/index');



const db = client.db('minton') // board 데이터베이스에 연결

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const clubData = await db.collection('club').find({}).toArray();
    res.json({
      flag: true,
      message: '가져오기 성공',
      data: clubData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      flag: false,
      message: error.message
    });
  }
});


router.get('/:teamName', async (req, res) => {
  const teamName = req.params.teamName

    try {
      if (!teamName) {
        throw new Error('소속된 클럽이 없습니다')
      }

      const data = await db.collection('club').findOne({ teamName })
      console.log('--------------------------------------');
      console.log(data);

      res.json({
        flag: true,
        message: '데이터 가져오기 성공',
        data: data
      })


    } catch (error) {
      res.json({
        flag: false,
        message: error.message
      })
    }
    
    
  })
    


module.exports = router;