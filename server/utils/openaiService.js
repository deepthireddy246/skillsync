const OpenAI = require('openai');

class OpenAIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async analyzeResume(resumeText, targetJob = 'Software Engineer') {
    try {
      const prompt = this.buildAnalysisPrompt(resumeText, targetJob);
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert resume analyst and career advisor. Analyze resumes objectively and provide actionable insights."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      const analysis = JSON.parse(response.choices[0].message.content);
      return this.validateAnalysis(analysis);
    } catch (error) {
      throw new Error(`OpenAI analysis failed: ${error.message}`);
    }
  }

  buildAnalysisPrompt(resumeText, targetJob) {
    return `
Please analyze the following resume for a ${targetJob} position and provide a comprehensive analysis in JSON format.

Resume Text:
${resumeText.substring(0, 3000)}${resumeText.length > 3000 ? '...' : ''}

Please provide the analysis in the following JSON structure:

{
  "strengths": [
    {
      "skill": "skill name",
      "confidence": 0.85,
      "description": "brief description of why this is a strength"
    }
  ],
  "missingSkills": [
    {
      "skill": "skill name",
      "importance": "high|medium|low",
      "suggestion": "how to acquire or improve this skill"
    }
  ],
  "skillMatch": {
    "targetJob": "${targetJob}",
    "matchPercentage": 75,
    "matchedSkills": ["skill1", "skill2"],
    "missingSkills": ["skill3", "skill4"]
  },
  "suggestions": [
    {
      "category": "content|format|skills",
      "title": "suggestion title",
      "description": "detailed suggestion",
      "priority": "high|medium|low"
    }
  ],
  "bulletPoints": [
    {
      "category": "experience|skills|achievements",
      "points": [
        "Improved system performance by 40% through optimization",
        "Led team of 5 developers in agile environment"
      ]
    }
  ]
}

Focus on:
1. Technical skills relevant to ${targetJob}
2. Quantifiable achievements
3. Leadership and soft skills
4. Areas for improvement
5. Actionable suggestions
    `;
  }

  validateAnalysis(analysis) {
    const requiredFields = ['strengths', 'missingSkills', 'skillMatch', 'suggestions', 'bulletPoints'];
    
    for (const field of requiredFields) {
      if (!analysis[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate skill match percentage
    if (analysis.skillMatch.matchPercentage < 0 || analysis.skillMatch.matchPercentage > 100) {
      analysis.skillMatch.matchPercentage = Math.max(0, Math.min(100, analysis.skillMatch.matchPercentage));
    }

    return analysis;
  }

  async generateBulletPoints(resumeText, category) {
    try {
      const prompt = `
Based on the following resume text, generate 5-8 strong bullet points for the ${category} section:

${resumeText.substring(0, 2000)}${resumeText.length > 2000 ? '...' : ''}

Requirements:
- Use action verbs
- Include quantifiable results when possible
- Focus on achievements and impact
- Keep each point concise but impactful
- Format as a JSON array of strings

Return only the JSON array of bullet points.
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert resume writer. Generate compelling bullet points that highlight achievements and impact."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 1000
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      throw new Error(`Bullet point generation failed: ${error.message}`);
    }
  }

  async getSkillMatchPercentage(resumeSkills, targetJobSkills) {
    try {
      const prompt = `
Calculate the skill match percentage between the candidate's skills and the required skills for a ${targetJobSkills} position.

Candidate Skills: ${resumeSkills.join(', ')}

Required Skills for ${targetJobSkills}: ${this.getDefaultSkillsForJob(targetJobSkills).join(', ')}

Provide the analysis in JSON format:
{
  "matchPercentage": 75,
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill3", "skill4"],
  "explanation": "brief explanation of the match"
}
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert in skill matching and job analysis."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 500
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      throw new Error(`Skill matching failed: ${error.message}`);
    }
  }

  getDefaultSkillsForJob(jobTitle) {
    const skillMap = {
      'Software Engineer': ['JavaScript', 'Python', 'React', 'Node.js', 'Git', 'SQL', 'REST APIs'],
      'Frontend Developer': ['JavaScript', 'React', 'HTML', 'CSS', 'TypeScript', 'Git', 'Responsive Design'],
      'Backend Developer': ['Python', 'Node.js', 'SQL', 'MongoDB', 'REST APIs', 'Git', 'Docker'],
      'Data Scientist': ['Python', 'R', 'SQL', 'Machine Learning', 'Statistics', 'Pandas', 'NumPy'],
      'DevOps Engineer': ['Docker', 'Kubernetes', 'AWS', 'Linux', 'CI/CD', 'Git', 'Monitoring'],
      'Product Manager': ['Product Strategy', 'User Research', 'Agile', 'Data Analysis', 'Communication', 'Leadership'],
      'UX Designer': ['User Research', 'Figma', 'Prototyping', 'User Testing', 'Design Systems', 'Wireframing']
    };

    return skillMap[jobTitle] || skillMap['Software Engineer'];
  }
}

// Lazy initialization - only create instance when needed
let openaiServiceInstance = null;

const getOpenAIService = () => {
  if (!openaiServiceInstance) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is required for resume analysis');
    }
    openaiServiceInstance = new OpenAIService();
  }
  return openaiServiceInstance;
};

module.exports = getOpenAIService; 