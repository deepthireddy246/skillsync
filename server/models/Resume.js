const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  extractedText: {
    type: String,
    required: true
  },
  analysis: {
    strengths: [{
      skill: String,
      confidence: Number,
      description: String
    }],
    missingSkills: [{
      skill: String,
      importance: String,
      suggestion: String
    }],
    skillMatch: {
      targetJob: String,
      matchPercentage: Number,
      matchedSkills: [String],
      missingSkills: [String]
    },
    suggestions: [{
      category: String,
      title: String,
      description: String,
      priority: String
    }],
    bulletPoints: [{
      category: String,
      points: [String]
    }]
  },
  status: {
    type: String,
    enum: ['uploaded', 'processing', 'completed', 'failed'],
    default: 'uploaded'
  },
  processingTime: {
    type: Number // in milliseconds
  },
  error: {
    message: String,
    code: String
  }
}, {
  timestamps: true
});

// Index for faster queries
resumeSchema.index({ user: 1, createdAt: -1 });
resumeSchema.index({ status: 1 });

// Virtual for file type
resumeSchema.virtual('fileType').get(function() {
  return this.mimeType.split('/')[1];
});

// Method to get analysis summary
resumeSchema.methods.getAnalysisSummary = function() {
  if (!this.analysis) return null;
  
  return {
    totalStrengths: this.analysis.strengths?.length || 0,
    totalMissingSkills: this.analysis.missingSkills?.length || 0,
    skillMatchPercentage: this.analysis.skillMatch?.matchPercentage || 0,
    totalSuggestions: this.analysis.suggestions?.length || 0
  };
};

module.exports = mongoose.model('Resume', resumeSchema); 