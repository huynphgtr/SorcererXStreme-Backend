import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import { addPartner, getAllPartners, getPartner, updatePartner, deletePartner } from '../controllers/partner.controller';

const partnerRouter = Router();

partnerRouter.use(authenticateToken);

partnerRouter.post('/', addPartner);
partnerRouter.get('/', getAllPartners); 
partnerRouter.get('/:partnerId', getPartner); 
partnerRouter.patch('/:partnerId', updatePartner); 
partnerRouter.delete('/:partnerId', deletePartner); 

export default partnerRouter;