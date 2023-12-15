const express = require('express');
const { ObjectId } = require('mongodb');


const { client } = require('../database/index');
const db = client.db('minton');

const router = express.Router();

router.get('/matchList', async (req, res) => {
  try {
    const result = await db.collection('myMatchList').find({ user: req.user._id }).toArray();
    const userData = await db.collection('userInfo').findOne({ _id: req.user._id });

    res.json({
      flag: true,
      message: '요청 성공',
      data: result,
      userData
    });
  } catch (err) {
    console.error(err);
  }
});

router.post('/cancelMatch', async (req, res) => {
  const postId = req.body.postId;
  const userId = req.user._id;
  try {
    await db.collection('myMatchList').deleteOne({ postId: new ObjectId(postId), user: userId });
    await db.collection('myCalendar').deleteOne({ postId: new ObjectId(postId), user: userId });
    await db.collection('matching').updateOne({ _id: new ObjectId(postId)}, { $pull: { joinMember: req.user.userId } });
    await db.collection('myMatchList').updateOne({ postId: new ObjectId(postId)}, { $pull: { joinMember: req.user.userId } });
    res.json({
      flag: true,
      message: '일정 삭제 완료'
    });
  } catch (err) {
    console.error(err);
    res.json({
      flag: false,
      message: '일정 삭제 실패'
    });
  }
});

// forEach로 멤버수만큼 요청들어옴
router.post('/winAlert', async (req, res) => {
  const loginUser = req.user;
  try {
    if (req.body.game === "단식") {
      await db.collection('userInfo').updateOne({ userId: req.body.member }, { $set: { news: { name: "winOrLose", postId: req.body.postId, form: req.user._id } } });
      await db.collection('matching').updateOne({ _id: new ObjectId(req.body.postId) }, { $set: { resultConfirm: 1 } });
      await db.collection('userInfo').updateOne({ _id: loginUser._id }, { $set: { check: 1 } });
      console.log('단식 실행');
      res.json({
        flag: true,
        message: '매칭 결과 요청을 보냈습니다!'
      });
    } else {      
      await db.collection('userInfo').updateOne({ userId: req.body.member }, { $set: { news: { name: "winOrLose", postId: req.body.postId, form: req.user._id } } });
      await db.collection('matching').updateOne({ _id: new ObjectId(req.body.postId) }, { $set: { resultConfirm: 1 } });
      await db.collection('userInfo').updateOne({ _id: loginUser._id }, { $set: { check: 1 } });

      if (req.body.winMember == req.body.member) {
        await db.collection('userInfo').updateOne({ userId: req.body.winMember }, { $set: { winner: { win : 'win', postId: req.body.postId } } });
        console.log('복식 실행2');
        return res.json({
          winFlag: true,
          message: '매칭 결과 요청을 보냈습니다!'
        });
      }
      console.log('복식 실행');
      res.json({
        flag: true,
        message: '매칭 결과 요청을 보냈습니다!'
      });
    }
  } catch (err) {
    console.error(err);
    res.json({
      flag: false,
      message: '전송 실패!'
    });
  }
});

router.post('/matchResult', async (req, res) => {
  const thisPostId = req.body.postId
  // 승리 요청 보낸 사람
  const loginUser = req.user;
  // 함께 승리한 팀원

  try {
    const winMember = await db.collection('userInfo').findOne({ winner: { win: 'win', postId: thisPostId } });
    await db.collection('matching').updateOne({ _id: new ObjectId(thisPostId) }, { $inc: { resultConfirm: 1 } });
    const readyForConfirm = await db.collection('matching').findOne({ _id: new ObjectId(thisPostId) });
    const { joinMember, resultConfirm } = readyForConfirm;
    const joinMemberCount = joinMember.length;
    console.log('joinMemberCount'+joinMemberCount);
    console.log('resultConfirm'+resultConfirm);

    // 참가 인원 전부 확인 완료 시
    // 단식
    if (joinMemberCount == resultConfirm) {
      console.log('단식 실행');

      await db.collection('matching').deleteOne({ _id: new ObjectId(thisPostId) });
      await db.collection('myMatchList').deleteMany({ postId: new ObjectId(thisPostId) });
      await db.collection('myCalendar').deleteMany({ postId: new ObjectId(thisPostId) });
      const thisUser = await db.collection('userInfo').findOne({ _id: loginUser._id });
      const winUser = await db.collection('userInfo').findOne({ _id: thisUser.news.form });
      console.log(winUser);
      console.log('22'+winMember);

      if (winMember === undefined) {
        console.log('단식 확인실행');
        // 없으면
        const joinMemberWithOutMe = joinMember.filter(member => member !== winUser.userId);
        await db.collection('userInfo').updateOne({ _id: winUser._id }, { $inc: { win: 1 } });
        
        await joinMemberWithOutMe.forEach(member => {
          db.collection('userInfo').updateOne({ userId: member }, { $inc: { lose: 1 } });
          db.collection('userInfo').updateOne({ userId: member }, { $set: { news: '', check: '' } });
        });
        res.json({
          flag: true,
          message: '결과가 등록되었습니다!'
        });
      } else {
        // 승리멤버가 있을 때
        const joinMemberWithOutMe = joinMember.filter(member => member !== winUser.userId);
        const joinMemberWithOutWinner = joinMemberWithOutMe.filter(member => member !== winMember.userId);

        await db.collection('userInfo').updateOne({ _id: winUser._id }, { $inc: { win: 1 } });
        await db.collection('userInfo').updateOne({ userId: winMember.userId }, { $inc: { win: 1 } });
        await db.collection('userInfo').updateOne({ userId: winMember.userId }, { $set: { winner: {win: '', postId: ''} } });

        await joinMemberWithOutWinner.forEach(member => {
          db.collection('userInfo').updateOne({ userId: member }, { $inc: { lose: 1 } });
          db.collection('userInfo').updateOne({ userId: member }, { $set: { news: '', check: '' } });
        });
        console.log('복식 확인실행');
        res.json({
          flag: true,
          message: '결과가 등록되었습니다!'
        });
      }
    } else {
      await db.collection('userInfo').updateOne({ _id: loginUser._id }, { $set: { check: 1 } });
      res.json({
        readyFlag: true,
        message: '승인 완료!'
      });
    }

  } catch (err) {
    console.error(err);
    res.json({
      flag: false,
      message: '등록에 실패하였습니다!'
    });
  }
});

module.exports = router;