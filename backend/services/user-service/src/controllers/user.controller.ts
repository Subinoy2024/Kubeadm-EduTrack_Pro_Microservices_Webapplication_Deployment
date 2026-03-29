import { Request, Response } from 'express';
import Joi from 'joi';
import { ProfileModel, UserRoleModel, DashboardModel } from '../models/index.js';

// ─── Validation Schemas ────────────────────────────────────────────────────────

const updateProfileSchema = Joi.object({
  full_name: Joi.string().min(1).max(255).trim(),
  avatar_url: Joi.string().uri().allow('', null),
  bio: Joi.string().max(1000).allow('', null),
  phone: Joi.string().max(50).allow('', null),
}).min(1);

const updateRoleSchema = Joi.object({
  role: Joi.string().valid('admin', 'teacher', 'student').required(),
});

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().valid('created_at', 'full_name', 'updated_at').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

const searchSchema = Joi.object({
  q: Joi.string().min(1).max(255).required(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

// ─── Controllers ───────────────────────────────────────────────────────────────

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const profile = await ProfileModel.findByUserId(userId);

    if (!profile) {
      res.status(404).json({
        success: false,
        error: 'Profile not found.',
      });
      return;
    }

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('[getProfile] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile.',
    });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = updateProfileSchema.validate(req.body, { stripUnknown: true });
    if (error) {
      res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
      return;
    }

    const userId = req.user!.userId;
    const updated = await ProfileModel.update(userId, value);

    if (!updated) {
      res.status(404).json({
        success: false,
        error: 'Profile not found or no changes made.',
      });
      return;
    }

    res.json({
      success: true,
      data: updated,
      message: 'Profile updated successfully.',
    });
  } catch (error) {
    console.error('[updateProfile] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile.',
    });
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = paginationSchema.validate(req.query, { stripUnknown: true });
    if (error) {
      res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
      return;
    }

    const { page, limit, sortBy, sortOrder } = value;
    const { profiles, total } = await ProfileModel.findAll(page, limit, sortBy, sortOrder);

    res.json({
      success: true,
      data: profiles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[getAllUsers] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users.',
    });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const uuidSchema = Joi.string().uuid().required();
    const { error } = uuidSchema.validate(id);
    if (error) {
      res.status(400).json({
        success: false,
        error: 'Invalid user ID format.',
      });
      return;
    }

    const profile = await ProfileModel.findByUserId(id);

    if (!profile) {
      res.status(404).json({
        success: false,
        error: 'User not found.',
      });
      return;
    }

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('[getUserById] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user.',
    });
  }
};

export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const uuidSchema = Joi.string().uuid().required();
    const { error: idError } = uuidSchema.validate(id);
    if (idError) {
      res.status(400).json({
        success: false,
        error: 'Invalid user ID format.',
      });
      return;
    }

    const { error, value } = updateRoleSchema.validate(req.body, { stripUnknown: true });
    if (error) {
      res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
      return;
    }

    const profile = await ProfileModel.findByUserId(id);
    if (!profile) {
      res.status(404).json({
        success: false,
        error: 'User not found.',
      });
      return;
    }

    const updatedRole = await UserRoleModel.update(id, value.role, req.user!.userId);

    res.json({
      success: true,
      data: updatedRole,
      message: `User role updated to '${value.role}' successfully.`,
    });
  } catch (error) {
    console.error('[updateUserRole] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user role.',
    });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const uuidSchema = Joi.string().uuid().required();
    const { error } = uuidSchema.validate(id);
    if (error) {
      res.status(400).json({
        success: false,
        error: 'Invalid user ID format.',
      });
      return;
    }

    const profile = await ProfileModel.findByUserId(id);
    if (!profile) {
      res.status(404).json({
        success: false,
        error: 'User not found.',
      });
      return;
    }

    await ProfileModel.softDelete(id);

    res.json({
      success: true,
      message: 'User soft-deleted successfully.',
    });
  } catch (error) {
    console.error('[deleteUser] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user.',
    });
  }
};

export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [stats, usersByRole, recentUsers] = await Promise.all([
      ProfileModel.getStats(),
      DashboardModel.getUsersByRole(),
      DashboardModel.getRecentUsers(10),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers: parseInt(stats.total_users, 10),
        adminCount: parseInt(stats.admin_count, 10),
        teacherCount: parseInt(stats.teacher_count, 10),
        studentCount: parseInt(stats.student_count, 10),
        usersByRole,
        recentUsers,
      },
    });
  } catch (error) {
    console.error('[getDashboardStats] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard stats.',
    });
  }
};

export const searchUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = searchSchema.validate(req.query, { stripUnknown: true });
    if (error) {
      res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
      return;
    }

    const { q, page, limit } = value;
    const { profiles, total } = await ProfileModel.search(q, page, limit);

    res.json({
      success: true,
      data: profiles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[searchUsers] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search users.',
    });
  }
};
