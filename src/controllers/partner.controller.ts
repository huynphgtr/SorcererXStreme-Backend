import { Request, Response } from 'express';
import { PartnerService } from '../services/partner.service';
import { setPartnerSchema } from '../validators/partner.validator';
import z, { ZodError } from 'zod';

export async function getPartner(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const partnerInfo = await PartnerService.getPartner(userId);
    if (!partnerInfo) {
      return res.status(404).json({ message: 'No active partner found.' });
    }
    res.status(200).json(partnerInfo);
  } catch (error) {
    console.error('[Get Partner Error]:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function addPartner(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const partnerData = setPartnerSchema.parse(req.body);

    const newPartnerInfo = await PartnerService.addPartner(userId, partnerData);
    
    res.status(201).json({ message: 'Partner added successfully.', partner: newPartnerInfo }); // Status 201 Created
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.flatten().fieldErrors });
    }
    // Bắt lỗi nghiệp vụ từ service
    if (error.message.includes('active partner already exists')) {
      return res.status(409).json({ message: error.message }); 
    }
    console.error('[Add Partner Error]:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function removePartner(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    await PartnerService.removePartner(userId);
    res.status(204).send(); 
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({
        message: 'Validation failed',
        errors: (error as any).flatten().fieldErrors,
      });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
}