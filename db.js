const mongoose = require('mongoose')
const mongoUri = "mongodb://localhost:27017/takeNote?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false"

const connectToMongo = () => {
    mongoose.connect(mongoUri, () => {
        console.log("Connection to Mongo : Successful")
    })
}

module.exports = connectToMongo;