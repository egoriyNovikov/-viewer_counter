const express = require('express')
const { createClient } = require('redis');
const getConfig = require('./config/getConfig')

const app = express()
const port = getConfig().port || 3000
async function initRedis() {
  const client = createClient({
    url: `redis://${getConfig().redisHost}:${getConfig().redisPort}`
  });
  
  client.on('error', err => console.log('Redis Client Error', err));
  
  await client.connect();
  await client.set('key', 'value');
  const value = await client.get('key');
  console.log('Redis test value:', value);
  
  return client;
}

app.get('/', (req, res) => {
  res.send('Hello World!')
})

async function startServer() {
  try {
    const redisClient = await initRedis();
    console.log('Redis connected successfully');
    
    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`)
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

startServer();
