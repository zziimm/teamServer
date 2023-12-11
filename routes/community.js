const express = require('express');

const { client } = require('../database/index');
const { ObjectId } = require('bson');
const db = client.db('minton');

const router = express.Router();

router.get('/', async (req, res) => { // 커뮤니티 리스트 겟요청
  const communityData = await db.collection('community').find({}).toArray();
  res.json({
    flag: true,
    message: '성공적으로 데이터를 가져왔습니다.',
    communityData: communityData
  });
});

router.post('/communityInsert', async (req, res) => { // 커뮤니티 인서트 포스트요청
  const { id, title, content, imagePath} = req.body;
  console.log(id, title, content);
  // JS Object 형태
  try {
    await db.collection('community').insertOne({
      id ,
      title ,
      content ,
      imagePath
    });
    res.send('데이터 저장 완료');
  } catch (err) {
    console.error(err);
  }
});

router.get('/communityComment', async (req, res) => {
  try {
    const comments = await db.collection('communityComment').find({}).toArray();
    res.json({
      flag: true,
      message: '성공적으로 데이터를 가져왔습니다.',
      comments: comments
    });
  } catch (err) {
    console.error(err);
  };
})

router.post('/communityComment', async( req, res ) => {
  console.log(req.body);
  console.log(req.user);
  const { addComment, postId } = req.body;
  try {
    await db.collection('communityComment').insertOne({
      postId,
      addComment,
      userId: req.user.userId
    });
    res.send('댓글입력 완료');
  } catch (err) {
    console.error(err);
  }
})

module.exports = router;