const express = require('express')

const getConfig = require('./config/getConfig')
const initRoutes = require('./routes/rout')

const app = express()
const port = getConfig().port || 3000

app.use(express.json());

initRoutes(app);

function startServer() {
  app.listen(port, () => {
      console.log(`Example app listening on port ${port}`)
  })
}

startServer();
