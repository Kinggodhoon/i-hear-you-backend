import { Router } from 'express';

import Controller from '../application/controller';

import HealthController from '../application/health/health.controller';
import RoomsController from '../application/rooms/rooms.controller';

const router = Router();

const controllers: Array<Controller> = [
  new HealthController(),
  new RoomsController(),
]

controllers.map((controller: Controller) => router.use('/', controller.getRouter()));

export default {
  router,
  controllers,
};
