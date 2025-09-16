const express = require('express')
const getConfig = require('./config/getConfig')

const app = express()
const port = getConfig().port || 3000



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
