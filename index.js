const connectToMongo = require("./db")
const express = require('express')
var cors = require('cors')
require("dotenv").config()

connectToMongo();

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(cors())

app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))

app.get('/', (req, res) => {
  res.send('This is Take-A-Note server!!')
})

app.listen(port, () => {
  console.log(`Take-A-Note server listening at http://localhost:${port}`)
})