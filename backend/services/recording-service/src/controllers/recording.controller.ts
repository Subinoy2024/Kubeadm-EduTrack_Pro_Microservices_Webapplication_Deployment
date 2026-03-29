import { Request, Response } from 'express';
import Joi from 'joi';
import { ApiResponse } from '@edutrack/shared';
import { paginate, logger } from '@edutrack/shared';
import * as RecordingModel from '../models/index.js';

// ─── Validation Schemas ───────────────────────────────────────────────────────

const youtubeIdPattern = /^[a-zA-Z0-9_-]{11}$/;

export const createRecordingSchema = Joi.object({
  title: Joi.string().trim().min(3).max(500).required(),
  description: Joi.string().trim().max(5000).allow('').default(''),
  subject: Joi.string().trim().min(1).max(100).required(),
  teacher_name: Joi.string().trim().min(1).max(255).required(),
  date: Joi.string().isoDate().optional(),
  duration: Joi.number().integer().min(0).required(),
  youtube_id: Joi.string().trim().pattern(youtubeIdPattern).required()
    .messages({ 'string.pattern.base': 'youtube_id must be a valid 11-character YouTube video ID' }),
  thumbnail_url: Joi.string().uri().max(1000).allow('').optional(),
  is_published: Joi.boolean().default(false),
  course_id: Joi.string().uuid().allow(null).optional(),
});

export const updateRecordingSchema = Joi.object({
  title: Joi.string().trim().min(3).max(500).optional(),
  description: Joi.string().trim().max(5000).allow('').optional(),
  subject: Joi.string().trim().min(1).max(100).optional(),
  teacher_name: Joi.string().trim().min(1).max(255).optional(),
  date: Joi.string().isoDate().optional(),
  duration: Joi.number().integer().min(0).optional(),
  youtube_id: Joi.string().trim().pattern(youtubeIdPattern).optional()
    .messages({ 'string.pattern.base': 'youtube_id must be a valid 11-character YouTube video ID' }),
  thumbnail_url: Joi.string().uri().max(1000).allow('').optional(),
  is_published: Joi.boolean().optional(),
  course_id: Joi.string().uuid().allow(null).optional(),
}).min(1);

export const recordViewSchema = Joi.object({
  watch_duration: Joi.number().integer().min(0).default(0),
});

// ─── Controllers ──────────────────────────────────────────────────────────────

export async function createRecording(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user!;

    if (user.role !== 'teacher' && user.role !== 'admin') {
      const response: ApiResponse = { success: false, error: 'Only teachers and admins can create recordings' };
      res.status(403).json(response);
      return;
    }

    const recording = await RecordingModel.createRecording({
      ...req.body,
      teacher_id: user.role === 'teacher' ? user.userId : req.body.teacher_id || user.userId,
      created_by: user.userId,
    });

    logger.info('Recording created', { recordingId: recording.id, userId: user.userId });

    const response: ApiResponse = {
      success: true,
      data: recording,
      message: 'Recording created successfully',
    };
    res.status(201).json(response);
  } catch (error: any) {
    logger.error('Error creating recording', { error: error.message });
    const response: ApiResponse = { success: false, error: 'Failed to create recording' };
    res.status(500).json(response);
  }
}

export async function getAllRecordings(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const subject = req.query.subject as string | undefined;
    const teacher_id = req.query.teacher_id as string | undefined;
    const course_id = req.query.course_id as string | undefined;
    const sortBy = req.query.sortBy as string | undefined;
    const sortOrder = req.query.sortOrder as 'asc' | 'desc' | undefined;

    // Non-admin users only see published recordings
    const user = req.user;
    const is_published = user?.role === 'admin' ? undefined : true;

    const { recordings, total } = await RecordingModel.findAllRecordings({
      page,
      limit,
      subject,
      teacher_id,
      course_id,
      is_published,
      sortBy,
      sortOrder,
    });

    const totalPages = Math.ceil(total / limit);

    const response: ApiResponse = {
      success: true,
      data: recordings,
      pagination: { page, limit, total, totalPages },
    };
    res.status(200).json(response);
  } catch (error: any) {
    logger.error('Error fetching recordings', { error: error.message });
    const response: ApiResponse = { success: false, error: 'Failed to fetch recordings' };
    res.status(500).json(response);
  }
}

export async function getRecordingById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const uuidSchema = Joi.string().uuid().required();
    const { error: idError } = uuidSchema.validate(id);
    if (idError) {
      const response: ApiResponse = { success: false, error: 'Invalid recording ID format' };
      res.status(400).json(response);
      return;
    }

    const recording = await RecordingModel.findRecordingById(id);
    if (!recording) {
      const response: ApiResponse = { success: false, error: 'Recording not found' };
      res.status(404).json(response);
      return;
    }

    // Non-admin users can only see published recordings (unless they are the teacher)
    const user = req.user;
    if (!recording.is_published && user?.role !== 'admin' && user?.userId !== recording.teacher_id) {
      const response: ApiResponse = { success: false, error: 'Recording not found' };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse = {
      success: true,
      data: recording,
    };
    res.status(200).json(response);
  } catch (error: any) {
    logger.error('Error fetching recording', { error: error.message, recordingId: req.params.id });
    const response: ApiResponse = { success: false, error: 'Failed to fetch recording' };
    res.status(500).json(response);
  }
}

