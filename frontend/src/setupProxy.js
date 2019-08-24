const proxy = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(proxy('/api/', { target: 'http://localhost:8000/' }));
  app.use(proxy('/admin/', { target: 'http://localhost:8000/' }));
  app.use(proxy('/login/', { target: 'http://localhost:8000/' }));
  app.use(proxy('/complete/', { target: 'http://localhost:8000/' }));
  app.use(proxy('/static/admin/', { target: 'http://localhost:8000/' }));
  app.use(proxy('/static/debug_toolbar/', { target: 'http://localhost:8000/' }));
};
