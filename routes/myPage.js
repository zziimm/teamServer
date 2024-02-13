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
  try {
    const postId = req.body.postId;
    const userId = req.user._id;
    await db.collection('myMatchList').deleteOne({ postId: new ObjectId(postId), user: userId });
    await db.collection('myCalendar').deleteOne({ postId: new ObjectId(postId), user: userId });
    await db.collection('matching').updateOne({ _id: new ObjectId(postId)}, { $pull: { joinMember: req.user.userId } });
    await db.collection('myMatchList').updateOne({ postId: new ObjectId(postId)}, { $pull: { joinMember: req.user.userId } });
    const result = await db.collection('myMatchList').find({ user: userId }).toArray();
    res.json({
      flag: true,
      message: '일정 삭제 완료',
      data: result
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
  try {
    const postId = req.body.postId; // 오브젝트 아님
    const loginUser = req.user;
    if (req.body.game === "단식") {
      // 요청받는 사람
      const user = await db.collection('userInfo').findOne({ userId: req.body.member });
      await db.collection('myMatchList').updateOne({ user: user._id, postId: new ObjectId(postId) }, { $set: { news: { name: "winOrLose", postId: req.body.postId, from: req.user._id } } });
      // 요청한 사람
      await db.collection('myMatchList').updateOne({ user: loginUser._id, postId: new ObjectId(postId) }, { $set: { check: 1 } });

      await db.collection('matching').updateOne({ _id: new ObjectId(req.body.postId) }, { $set: { resultConfirm: 1 } });
      console.log('단식 실행');
      res.json({
        flag: true,
        message: '매칭 결과 요청을 보냈습니다!'
      });
    } else {      
      const user = await db.collection('userInfo').findOne({ userId: req.body.member });
      await db.collection('myMatchList').updateOne({ user: user._id, postId: new ObjectId(postId) }, { $set: { news: { name: "winOrLose", postId: req.body.postId, from: req.user._id } } });
      // 요청한 사람
      await db.collection('myMatchList').updateOne({ user: loginUser._id, postId: new ObjectId(postId) }, { $set: { check: 1 } });
      
      
      await db.collection('matching').updateOne({ _id: new ObjectId(req.body.postId) }, { $set: { resultConfirm: 1 } });
      if (req.body.winMember == req.body.member) {
        const winUser = await db.collection('userInfo').findOne({ userId: req.body.member });
        await db.collection('myMatchList').updateOne({ user: winUser._id, postId: new ObjectId(postId) }, { $set: { winner: { win : 'win', postId: req.body.postId } } });
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
  try {
    const thisPostId = req.body.postId
    // 승리 요청 보낸 사람
    const loginUser = req.user;

    const winMemberInMatch = await db.collection('myMatchList').findOne({ winner: { win: 'win', postId: thisPostId } });
    const winMember = await db.collection('userInfo').findOne({ _id: winMemberInMatch?.user });
    console.log('winMember'+winMember);
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
      const thisUser = await db.collection('myMatchList').findOne({ user: loginUser._id, postId: new ObjectId(thisPostId) });
      console.log(thisUser);
      const winUser = await db.collection('userInfo').findOne({ _id: thisUser.news.from });
      console.log(winUser);
      console.log('22'+winMember);
      
      if (winMember === undefined || winMember === null) {
        console.log('단식 확인실행');
        // 없으면
        const joinMemberWithOutMe = joinMember.filter(member => member !== winUser.userId);
        // 승리자
        await db.collection('userInfo').updateOne({ _id: winUser._id }, { $inc: { win: 1 } });
        
        // 패배자
        await joinMemberWithOutMe.forEach(member => {
          db.collection('userInfo').updateOne({ userId: member }, { $inc: { lose: 1 } });
        });
        // 경기 종료 테이터 삭제
        await db.collection('matching').deleteOne({ _id: new ObjectId(thisPostId) });
        await db.collection('myMatchList').deleteMany({ postId: new ObjectId(thisPostId) });
        await db.collection('myCalendar').deleteMany({ postId: new ObjectId(thisPostId) });
        const viewData = await db.collection('myMatchList').find({ user: loginUser._id }).toArray();
        const userData = await db.collection('userInfo').findOne({ _id: req.user._id });
        res.json({
          flag: true,
          message: '결과가 등록되었습니다!',
          data: viewData,
          userData
        });
      } else {
        // 승리멤버가 있을 때
        const joinMemberWithOutMe = joinMember.filter(member => member !== winUser.userId);
        console.log('joinMemberWithOutMe'+joinMemberWithOutMe);
        
        const joinMemberWithOutWinner = joinMemberWithOutMe.filter(member => member !== winMember.userId);
        console.log('joinMemberWithOutWinner'+joinMemberWithOutWinner);
        
        // 승리자
        await db.collection('userInfo').updateOne({ _id: winUser._id }, { $inc: { win: 1 } });
        await db.collection('userInfo').updateOne({ _id: winMember._id }, { $inc: { win: 1 } });
        
        // 패배자
        await joinMemberWithOutWinner.forEach(member => {
          db.collection('userInfo').updateOne({ userId: member }, { $inc: { lose: 1 } });
        });
        // 경기 종료 테이터 삭제
        await db.collection('matching').deleteOne({ _id: new ObjectId(thisPostId) });
        await db.collection('myMatchList').deleteMany({ postId: new ObjectId(thisPostId) });
        await db.collection('myCalendar').deleteMany({ postId: new ObjectId(thisPostId) });
        const viewData = await db.collection('myMatchList').find({ user: loginUser._id }).toArray();
        const userData = await db.collection('userInfo').findOne({ _id: req.user._id });

        console.log('복식 확인실행');
        res.json({
          flag: true,
          message: '결과가 등록되었습니다!',
          data: viewData,
          userData
        });
      }

    } else {
      // 확인 인원이 다 차지 않았을 때
      await db.collection('myMatchList').updateOne({ user: loginUser._id, postId: new ObjectId(thisPostId) }, { $set: { check: 1 } });
      const viewData = await db.collection('myMatchList').find({ user: loginUser._id }).toArray();
      res.json({
        readyFlag: true,
        message: '승인 완료!',
        data: viewData
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