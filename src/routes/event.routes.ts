import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import {
    addEvent,
    getAllEvents,
    getEvent,
    updateEvent,
    deleteEvent
} from '../controllers/event.controller';

const eventRouter = Router();


eventRouter.use(authenticateToken);


eventRouter.post('/', addEvent);
eventRouter.get('/', getAllEvents);
eventRouter.get('/:eventId', getEvent);
eventRouter.patch('/:eventId', updateEvent);
eventRouter.delete('/:eventId', deleteEvent);

export default eventRouter;