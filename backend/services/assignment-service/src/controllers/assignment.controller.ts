import { Response } from 'express';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../middleware/auth.js';
import * as model from '../models/index.js';

// ──────────────────────────────────────────────
// Validation schemas
// ──────────────────────────────────────────────

const createAssignmentSchema = Joi.object({
  course_id: Joi.string().uuid().required(),
  title: Joi.string().min(1).max(255).required(),
  description: Joi.string().allow('', null),
  subject: Joi.string().max(100).allow('', null),
  due_date: Joi.date().iso().greater('now').required(),
  max_score: Joi.number().integer().min(1).max(1000).default(100),
  is_published: Joi.boolean().default(false),
  priority: Joi.string().valid('high', 'medium', 'low').default('medium'),
});

const updateAssignmentSchema = Joi.object({
  course_id: Joi.string().uuid(),
  title: Joi.string().min(1).max(255),
  description: Joi.string().allow('', null),
  subject: Joi.string().max(100).allow('', null),
  due_date: Joi.date().iso(),
  max_score: Joi.number().integer().min(1).max(1000),
  is_published: Joi.boolean(),
  priority: Joi.string().valid('high', 'medium', 'low'),
}).min(1);

const submitAssignmentSchema = Joi.object({
  content: Joi.string().allow('', null),
  file_url: Joi.string().uri().allow('', null),
}).or('content', 'file_url');

const gradeSubmissionSchema = Joi.object({
  score: Joi.number().integer().min(0).required(),
  feedback: Joi.string().allow('', null).default(''),
});

// ──────────────────────────────────────────────
// Controller handlers
// ──────────────────────────────────────────────

export const createAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !['teacher', 'admin'].includes(req.user.role)) {
      res.status(403).json({ error: 'Only teachers and admins can create assignments' });
      return;
    }

    const { error, value } = createAssignmentSchema.validate(req.body, { abortEarly: false });
    if (error) {
      res.status(400).json({ error: 'Validation failed', details: error.details.map(d => d.message) });
      return;
    }

    const assignment = await model.createAssignment({
      id: uuidv4(),
      ...value,
      created_by: req.user.id,
    });

    res.status(201).json({ message: 'Assignment created successfully', data: assignment });
  } catch (err) {
    console.error('Error creating assignment:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllAssignments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
    const subject = req.query.subject as string | undefined;
    const status = req.query.status as string | undefined;
    const course_id = req.query.course_id as string | undefined;

    const { assignments, total } = await model.getAllAssignments({ page, limit, subject, status, course_id });

    res.json({
      data: assignments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('Error fetching assignments:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAssignmentById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const assignment = await model.getAssignmentById(id);

    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }

    res.json({ data: assignment });
  } catch (err) {
    console.error('Error fetching assignment:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { id } = req.params;

    const existing = await model.getAssignmentById(id);
    if (!existing) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }

    if (req.user.role === 'teacher' && existing.created_by !== req.user.id) {
      res.status(403).json({ error: 'You can only update your own assignments' });
      return;
    }

    if (req.user.role === 'student') {
      res.status(403).json({ error: 'Students cannot update assignments' });
      return;
    }

    const { error, value } = updateAssignmentSchema.validate(req.body, { abortEarly: false });
    if (error) {
      res.status(400).json({ error: 'Validation failed', details: error.details.map(d => d.message) });
      return;
    }

    const updated = await model.updateAssignment(id, value);
    res.json({ message: 'Assignment updated successfully', data: updated });
  } catch (err) {
    console.error('Error updating assignment:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ error: 'Only admins can delete assignments' });
      return;
    }

    const { id } = req.params;
    const deleted = await model.deleteAssignment(id);

    if (!deleted) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }

    res.json({ message: 'Assignment deleted successfully' });
  } catch (err) {
    console.error('Error deleting assignment:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const submitAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'student') {
      res.status(403).json({ error: 'Only students can submit assignments' });
      return;
    }

    const { id: assignmentId } = req.params;

    const assignment = await model.getAssignmentById(assignmentId);
    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }

    if (!assignment.is_published) {
      res.status(400).json({ error: 'Assignment is not published yet' });
      return;
    }

    const { error, value } = submitAssignmentSchema.validate(req.body, { abortEarly: false });
    if (error) {
      res.status(400).json({ error: 'Validation failed', details: error.details.map(d => d.message) });
      return;
    }

    const isLate = new Date() > new Date(assignment.due_date);

    const submission = await model.createSubmission({
      id: uuidv4(),
      assignment_id: assignmentId,
      student_id: req.user.id,
      content: value.content,
      file_url: value.file_url,
      status: isLate ? 'late' : 'submitted',
    });

    res.status(201).json({
      message: isLate ? 'Assignment submitted (late)' : 'Assignment submitted successfully',
      data: submission,
    });
  } catch (err: unknown) {
    if (err instanceof Error && 'code' in err && (err as { code: string }).code === '23505') {
      res.status(409).json({ error: 'You have already submitted this assignment' });
      return;
    }
    console.error('Error submitting assignment:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMySubmissions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'student') {
      res.status(403).json({ error: 'Only students can view their submissions' });
      return;
    }

    const submissions = await model.getSubmissionsByStudent(req.user.id);
    res.json({ data: submissions });
  } catch (err) {
    console.error('Error fetching submissions:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSubmissionsForAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !['teacher', 'admin'].includes(req.user.role)) {
      res.status(403).json({ error: 'Only teachers and admins can view all submissions' });
      return;
    }

    const { id: assignmentId } = req.params;

    const assignment = await model.getAssignmentById(assignmentId);
    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }

    const submissions = await model.getSubmissionsByAssignment(assignmentId);
    res.json({ data: submissions });
  } catch (err) {
    console.error('Error fetching submissions:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const gradeSubmission = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !['teacher', 'admin'].includes(req.user.role)) {
      res.status(403).json({ error: 'Only teachers and admins can grade submissions' });
      return;
    }

    const { id } = req.params;

    const submission = await model.getSubmissionById(id);
    if (!submission) {
      res.status(404).json({ error: 'Submission not found' });
      return;
    }

    const { error, value } = gradeSubmissionSchema.validate(req.body, { abortEarly: false });
    if (error) {
      res.status(400).json({ error: 'Validation failed', details: error.details.map(d => d.message) });
      return;
    }

    const assignment = await model.getAssignmentById(submission.assignment_id);
    if (assignment && value.score > assignment.max_score) {
      res.status(400).json({ error: `Score cannot exceed max score of ${assignment.max_score}` });
      return;
    }

    const graded = await model.gradeSubmission(id, value.score, value.feedback, req.user.id);
    res.json({ message: 'Submission graded successfully', data: graded });
  } catch (err) {
    console.error('Error grading submission:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAssignmentStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stats = await model.getSubmissionStats();
    res.json({ data: stats });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
