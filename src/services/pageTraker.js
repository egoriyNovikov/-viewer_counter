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
    
    await this.subscriber.subscribe('page-view', (message) => {
      const { pageId, views } = JSON.parse(message);
      console.log(`Страница ${pageId} просмотрена! Всего просмотров: ${views}`);
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

  async incrementPageViews(pageId) {
    const views = await this.publisher.incr(`page:${pageId}:views`);
    
    await this.publisher.publish('page-view', JSON.stringify({ pageId, views }));
    
    return views;
  }

  async getPageViews(pageId) {
    const views = await this.publisher.get(`page:${pageId}:views`);
    return parseInt(views) || 0;
  }
}

module.exports = PageTraker; 