const { createClient } = require('redis');

class PageTraker {
  constructor(redisHost, redisPort) {
    this.subscriber = createClient({url: `redis://${redisHost}:${redisPort}`})
    this.publisher = createClient({url: `redis://${redisHost}:${redisPort}`})
  }
  
  async init() {
    await this.subscriber.connect();
    await this.publisher.connect();
    await this.subscriber.subscribe('page_counter', (message) => {
      const {pageId, userId} = JSON.parse(message);
      this.publisher.publish('page_counter', JSON.stringify({pageId, userId}));
      console.log(`Пользователь ${userId} зашел на страницу ${pageId}`);
    });
    await this.subscriber.subscribe('user-leave', (message) => {
      const { pageId, userId } = JSON.parse(message);
      console.log(`Пользователь ${userId} покинул страницу ${pageId}`);
    });
  }
  
  async userEnterPage(pageId, userId) {
    await this.publisher.sAdd(`page:${pageId}:users`, userId);
    await this.publisher.expire(`page:${pageId}:users`, 300);
    
    await this.publisher.publish('user-enter', JSON.stringify({ pageId, userId }));
    
    return await this.getCurrentUsersCount(pageId);
  }
  
  async userLeavePage(pageId, userId) {
    await this.publisher.sRem(`page:${pageId}:users`, userId);
    await this.publisher.publish('user-leave', JSON.stringify({ pageId, userId }));
    
    return await this.getCurrentUsersCount(pageId);
  }
  
  async getCurrentUsersCount(pageId) {
    return await this.publisher.sCard(`page:${pageId}:users`);
  }
  
  async getUsersOnPage(pageId) {
    return await this.publisher.sMembers(`page:${pageId}:users`);
  }
}

module.exports = PageTraker; 