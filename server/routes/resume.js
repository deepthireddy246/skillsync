const express = require('express');
const { body, validationResult } = require('express-validator');
const Resume = require('../models/Resume');
const { authenticateToken } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');
const TextExtractor = require('../utils/textExtractor');
const fs = require('fs').promises;

const router = express.Router();

// Upload resume file
router.post('/upload', authenticateToken, upload, handleUploadError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Extract text from the uploaded file
    const extractedData = await TextExtractor.extractText(req.file.path, req.file.mimetype);
    const cleanedText = TextExtractor.cleanText(extractedData.text);

    if (!cleanedText || cleanedText.length < 50) {
      // Clean up uploaded file
      await fs.unlink(req.file.path);
      return res.status(400).json({ message: 'Could not extract meaningful text from the file' });
    }

    // Create resume record
    const resume = new Resume({
      user: req.user._id,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      extractedText: cleanedText,
      status: 'uploaded'
    });

    await resume.save();

    res.status(201).json({
      message: 'Resume uploaded successfully',
      resume: {
        id: resume._id,
        originalName: resume.originalName,
        fileSize: resume.fileSize,
        status: resume.status,
        createdAt: resume.createdAt
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up uploaded file if it exists
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to delete uploaded file:', unlinkError);
      }
    }
    
    res.status(500).json({ message: 'Upload failed' });
  }
});

// Analyze resume with AI
router.post('/analyze/:resumeId', authenticateToken, [
  body('targetJob').optional().trim().notEmpty()
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { resumeId } = req.params;
    const { targetJob = 'Software Engineer' } = req.body;

    // Find resume and verify ownership
    const resume = await Resume.findOne({ _id: resumeId, user: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Update status to processing
    resume.status = 'processing';
    await resume.save();

    try {
      // Get OpenAI service instance
      const getOpenAIService = require('../utils/openaiService');
      const openaiService = getOpenAIService();
      
      // Perform AI analysis
      const startTime = Date.now();
      const analysis = await openaiService.analyzeResume(resume.extractedText, targetJob);
      const processingTime = Date.now() - startTime;

      // Update resume with analysis results
      resume.analysis = analysis;
      resume.status = 'completed';
      resume.processingTime = processingTime;
      await resume.save();

      res.json({
        message: 'Analysis completed successfully',
        analysis: resume.analysis,
        processingTime
      });
    } catch (analysisError) {
      // Update status to failed
      resume.status = 'failed';
      resume.error = {
        message: analysisError.message,
        code: 'ANALYSIS_FAILED'
      };
      await resume.save();

      throw analysisError;
    }
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ message: 'Analysis failed' });
  }
});

// Get resume analysis history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = { user: req.user._id };
    if (status) {
      query.status = status;
    }

    // Get resumes with pagination
    const resumes = await Resume.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-extractedText');

    // Get total count
    const total = await Resume.countDocuments(query);

    res.json({
      resumes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch history' });
  }
});

// Get specific resume analysis
router.get('/:resumeId', authenticateToken, async (req, res) => {
  try {
    const { resumeId } = req.params;

    const resume = await Resume.findOne({ _id: resumeId, user: req.user._id })
      .populate('user', 'firstName lastName email');

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    res.json({ resume });
  } catch (error) {
    console.error('Resume fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch resume' });
  }
});

// Delete resume
router.delete('/:resumeId', authenticateToken, async (req, res) => {
  try {
    const { resumeId } = req.params;

    const resume = await Resume.findOne({ _id: resumeId, user: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Delete file from filesystem
    try {
      await fs.unlink(resume.filePath);
    } catch (unlinkError) {
      console.error('Failed to delete file:', unlinkError);
    }

    // Delete from database
    await Resume.findByIdAndDelete(resumeId);

    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Failed to delete resume' });
  }
});

// Generate additional bullet points
router.post('/:resumeId/bullet-points', authenticateToken, [
  body('category').isIn(['experience', 'skills', 'achievements', 'education']),
  body('count').optional().isInt({ min: 1, max: 10 })
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { resumeId } = req.params;
    const { category, count = 5 } = req.body;

    const resume = await Resume.findOne({ _id: resumeId, user: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const getOpenAIService = require('../utils/openaiService');
    const openaiService = getOpenAIService();
    const bulletPoints = await openaiService.generateBulletPoints(resume.extractedText, category);

    res.json({
      message: 'Bullet points generated successfully',
      category,
      bulletPoints: bulletPoints.slice(0, count)
    });
  } catch (error) {
    console.error('Bullet points generation error:', error);
    res.status(500).json({ message: 'Failed to generate bullet points' });
  }
});

// Get skill match for different job titles
router.post('/:resumeId/skill-match', authenticateToken, [
  body('targetJob').trim().notEmpty()
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { resumeId } = req.params;
    const { targetJob } = req.body;

    const resume = await Resume.findOne({ _id: resumeId, user: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Extract skills from resume text
    const resumeSkills = TextExtractor.extractSkills(resume.extractedText);
    
    // Get skill match analysis
    const getOpenAIService = require('../utils/openaiService');
    const openaiService = getOpenAIService();
    const skillMatch = await openaiService.getSkillMatchPercentage(resumeSkills, targetJob);

    res.json({
      message: 'Skill match analysis completed',
      targetJob,
      skillMatch
    });
  } catch (error) {
    console.error('Skill match error:', error);
    res.status(500).json({ message: 'Failed to analyze skill match' });
  }
});

module.exports = router; 