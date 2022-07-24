import express from 'express';
import { editUser, sendMail } from '../controllers/user.js';
const router = express.Router();


router.put('/change-password/:userId', editUser )
router.post('/confirm-email', sendMail)


export default router;