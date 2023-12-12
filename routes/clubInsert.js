const express = require('express')
const bcrypt = require('bcrypt')
const { client } = require('../database/index');



const db = client.db('minton') // board 데이터베이스에 연결

const router = express.Router()


router.post('/', async (req, res) => {
    const teamName = req.body.teamName
    const maindistrict = req.body.maindistrict
    const members = req.body.members
    const addMembers = req.body.addMembers
    console.log(addMembers);
    // addMembers의 값을  members의 배열에 추가

    const updatedMembers = [members, addMembers];
    
    try {
        await db.collection('club').insertOne({
            teamName,
            maindistrict,
            members: updatedMembers,
            
        })

        res.json({
            flag: true,
            message: '클럽 개설 성공'
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