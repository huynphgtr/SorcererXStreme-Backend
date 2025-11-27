import { Request, Response } from 'express';
import { z } from 'zod';
import { UserService } from '../services/user.service';
import { updateProfileSchema , completeProfileSchema } from '../validators/user.validator';

export async function completeProfile(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const validatedData = completeProfileSchema.parse(req.body);

    const updatedUser = await UserService.updateUserProfile(userId, validatedData);

    res.status(200).json({
      message: 'Profile completed successfully',
      user: updatedUser,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        message: 'Validation failed',
        errors: error.flatten().fieldErrors,
      });
      return;
    }

    console.error('[Complete Profile Error]:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  try {
    // 1. Lấy user ID từ token đã được middleware authenticateToken giải mã
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found in token' });
      return;
    }
    
    // 2. Validate dữ liệu body gửi lên
    const validatedData = updateProfileSchema.parse(req.body);

    // Kiểm tra xem người dùng có gửi lên dữ liệu gì để cập nhật không
    if (Object.keys(validatedData).length === 0) {
      res.status(400).json({ message: 'No fields to update were provided' });
      return;
    }

    // 3. Gọi service để cập nhật thông tin user
    const updatedUser = await UserService.updateUserProfile(userId, validatedData);

    // 4. Trả về thông tin user đã được cập nhật
    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        message: 'Validation failed',
        errors: error.flatten().fieldErrors,
      });
      return;
    }

    console.error('[Update Profile Error]:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getProfile(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const userProfile = await UserService.findUserById(userId);

    if (!userProfile) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json(userProfile);

  } catch (error) {
    console.error('[Get Profile Error]:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

