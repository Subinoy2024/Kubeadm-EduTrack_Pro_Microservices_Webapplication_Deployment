import { Request, Response } from 'express';
import Joi from 'joi';
import { CourseModel, EnrollmentModel, LessonModel } from '../models/index.js';

// ─── Validation Schemas ────────────────────────────────────────────────────────

const createCourseSchema = Joi.object({
  title: Joi.string().min(1).max(500).trim().required(),
  description: Joi.string().max(5000).allow('', null),
  subject: Joi.string().max(100).allow('', null),
  grade_level: Joi.string().max(50).allow('', null),
  thumbnail_url: Joi.string().uri().allow('', null),
  is_published: Joi.boolean().default(false),
  max_students: Joi.number().integer().min(1).max(10000).default(50),
});

const updateCourseSchema = Joi.object({
  title: Joi.string().min(1).max(500).trim(),
  description: Joi.string().max(5000).allow('', null),
  subject: Joi.string().max(100).allow('', null),
  grade_level: Joi.string().max(50).allow('', null),
  thumbnail_url: Joi.string().uri().allow('', null),
  is_published: Joi.boolean(),
  max_students: Joi.number().integer().min(1).max(10000),
}).min(1);

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  subject: Joi.string().max(100),
  grade_level: Joi.string().max(50),
  teacher_id: Joi.string().uuid(),
  is_published: Joi.boolean(),
});

const createLessonSchema = Joi.object({
  title: Joi.string().min(1).max(500).trim().required(),
  description: Joi.string().max(5000).allow('', null),
  content: Joi.string().allow('', null),
  order_index: Joi.number().integer().min(0),
  duration: Joi.number().integer().min(0).default(0),
  video_url: Joi.string().uri().allow('', null),
  is_published: Joi.boolean().default(false),
});

const updateLessonSchema = Joi.object({
  title: Joi.string().min(1).max(500).trim(),
  description: Joi.string().max(5000).allow('', null),
  content: Joi.string().allow('', null),
  order_index: Joi.number().integer().min(0),
  duration: Joi.number().integer().min(0),
  video_url: Joi.string().uri().allow('', null),
  is_published: Joi.boolean(),
}).min(1);

const progressSchema = Joi.object({
  progress: Joi.number().integer().min(0).max(100).required(),
});

const uuidSchema = Joi.string().uuid().required();

// ─── Course Controllers ────────────────────────────────────────────────────────

export const createCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = createCourseSchema.validate(req.body, { stripUnknown: true });
    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message });
      return;
    }

    const course = await CourseModel.create({
      ...value,
      teacher_id: req.user!.userId,
    });

    res.status(201).json({
      success: true,
      data: course,
      message: 'Course created successfully.',
    });
  } catch (err) {
    console.error('[createCourse] Error:', err);
    res.status(500).json({ success: false, error: 'Failed to create course.' });
  }
};

export const getAllCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = paginationSchema.validate(req.query, { stripUnknown: true });
    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message });
      return;
    }

    const { page, limit, subject, grade_level, teacher_id, is_published } = value;
    const { courses, total } = await CourseModel.findAll(page, limit, {
      subject,
      grade_level,
      teacher_id,
      is_published,
    });

    res.json({
      success: true,
      data: courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('[getAllCourses] Error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch courses.' });
  }
};

export const getCourseById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error: idError } = uuidSchema.validate(req.params.id);
    if (idError) {
      res.status(400).json({ success: false, error: 'Invalid course ID format.' });
      return;
    }

    const course = await CourseModel.findById(req.params.id);
    if (!course) {
      res.status(404).json({ success: false, error: 'Course not found.' });
      return;
    }

    const lessons = await LessonModel.findByCourse(req.params.id);

    res.json({
      success: true,
      data: { ...course, lessons },
    });
  } catch (err) {
    console.error('[getCourseById] Error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch course.' });
  }
};

export const updateCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error: idError } = uuidSchema.validate(req.params.id);
    if (idError) {
      res.status(400).json({ success: false, error: 'Invalid course ID format.' });
      return;
    }

    const { error, value } = updateCourseSchema.validate(req.body, { stripUnknown: true });
    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message });
      return;
    }

    const existing = await CourseModel.findById(req.params.id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Course not found.' });
      return;
    }

    // Teachers can only update their own courses
    if (req.user!.role === 'teacher' && existing.teacher_id !== req.user!.userId) {
      res.status(403).json({ success: false, error: 'You can only update your own courses.' });
      return;
    }

    const updated = await CourseModel.update(req.params.id, value);

    res.json({
      success: true,
      data: updated,
      message: 'Course updated successfully.',
    });
  } catch (err) {
    console.error('[updateCourse] Error:', err);
    res.status(500).json({ success: false, error: 'Failed to update course.' });
  }
};

