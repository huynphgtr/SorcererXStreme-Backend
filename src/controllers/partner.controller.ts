// src/controllers/partner.controller.ts
import { Request, Response } from 'express';
import { PartnerService } from '../services/partner.service';
import { createPartnerSchema, updatePartnerSchema } from '../validators/partner.validator';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

// CREATE
// export async function addPartner(req: Request, res: Response) {
//   try {
//     const userId = req.user!.id;
//     const partnerData = createPartnerSchema.parse(req.body);
//     const newPartner = await PartnerService.createPartner(userId, partnerData);
//     res.status(201).json(newPartner);
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       return res.status(400).json({ message: 'Validation failed', errors: error });
//     }
//     res.status(500).json({ message: 'Internal server error' });
//   }
// }
export async function addPartner(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const partnerData = createPartnerSchema.parse(req.body);
    const newPartner = await PartnerService.createPartner(userId, partnerData);
    res.status(201).json(newPartner);
  } catch (error: any) { 
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error });
    }
    if (error.message.includes("active relationship")) {
        return res.status(409).json({ message: error.message }); 
    }
    res.status(500).json({ message: 'Internal server error' });
  }
}

// READ ALL
export async function getAllPartners(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const partners = await PartnerService.getPartnersByUserId(userId);
    res.status(200).json(partners);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
}

// READ ONE
export async function getPartner(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { partnerId } = req.params;
    const partner = await PartnerService.getPartnerById(userId, partnerId);
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }
    res.status(200).json(partner);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
}

// UPDATE
export async function updatePartner(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { partnerId } = req.params;
    const partnerData = updatePartnerSchema.parse(req.body);

    if (Object.keys(partnerData).length === 0) {
      return res.status(400).json({ message: 'No fields to update provided' });
    }

    const updatedPartner = await PartnerService.updatePartner(userId, partnerId, partnerData);
    res.status(200).json(updatedPartner);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return res.status(404).json({ message: 'Partner not found or permission denied' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
}

// DELETE
export async function deletePartner(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { partnerId } = req.params;
    await PartnerService.deletePartner(userId, partnerId);
    res.status(204).send(); // 204 No Content là response chuẩn cho việc xóa thành công
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      // P2025: An operation failed because it depends on one or more records that were required but not found.
      return res.status(404).json({ message: 'Partner not found or permission denied' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
}