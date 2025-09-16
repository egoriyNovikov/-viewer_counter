require('dotenv').config();

module.exports = function getConfig() {
    return {
        port: process.env.PORT || 3000,
        redisHost: process.env.REDIS_HOST || 'localhost',
        redisPort: process.env.REDIS_PORT || 6379,
    };
};