export const deleteCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error: idError } = uuidSchema.validate(req.params.id);
    if (idError) {
      res.status(400).json({ success: false, error: 'Invalid course ID format.' });
      return;
    }

    const existing = await CourseModel.findById(req.params.id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Course not found.' });
      return;
    }

    await CourseModel.delete(req.params.id);

    res.json({
      success: true,
      message: 'Course deleted successfully.',
    });
  } catch (err) {
    console.error('[deleteCourse] Error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete course.' });
  }
};

// ─── Enrollment Controllers ────────────────────────────────────────────────────

export const enrollStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error: idError } = uuidSchema.validate(req.params.id);
    if (idError) {
      res.status(400).json({ success: false, error: 'Invalid course ID format.' });
      return;
    }

    const course = await CourseModel.findById(req.params.id);
    if (!course) {
      res.status(404).json({ success: false, error: 'Course not found.' });
      return;
    }

    // Determine which student to enroll
    let studentId = req.user!.userId;
    if (req.user!.role === 'admin' && req.body.student_id) {
      const { error: studentIdError } = uuidSchema.validate(req.body.student_id);
      if (studentIdError) {
        res.status(400).json({ success: false, error: 'Invalid student ID format.' });
        return;
      }
      studentId = req.body.student_id;
    }

    // Check max enrollment
    const currentCount = await EnrollmentModel.getEnrollmentCount(req.params.id);
    if (currentCount >= course.max_students) {
      res.status(409).json({ success: false, error: 'Course is full. Maximum enrollment reached.' });
      return;
    }

    const enrollment = await EnrollmentModel.enroll(req.params.id, studentId);

    res.status(201).json({
      success: true,
      data: enrollment,
      message: 'Enrolled successfully.',
    });
  } catch (err) {
    console.error('[enrollStudent] Error:', err);
    res.status(500).json({ success: false, error: 'Failed to enroll in course.' });
  }
};

export const unenrollStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error: idError } = uuidSchema.validate(req.params.id);
    if (idError) {
      res.status(400).json({ success: false, error: 'Invalid course ID format.' });
      return;
    }

    let studentId = req.user!.userId;
    if (req.user!.role === 'admin' && req.body.student_id) {
      studentId = req.body.student_id;
    }

    const enrollment = await EnrollmentModel.unenroll(req.params.id, studentId);
    if (!enrollment) {
      res.status(404).json({ success: false, error: 'Enrollment not found.' });
      return;
    }

    res.json({
      success: true,
      data: enrollment,
      message: 'Unenrolled successfully.',
    });
  } catch (err) {
    console.error('[unenrollStudent] Error:', err);
    res.status(500).json({ success: false, error: 'Failed to unenroll from course.' });
  }
};

export const getMyEnrollments = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit as string, 10) || 20, 100);

    const { enrollments, total } = await EnrollmentModel.findByStudent(
      req.user!.userId,
      page,
      limit
    );

    res.json({
      success: true,
      data: enrollments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('[getMyEnrollments] Error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch enrollments.' });
  }
};

export const updateProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error: idError } = uuidSchema.validate(req.params.id);
    if (idError) {
      res.status(400).json({ success: false, error: 'Invalid course ID format.' });
      return;
    }

    const { error, value } = progressSchema.validate(req.body, { stripUnknown: true });
    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message });
      return;
    }

    const enrollment = await EnrollmentModel.updateProgress(
      req.params.id,
      req.user!.userId,
      value.progress
    );

    if (!enrollment) {
      res.status(404).json({ success: false, error: 'Enrollment not found.' });
      return;
    }

    res.json({
      success: true,
      data: enrollment,
      message: 'Progress updated successfully.',
    });
  } catch (err) {
    console.error('[updateProgress] Error:', err);
    res.status(500).json({ success: false, error: 'Failed to update progress.' });
  }
};

// ─── Lesson Controllers ───────────────────────────────────────────────────────

