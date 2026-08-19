import { Router } from 'express';
import { getStops, createStop } from '../controllers/stopController';

const router = Router();

router.route('/').get(getStops).post(createStop);

export default router;
