import { Request, Response } from 'express';
import { EventService } from '../services/event.service';
import { createEventSchema, updateEventSchema } from '../validators/event.validator';
import { z } from 'zod';

// CREATE
// export async function addEvent(req: Request, res: Response) {
//   try {
//     const userId = req.user!.id;
//     const eventData = createEventSchema.parse(req.body);
//     const newEvent = await EventService.createEvent(userId, eventData);
//     res.status(201).json(newEvent);
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       return res.status(400).json({ message: 'Validation failed', errors: error.flatten().fieldErrors });
//     }
//     console.error('[Add Event Error]:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// }
export async function addEvent(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const eventData = createEventSchema.parse(req.body);
    const newEvent = await EventService.createEvent(userId, eventData);
    res.status(201).json(newEvent);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.flatten().fieldErrors });
    }
    // Bắt lỗi từ Service
    if (error.message.includes("not in an active relationship")) {
        return res.status(400).json({ message: error.message });
    }
    console.error('[Add Event Error]:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
// READ ALL
export async function getAllEvents(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const events = await EventService.getEventsByUserId(userId);
    res.status(200).json(events);
  } catch (error) {
    console.error('[Get All Events Error]:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// READ ONE
export async function getEvent(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { eventId } = req.params;
    const event = await EventService.getEventById(userId, eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json(event);
  } catch (error) {
    console.error('[Get Event Error]:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// UPDATE
export async function updateEvent(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { eventId } = req.params;
    const eventData = updateEventSchema.parse(req.body);

    const result = await EventService.updateEvent(userId, eventId, eventData);
    
    // updateMany trả về một object { count: n }, n là số record được cập nhật.
    // Nếu count = 0, nghĩa là không tìm thấy event hoặc không có quyền.
    if (result.count === 0) {
      return res.status(404).json({ message: 'Event not found or user does not have permission' });
    }
    
    // Lấy lại thông tin event đã cập nhật để trả về cho client
    const updatedEvent = await EventService.getEventById(userId, eventId);
    res.status(200).json(updatedEvent);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.flatten().fieldErrors });
    }
    console.error('[Update Event Error]:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// DELETE
export async function deleteEvent(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { eventId } = req.params;
    const result = await EventService.deleteEvent(userId, eventId);

    if (result.count === 0) {
      return res.status(404).json({ message: 'Event not found or user does not have permission' });
    }

    res.status(204).send(); // No Content
  } catch (error) {
    console.error('[Delete Event Error]:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}