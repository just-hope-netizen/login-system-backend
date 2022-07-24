import express from 'express';
const router = express.Router();

import { getUser, postUser, verifyUser } from '../controllers/auth.js';

//registeration
router.post('/register', postUser)

//verification
router.get('/verify/:userId/:uniqueString', verifyUser)

//login
router.post('/login', getUser)

export default router;
