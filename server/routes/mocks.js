import express from 'express';

import { AuthResolver } from '../controllers/auth';

import * as MocksController from '../controllers/mocks/mocks';

const router = express.Router();

router.get('/', MocksController.list);

router.post('/', AuthResolver, MocksController.create);

router.post('/:id', AuthResolver, MocksController.edit);

router.delete('/:id', AuthResolver, MocksController.remove);

export default router;