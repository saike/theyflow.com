import express from 'express';
import * as AuthController from '../controllers/auth';

const router = express.Router();

router.get('/check', AuthController.check);
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);

export default router;