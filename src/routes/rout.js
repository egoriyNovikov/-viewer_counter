const PageTracker = require('../services/pageTraker')
const getConfig = require('../config/getConfig')
const config = getConfig();
console.log(config);
const pageTracker = new PageTracker(config.redisHost, config.redisPort);

function initRoutes(app) {
  pageTracker.init();
  
  app.get('/', (req, res) => {
    res.send('Hello World!')
  })
  app.get('/page/:pageId', async (req, res) => {
    const { pageId } = req.params;
    const userId = req.sessionID || `user_${Date.now()}_${Math.random()}`;
    
    try {
      const usersCount = await pageTracker.userEnterPage(pageId, userId);
      
      res.json({
        pageId,
        userId,
        currentUsers: usersCount,
        message: `Добро пожаловать на страницу ${pageId}! Сейчас здесь ${usersCount} пользователей`
      });
    } catch (error) {
      res.status(500).json({ error: 'Ошибка при получении данных страницы' });
    }
  });
  app.get('/api/page/:pageId/users', async (req, res) => {
    const { pageId } = req.params;
    
    try {
      const usersCount = await pageTracker.getCurrentUsersCount(pageId);
      const usersList = await pageTracker.getUsersOnPage(pageId);
      
      res.json({
        pageId,
        count: usersCount,
        users: usersList
      });
    } catch (error) {
      res.status(500).json({ error: 'Ошибка при получении пользователей' });
    }
  });
  
  app.post('/api/page/:pageId/leave', async (req, res) => {
    const { pageId } = req.params;
    const { userId } = req.body;
    
    try {
      const usersCount = await pageTracker.userLeavePage(pageId, userId);
      res.json({
        pageId,
        userId,
        remainingUsers: usersCount
      });
    } catch (error) {
      res.status(500).json({ error: 'Ошибка при выходе со страницы' });
    }
  });

  app.get('/api/page/:pageId/views', async (req, res) => {
    const { pageId } = req.params;
    
    try {
      const views = await pageTracker.getPageViews(pageId);
      res.json({
        pageId,
        views
      });
    } catch (error) {
      res.status(500).json({ error: 'Ошибка при получении просмотров' });
    }
  });

  app.post('/api/page/:pageId/view', async (req, res) => {
    const { pageId } = req.params;
    
    try {
      const views = await pageTracker.incrementPageViews(pageId);
      res.json({
        pageId,
        views
      });
    } catch (error) {
      res.status(500).json({ error: 'Ошибка при увеличении счетчика' });
    }
  });
}

module.exports = initRoutes;