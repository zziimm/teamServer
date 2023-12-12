const express = require('express');

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


module.exports = router;