import { Router } from 'express';
import { getEtaForStop } from '../controllers/etaController';

const router = Router();

router.get('/:stopId', getEtaForStop);

export default router;
