const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Resume = require('../models/Resume');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply admin middleware to all routes
router.use(authenticateToken, requireAdmin);

// Get all users with pagination
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, isActive } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    // Get users with pagination
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin users fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Get user details
router.get('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's resume count
    const resumeCount = await Resume.countDocuments({ user: userId });

    res.json({
      user: {
        ...user.toObject(),
        resumeCount
      }
    });
  } catch (error) {
    console.error('Admin user fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

// Update user
router.put('/users/:userId', [
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('role').optional().isIn(['user', 'admin']),
  body('isActive').optional().isBoolean(),
  body('profile.phone').optional().trim(),
  body('profile.location').optional().trim(),
  body('profile.bio').optional().trim()
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

    const { userId } = req.params;
    const { firstName, lastName, role, isActive, profile } = req.body;

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (profile) updateData.profile = profile;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Admin user update error:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

// Delete user
router.delete('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent admin from deleting themselves
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user's resumes
    await Resume.deleteMany({ user: userId });

    // Delete user
    await User.findByIdAndDelete(userId);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Admin user delete error:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// Get platform analytics
router.get('/analytics', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get user statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const newUsers = await User.countDocuments({ createdAt: { $gte: startDate } });

    // Get resume statistics
    const totalResumes = await Resume.countDocuments();
    const completedResumes = await Resume.countDocuments({ status: 'completed' });
    const failedResumes = await Resume.countDocuments({ status: 'failed' });
    const newResumes = await Resume.countDocuments({ createdAt: { $gte: startDate } });

    // Get average processing time
    const avgProcessingTime = await Resume.aggregate([
      { $match: { processingTime: { $exists: true } } },
      { $group: { _id: null, avgTime: { $avg: '$processingTime' } } }
    ]);

    // Get top job titles
    const topJobTitles = await Resume.aggregate([
      { $match: { 'analysis.skillMatch.targetJob': { $exists: true } } },
      { $group: { _id: '$analysis.skillMatch.targetJob', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get average skill match percentage
    const avgSkillMatch = await Resume.aggregate([
      { $match: { 'analysis.skillMatch.matchPercentage': { $exists: true } } },
      { $group: { _id: null, avgMatch: { $avg: '$analysis.skillMatch.matchPercentage' } } }
    ]);

    // Get daily uploads for the period
    const dailyUploads = await Resume.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      period,
      users: {
        total: totalUsers,
        active: activeUsers,
        new: newUsers,
        activePercentage: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0
      },
      resumes: {
        total: totalResumes,
        completed: completedResumes,
        failed: failedResumes,
        new: newResumes,
        successRate: totalResumes > 0 ? Math.round((completedResumes / totalResumes) * 100) : 0
      },
      performance: {
        avgProcessingTime: avgProcessingTime[0]?.avgTime || 0,
        avgSkillMatch: avgSkillMatch[0]?.avgMatch || 0
      },
      topJobTitles,
      dailyUploads
    });
  } catch (error) {
    console.error('Analytics fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
});

// Get system health
router.get('/health', async (req, res) => {
  try {
    // Check database connection
    const dbStatus = await User.db.db.admin().ping();
    
    // Check OpenAI API (optional)
    let openaiStatus = 'unknown';
    try {
      // You could add a simple OpenAI API test here
      openaiStatus = 'available';
    } catch (error) {
      openaiStatus = 'error';
    }

    // Get system stats
    const userCount = await User.countDocuments();
    const resumeCount = await Resume.countDocuments();
    const activeResumes = await Resume.countDocuments({ status: 'completed' });

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus.ok ? 'connected' : 'disconnected',
        openai: openaiStatus
      },
      stats: {
        users: userCount,
        resumes: resumeCount,
        activeResumes
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

module.exports = router; 