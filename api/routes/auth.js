import express from 'express';
const router = express.Router();

import { postUser, verifyUser } from '../controllers/auth.js';

//registeration
router.post('/register', postUser)

//verification
router.get('/verify', verifyUser)


export default router;
