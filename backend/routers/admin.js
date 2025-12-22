import express from 'express';
const router = express.Router();
import * as adminController from '../controllers/admin.js';

router.post('/register', adminController.adminRegister);
router.post('/login', adminController.adminLogin);

export default router;