export async function updateRecording(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const user = req.user!;

    const uuidSchema = Joi.string().uuid().required();
    const { error: idError } = uuidSchema.validate(id);
    if (idError) {
      const response: ApiResponse = { success: false, error: 'Invalid recording ID format' };
      res.status(400).json(response);
      return;
    }

    const existing = await RecordingModel.findRecordingById(id);
    if (!existing) {
      const response: ApiResponse = { success: false, error: 'Recording not found' };
      res.status(404).json(response);
      return;
    }

    // Teachers can only update their own recordings; admins can update any
    if (user.role === 'teacher' && existing.teacher_id !== user.userId) {
      const response: ApiResponse = { success: false, error: 'You can only update your own recordings' };
      res.status(403).json(response);
      return;
    }

    if (user.role !== 'teacher' && user.role !== 'admin') {
      const response: ApiResponse = { success: false, error: 'Insufficient permissions' };
      res.status(403).json(response);
      return;
    }

    const updated = await RecordingModel.updateRecording(id, req.body);

    logger.info('Recording updated', { recordingId: id, userId: user.userId });

    const response: ApiResponse = {
      success: true,
      data: updated,
      message: 'Recording updated successfully',
    };
    res.status(200).json(response);
  } catch (error: any) {
    logger.error('Error updating recording', { error: error.message, recordingId: req.params.id });
    const response: ApiResponse = { success: false, error: 'Failed to update recording' };
    res.status(500).json(response);
  }
}

export async function deleteRecording(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const user = req.user!;

    if (user.role !== 'admin') {
      const response: ApiResponse = { success: false, error: 'Only admins can delete recordings' };
      res.status(403).json(response);
      return;
    }

    const uuidSchema = Joi.string().uuid().required();
    const { error: idError } = uuidSchema.validate(id);
    if (idError) {
      const response: ApiResponse = { success: false, error: 'Invalid recording ID format' };
      res.status(400).json(response);
      return;
    }

    const deleted = await RecordingModel.deleteRecording(id);
    if (!deleted) {
      const response: ApiResponse = { success: false, error: 'Recording not found' };
      res.status(404).json(response);
      return;
    }

    logger.info('Recording deleted', { recordingId: id, userId: user.userId });

    const response: ApiResponse = {
      success: true,
      message: 'Recording deleted successfully',
    };
    res.status(200).json(response);
  } catch (error: any) {
    logger.error('Error deleting recording', { error: error.message, recordingId: req.params.id });
    const response: ApiResponse = { success: false, error: 'Failed to delete recording' };
    res.status(500).json(response);
  }
}

export async function searchRecordings(req: Request, res: Response): Promise<void> {
  try {
    const query = (req.query.q as string || '').trim();
    if (!query || query.length < 2) {
      const response: ApiResponse = { success: false, error: 'Search query must be at least 2 characters' };
      res.status(400).json(response);
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = (page - 1) * limit;

    const { recordings, total } = await RecordingModel.searchRecordings(query, limit, offset);
    const totalPages = Math.ceil(total / limit);

    const response: ApiResponse = {
      success: true,
      data: recordings,
      pagination: { page, limit, total, totalPages },
    };
    res.status(200).json(response);
  } catch (error: any) {
    logger.error('Error searching recordings', { error: error.message });
    const response: ApiResponse = { success: false, error: 'Failed to search recordings' };
    res.status(500).json(response);
  }
}

export async function recordViewHandler(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const user = req.user!;

    if (user.role !== 'student') {
      const response: ApiResponse = { success: false, error: 'Only students can record views' };
      res.status(403).json(response);
      return;
    }

    const uuidSchema = Joi.string().uuid().required();
    const { error: idError } = uuidSchema.validate(id);
    if (idError) {
      const response: ApiResponse = { success: false, error: 'Invalid recording ID format' };
      res.status(400).json(response);
      return;
    }

    const recording = await RecordingModel.findRecordingById(id);
    if (!recording) {
      const response: ApiResponse = { success: false, error: 'Recording not found' };
      res.status(404).json(response);
      return;
    }

    const view = await RecordingModel.recordView({
      recording_id: id,
      student_id: user.userId,
      watch_duration: req.body.watch_duration,
    });

    await RecordingModel.incrementViews(id);

    logger.info('Recording view recorded', { recordingId: id, studentId: user.userId });

    const response: ApiResponse = {
      success: true,
      data: view,
      message: 'View recorded successfully',
    };
    res.status(201).json(response);
  } catch (error: any) {
    logger.error('Error recording view', { error: error.message, recordingId: req.params.id });
    const response: ApiResponse = { success: false, error: 'Failed to record view' };
    res.status(500).json(response);
  }
}

export async function getRecordingStats(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user!;

    if (user.role !== 'admin') {
      const response: ApiResponse = { success: false, error: 'Only admins can view stats' };
      res.status(403).json(response);
      return;
    }

    const stats = await RecordingModel.getRecordingStats();

    const response: ApiResponse = {
      success: true,
      data: stats,
    };
    res.status(200).json(response);
  } catch (error: any) {
    logger.error('Error fetching recording stats', { error: error.message });
    const response: ApiResponse = { success: false, error: 'Failed to fetch recording stats' };
    res.status(500).json(response);
  }
}