export const createLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error: idError } = uuidSchema.validate(req.params.id);
    if (idError) {
      res.status(400).json({ success: false, error: 'Invalid course ID format.' });
      return;
    }

    const { error, value } = createLessonSchema.validate(req.body, { stripUnknown: true });
    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message });
      return;
    }

    const course = await CourseModel.findById(req.params.id);
    if (!course) {
      res.status(404).json({ success: false, error: 'Course not found.' });
      return;
    }

    // Teachers can only add lessons to their own courses
    if (req.user!.role === 'teacher' && course.teacher_id !== req.user!.userId) {
      res.status(403).json({ success: false, error: 'You can only add lessons to your own courses.' });
      return;
    }

    const lesson = await LessonModel.create({
      ...value,
      course_id: req.params.id,
    });

    res.status(201).json({
      success: true,
      data: lesson,
      message: 'Lesson created successfully.',
    });
  } catch (err) {
    console.error('[createLesson] Error:', err);
    res.status(500).json({ success: false, error: 'Failed to create lesson.' });
  }
};

export const updateLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error: courseIdError } = uuidSchema.validate(req.params.courseId);
    if (courseIdError) {
      res.status(400).json({ success: false, error: 'Invalid course ID format.' });
      return;
    }

    const { error: lessonIdError } = uuidSchema.validate(req.params.lessonId);
    if (lessonIdError) {
      res.status(400).json({ success: false, error: 'Invalid lesson ID format.' });
      return;
    }

    const { error, value } = updateLessonSchema.validate(req.body, { stripUnknown: true });
    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message });
      return;
    }

    const course = await CourseModel.findById(req.params.courseId);
    if (!course) {
      res.status(404).json({ success: false, error: 'Course not found.' });
      return;
    }

    if (req.user!.role === 'teacher' && course.teacher_id !== req.user!.userId) {
      res.status(403).json({ success: false, error: 'You can only update lessons in your own courses.' });
      return;
    }

    const lesson = await LessonModel.findById(req.params.lessonId);
    if (!lesson || lesson.course_id !== req.params.courseId) {
      res.status(404).json({ success: false, error: 'Lesson not found in this course.' });
      return;
    }

    const updated = await LessonModel.update(req.params.lessonId, value);

    res.json({
      success: true,
      data: updated,
      message: 'Lesson updated successfully.',
    });
  } catch (err) {
    console.error('[updateLesson] Error:', err);
    res.status(500).json({ success: false, error: 'Failed to update lesson.' });
  }
};

export const deleteLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error: courseIdError } = uuidSchema.validate(req.params.courseId);
    if (courseIdError) {
      res.status(400).json({ success: false, error: 'Invalid course ID format.' });
      return;
    }

    const { error: lessonIdError } = uuidSchema.validate(req.params.lessonId);
    if (lessonIdError) {
      res.status(400).json({ success: false, error: 'Invalid lesson ID format.' });
      return;
    }

    const course = await CourseModel.findById(req.params.courseId);
    if (!course) {
      res.status(404).json({ success: false, error: 'Course not found.' });
      return;
    }

    if (req.user!.role === 'teacher' && course.teacher_id !== req.user!.userId) {
      res.status(403).json({ success: false, error: 'You can only delete lessons in your own courses.' });
      return;
    }

    const lesson = await LessonModel.findById(req.params.lessonId);
    if (!lesson || lesson.course_id !== req.params.courseId) {
      res.status(404).json({ success: false, error: 'Lesson not found in this course.' });
      return;
    }

    await LessonModel.delete(req.params.lessonId);

    res.json({
      success: true,
      message: 'Lesson deleted successfully.',
    });
  } catch (err) {
    console.error('[deleteLesson] Error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete lesson.' });
  }
};

export const getLessons = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error: idError } = uuidSchema.validate(req.params.id);
    if (idError) {
      res.status(400).json({ success: false, error: 'Invalid course ID format.' });
      return;
    }

    const course = await CourseModel.findById(req.params.id);
    if (!course) {
      res.status(404).json({ success: false, error: 'Course not found.' });
      return;
    }

    const lessons = await LessonModel.findByCourse(req.params.id);

    res.json({
      success: true,
      data: lessons,
    });
  } catch (err) {
    console.error('[getLessons] Error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch lessons.' });
  }
};

export const getCourseStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = await CourseModel.getStats();

    res.json({
      success: true,
      data: {
        totalCourses: parseInt(stats.total_courses, 10),
        publishedCourses: parseInt(stats.published_courses, 10),
        activeEnrollments: parseInt(stats.active_enrollments, 10),
        completedEnrollments: parseInt(stats.completed_enrollments, 10),
        totalStudentsEnrolled: parseInt(stats.total_students_enrolled, 10),
        totalTeachers: parseInt(stats.total_teachers, 10),
        totalLessons: parseInt(stats.total_lessons, 10),
      },
    });
  } catch (err) {
    console.error('[getCourseStats] Error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch course stats.' });
  }
};
