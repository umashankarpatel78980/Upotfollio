import express from 'express';
import * as contactController from '../controllers/contactController.js';

const router = express.Router();

router.post('/add', contactController.createContact);
router.get('/all', contactController.getContacts);
router.get('/:id', contactController.getContactById);
router.put('/:id', contactController.updateContact);
router.delete('/:id', contactController.deleteContact);
router.post('/reply/:id', contactController.replyToContact);


export default router;
