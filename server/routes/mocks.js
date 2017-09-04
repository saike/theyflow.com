import express from 'express';

import { AuthResolver } from '../controllers/auth';

import * as MocksController from '../controllers/mocks/mocks';

const router = express.Router();

router.get('/', MocksController.index);

router.get('/mocks', MocksController.list);

router.post('/mocks', AuthResolver, MocksController.create);

router.delete('/mocks/:id', AuthResolver, MocksController.remove);

export default router;