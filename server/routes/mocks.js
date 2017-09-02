import express from 'express';

import * as MocksController from '../controllers/mocks/mocks';

const router = express.Router();

router.get('/', MocksController.index);

router.get('/mocks', MocksController.list);

router.post('/mocks', MocksController.create);

router.delete('/mocks', MocksController.remove);

export default router;