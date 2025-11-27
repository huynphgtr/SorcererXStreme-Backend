import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

export async function upgradeToVIP(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { tier = 'VIP', durationDays = 30 } = req.body;

    const updatedUser = await UserService.upgradeToVIP(userId, tier, durationDays);

    res.status(200).json({
      message: 'Upgraded to VIP successfully',
      user: updatedUser,
    });

  } catch (error) {
    console.error('[Upgrade VIP Error]:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
