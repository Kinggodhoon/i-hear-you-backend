import { Router } from 'express';

import Controller from '../application/controller';

import HealthController from '../application/health/health.controller';
import RoomsController from '../application/rooms/rooms.controller';
import TurnController from '../application/turn/turn.controller';
import QuizmapsController from '../application/quizmaps/quizmaps.controller';

const router = Router();

const controllers: Array<Controller> = [
  new HealthController(),
  new RoomsController(),
  new TurnController(),
  new QuizmapsController(),
]

controllers.map((controller: Controller) => router.use('/', controller.getRouter()));

export default {
  router,
  controllers,
};
