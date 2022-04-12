const express = require('express')
const router = express.Router()
const User = require('../models/User')
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const fetchUser = require('../middleware/fetchUser')
require("dotenv").config();


//Route 1 : Below Route is for creating a user. No login required
router.post('/createUser', [
    body('email', 'Enter a valid email address').isEmail(),
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('password', 'Password should be atleast 8 characters').isLength({ min: 8 }),
    body('cpassword').custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error();
        }
        return true;
})], async (req, res) => {
    //In case of an error, return bad request and the error
    try {
        let success = false
        const err = validationResult(req)
        //Checking if user email already exists
        let user = await User.findOne({ email: req.body.email })
        // console.log(user)
        if (user) {
            return res.status(400).json({ success, error: 'Email already exists' })
        }
        if (!err.isEmpty()) {
            return res.status(400).json({ success, error: "Password confirmation does not match password" });
        }
        const salt = await bcrypt.genSalt(10)
        const secPassword = await bcrypt.hash(req.body.password, salt)
        //Creating the user if email does not already exist
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPassword
        })

        const data = {
            user: {
                id: user.id
            }
        }

        const jwtAuthToken = jwt.sign(data, process.env.JWT_SECRET, {expiresIn: '12h'})
        success = true
        res.status(200).json({ success, jwtAuthToken })

    }
    catch (error) {
        console.error(error.message)
        res.status(500).json({ success, error: "A server error occured. Please try again later"})
    }
})

//Route 2 : Below route is for logging the user in. No login required
router.post('/login', [
    body('email', 'Enter a valid email address').isEmail(),
    body('password', 'Password cannot be blank').exists(),
], async (req, res) => {
    let success = true
    const errors = validationResult(req)
    //In case of an error, return bad request and the error
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body
    try {
        let user = await User.findOne({ email }).exec()
        // console.log(user)
        if (!user) {
            return res.status(400).json({ error: "Invalid Credentials" })
        }

        const passwordCompare = await bcrypt.compare(password, user.password)
        if(!passwordCompare){
            return res.status(400).json({error: "Invalid Credentials" })
        }
        const data = {
            user: {
                id: user.id
            }
        }
        const jwtAuthToken = jwt.sign(data, process.env.JWT_SECRET, {expiresIn: '12h'})
        success = true
        res.status(200).json({ success, jwtAuthToken })
    } catch (error) {
        console.error(error.message)
        res.status(500).send("An internal error occured")
    }
})

//Route 3 : Below route is for fetching the logged in user details. Login required
router.post('/getUser', fetchUser, async (req, res) => {
    try{
        const userId = req.user.id
        const user = await User.findById(userId).select('email').select('name')
        res.status(200).send(user)
    } catch (error) {
        console.error(error.message)
        res.status(500).send("An internal error occured")
    }
})

module.exports = router