import { Router } from 'express';
import { getRoutes, createRoute } from '../controllers/routeController';

const router = Router();

router.route('/').get(getRoutes).post(createRoute);

export default router;
