import { Router } from 'express';
import { getBuses, createBus } from '../controllers/busController';

const router = Router();

router.route('/').get(getBuses).post(createBus);

export default router;
