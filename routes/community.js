const express = require('express');

const { client } = require('../database/index');
const { ObjectId } = require('bson');
const db = client.db('minton');

const router = express.Router();

router.get('/', async (req, res) => { // 커뮤니티 리스트 겟요청
  const communityData = await db.collection('community').find({}).toArray();
  const communityDataa = await db.collection('communityComment').find({}).toArray();
  res.json({
    flag: true,
    message: '성공적으로 데이터를 가져왔습니다.',
    communityData,
    communityDataa
  });
});
router.patch('/', async (req, res) => {  // 커뮤니티 좋아요 패치요청
  try {
    const like = req.body.like;
    const id = req.body.id
    console.log(req.body);
    const a = await db.collection('community').updateOne({
      _id: new ObjectId(id)
    }, {
      $set: { like: like }
    })
    console.log(a);
    res.json({
      flag: true,
      message: '좋아요',
      like: a
    });
  } catch (err) {
    console.error(err);
  }
})

router.post('/communityInsert', async (req, res) => { // 커뮤니티 글 등록
  const { id,  content, imagePath, like} = req.body;
  // JS Object 형태
  try {
    await db.collection('community').insertOne({
      id ,
      content ,
      imagePath,
      like
    });
    res.json({
      flag: true,
      message: '등록 완료',
    });
  } catch (err) {
    console.error(err);
  }
});

router.post('/delete', async (req, res) => {  // 커뮤니티 게시글 삭제
  console.log(req.body);
  try {
    const del = await db.collection('community').deleteOne({
      _id: new ObjectId(req.body.postId)
    });
    res.json({
      flag: true,
      message: '삭제 완료',
      del: del
    });
  } catch (err) {
    console.error(err);
  }
})

router.get('/edit/:postId', async (req, res) => { // 커뮤니티 게시글 수정 get
  try {
    await db.collection('community').find({}).toArray();
    res.json({
      flag: true,
      message: '성공적으로 데이터를 가져왔습니다.',
    });
  } catch (err) {
    console.error(err);
  }
})
router.post('/edit/:postId', async (req, res) => { // 커뮤니티 게시글 수정 post
  const { content, imagePath} = req.body.communityInput;
  try {
    const eidt = await db.collection('community').updateOne({
      _id: new ObjectId( req.params.postId )
      
    }, {
      $set: { content, imagePath },
      // $set: { imagePath }
    })
    res.json({
      flag: true,
      message: '수정 완료',
    });
  } catch (err) {
    console.error(err);
  }
})

router.get('/communityComment', async (req, res) => { // 커뮤니티 댓글 겟요청
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

router.post('/communityComment', async( req, res ) => { // 커뮤니티 댓글 등록
  console.log(req.body);
  console.log(req.user);
  const { addComment, postId } = req.body;
  try {
    await db.collection('communityComment').insertOne({
      commentPostId: postId,
      addComment,
      userId: req.user.userId
    });
    const rePost = await db.collection('communityComment').find({}).toArray();
    res.json({
      flag: true,
      message: '댓글 등록 성공.',
      rePost
    });
  } catch (err) {
    console.error(err);
  }
});

router.post('/communityComment/delete', async( req, res ) => {  // 커뮤니티 댓글 삭제
  try {
    await db.collection('communityComment').deleteOne({
      _id: new ObjectId(req.body.commentPostId)
    });
    const commentDel = await db.collection('communityComment').find({
      _id: new ObjectId(req.body.commentPostId)
    }).toArray();
    res.json({
      flag: true,
      message: '삭제 완료',
      commentDel
    });
  } catch (err) {
    console.error(err);
  }
})









router.get('/del', async(req, res) => {
  await db.collection('communityComment').deleteMany({})
})

module.exports = router;