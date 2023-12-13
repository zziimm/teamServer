const express = require('express');
const bcrypt = require('bcrypt');
const { client } = require('../database/index');

const db = client.db('minton');

const router = express.Router();

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

// 참여하기 버튼 누르면 해당 club에 사용자 이름 추가
router.post('/join', async (req, res) => {
  const teamName = req.body.teamName;
  const memberName = req.body.username;

  if (!teamName || !memberName) {
    return res.status(400).json({
      flag: false,
      message: '팀 이름과 사용자 이름을 모두 제공해야 합니다.'
    });
  }

  try {
    // 클럽이 존재하는지 확인
    const existingClub = await db.collection('club').findOne({ teamName });
    if (!existingClub) {
      return res.status(404).json({
        flag: false,
        message: '클럽이 존재하지 않습니다.'
      });
    }

    // 클럽에 사용자 추가
    await db.collection('club').updateOne({ teamName }, { $push: { members: memberName } });

    res.json({
      flag: true,
      message: '클럽 가입 성공'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      flag: false,
      message: '클럽 가입 실패'
    });
  }
});


module.exports = router;


// const express = require('express');
// const bcrypt = require('bcrypt');
// const { client } = require('../database/index');

// const db = client.db('minton'); // board 데이터베이스에 연결

// const router = express.Router();

// router.get('/', async (req, res) => {
//   try {
//     const clubData = await db.collection('club').find({}).toArray();
//     res.json({
//       flag: true,
//       message: '가져오기 성공',
//       data: clubData,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       flag: false,
//       message: error.message,
//     });
//   }
// });

// // 참여하기 버튼 누르면 해당 club에 사용자 이름 추가
// router.post('/join', async (req, res) => {
//   const teamName = req.body.teamName;
//   const username = req.body.username;

//   try {
//     // 클럽이 존재하는지 확인
//     const clubExistenceCheck = await db.collection('club').findOne({ teamName });

//     if (!clubExistenceCheck) {
//       res.json({
//         flag: false,
//         message: '클럽이 존재하지 않습니다.',
//       });
//       return;
//     }

//     // 사용자 이름을 해당 클럽에 추가
//     await db.collection('club').updateOne({ teamName }, { $push: { members: username } });

//     res.json({
//       flag: true,
//       message: '클럽 가입 성공',
//     });
//   } catch (error) {
//     console.error(error);
//     res.json({
//       flag: false,
//       message: '클럽 가입 실패',
//     });
//   }
// });

// router.get('/:teamName', async (req, res) => {
//   const teamName = req.params.teamName;

//   try {
//     if (!teamName) {
//       throw new Error('소속된 클럽이 없습니다');
//     }

//     const data = await db.collection('club').findOne({ teamName });
//     console.log('--------------------------------------');
//     console.log(data);

//     res.json({
//       flag: true,
//       message: '데이터 가져오기 성공',
//       data: data,
//     });
//   } catch (error) {
//     res.json({
//       flag: false,
//       message: error.message,
//     });
//   }
// });

// module.exports = router;
// // const express = require('express')
// // const bcrypt = require('bcrypt')
// // const { client } = require('../database/index');



// // const db = client.db('minton') // board 데이터베이스에 연결

// // const router = express.Router()

// // router.get('/', async (req, res) => {
// //   try {
// //     const clubData = await db.collection('club').find({}).toArray();
// //     res.json({
// //       flag: true,
// //       message: '가져오기 성공',
// //       data: clubData
// //     });
// //   } catch (error) {
// //     console.error(error);
// //     res.status(500).json({
// //       flag: false,
// //       message: error.message
// //     });
// //   }
// // });


// // // 참여하기 버튼 누르면 해당 club에 사용자 이름 추가
// // router.post('/join', async (req, res) => {
// //   const teamName = req.body.teamName; // 클럽의 이름
// //   const memberName = req.body.memberName; // 가입할 사용자의 이름

// //   try {
// //     const result = await db.collection('club').updateOne(
// //       { teamName },
// //       { $addToSet: { members: memberName } }
// //     );

// //     if (result.modifiedCount === 0) {
// //       // modifiedCount가 0이면 클럽이 존재하지 않는 경우
// //       throw new Error('클럽이 존재하지 않습니다.');
// //     }

// //     res.json({
// //       flag: true,
// //       message: '클럽 가입 성공'
// //     });
// //   } catch (error) {
// //     console.error(error);
// //     res.json({
// //       flag: false,
// //       message: error.message
// //     });
// //   }
// // });





// // router.get('/:teamName', async (req, res) => {
// //   const teamName = req.params.teamName

// //     try {
// //       if (!teamName) {
// //         throw new Error('소속된 클럽이 없습니다')
// //       }

// //       const data = await db.collection('club').findOne({ teamName })
// //       console.log('--------------------------------------');
// //       console.log(data);

// //       res.json({
// //         flag: true,
// //         message: '데이터 가져오기 성공',
// //         data: data
// //       })


// //     } catch (error) {
// //       res.json({
// //         flag: false,
// //         message: error.message
// //       })
// //     }
    
    
// //   })
    


// // module.exports = router;