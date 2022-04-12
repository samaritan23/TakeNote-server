var jwt = require('jsonwebtoken')
require("dotenv").config();

const fetchUser = (req, res, next) => {
    //Fetch the user from the jwt token and append id to the req object
    const token = req.header('auth-token')
    if(!token){
        res.status(401).send({error: "Invalid token"})
    }
    try{
        const data = jwt.verify(token, process.env.JWT_SECRET)
        // console.log(data)
        req.user = data.user
        // console.log(req)
        next()
    } catch (error) {
        res.status(401).send({error: "Invalid token"})
    }
}

module.exports = fetchUser