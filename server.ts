import http from 'http';

import ExpressApp from './express-app';

import v1Router from './src/route/v1'
import Config from './src/config/Config';
import { initSocket } from './socket-app';

const expressApp = new ExpressApp();

// connect v1 route
expressApp.app.use('/v1', v1Router.router);

// create http server
const httpServer = http.createServer(expressApp.app)

// connect socket io
initSocket(httpServer)

// Listen
httpServer.listen(Config.getConfig().PORT, () => {
  console.info('=================================');
  console.info(`============ ENV: ${Config.getConfig().ENV} ===========`);
  console.info(`🚀 App listening on the port ${Config.getConfig().PORT}`);
  console.info('=================================');
});
