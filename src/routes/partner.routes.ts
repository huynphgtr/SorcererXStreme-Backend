import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import { addPartner, removePartner } from '../controllers/partner.controller'; 

const partnerRouter = Router();
partnerRouter.use(authenticateToken);

partnerRouter.post('/', addPartner); 
partnerRouter.delete('/', removePartner);

export default partnerRouter;