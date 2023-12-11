const express = require('express')
const bcrypt = require('bcrypt')
const { client } = require('../database/index');

const db = client.db('minton') // board 데이터베이스에 연결

const router = express.Router()

// router.get('/register', (req, res)=>{
//     res.re
// })


router.post('/', async (req, res) => {
    const userId = req.body.id
    const passwd = req.body.passwd
    const nickname = req.body.nick
    const userIdRegex = /^[a-zA-Z0-9]{4,10}$/;

    try {
        if (userId === '') {
            throw new Error('ID를 입력해주세요!');
        }

        if (nickname === '') {
            throw new Error('닉네임을 입력해주세요!')
        }

        if ( passwd === '') {
            throw new Error('비밀번호를 입력해주세요!')

        }

        if (!userIdRegex.test(userId)) {
            throw new Error('ID는 4자 이상 10자 이하 알파벳 대소문자, 숫자로만 구성되어야 합니다.');
        }
        
        const existUser = await db.collection('userInfo').findOne({ userId })
        if (existUser) {
            throw new Error('존재하는 ID 입니다')
        }

        const existNick = await db.collection('userInfo').findOne({nickname})
        if (existNick) {
            throw new Error('존재하는 닉네임 입니다')
        }

        const hash = await bcrypt.hash(passwd, 12)
        
        await db.collection('userInfo').insertOne({
            userId,
            passwd: hash,
            nickname
        })


        res.json({
            flag: true,
            message: '회원 가입 성공'
        })


    } catch (error) {
        console.error(error);
        res.json({
        flag: false,
        message: error.message
        })
    }
    })
    


module.exports = router;