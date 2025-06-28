const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');

class TextExtractor {
  static async extractFromPDF(filePath) {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      
      return {
        text: data.text,
        pages: data.numpages,
        info: data.info
      };
    } catch (error) {
      throw new Error(`PDF extraction failed: ${error.message}`);
    }
  }

  static async extractFromDOCX(filePath) {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      
      return {
        text: result.value,
        messages: result.messages
      };
    } catch (error) {
      throw new Error(`DOCX extraction failed: ${error.message}`);
    }
  }

  static async extractText(filePath, mimeType) {
    try {
      if (mimeType === 'application/pdf') {
        return await this.extractFromPDF(filePath);
      } else if (mimeType.includes('wordprocessingml') || mimeType === 'application/msword') {
        return await this.extractFromDOCX(filePath);
      } else {
        throw new Error('Unsupported file type');
      }
    } catch (error) {
      throw new Error(`Text extraction failed: ${error.message}`);
    }
  }

  static cleanText(text) {
    if (!text) return '';
    
    return text
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
      .trim();
  }

  static extractSkills(text) {
    // Common technical skills patterns
    const skillPatterns = [
      // Programming languages
      /\b(JavaScript|Python|Java|C\+\+|C#|PHP|Ruby|Go|Rust|Swift|Kotlin|TypeScript|HTML|CSS|SQL|R|MATLAB|Scala|Perl|Shell|Bash)\b/gi,
      
      // Frameworks and libraries
      /\b(React|Angular|Vue|Node\.js|Express|Django|Flask|Spring|Laravel|ASP\.NET|jQuery|Bootstrap|Tailwind|Sass|Less|Webpack|Babel|Jest|Mocha|Chai)\b/gi,
      
      // Databases
      /\b(MongoDB|MySQL|PostgreSQL|SQLite|Redis|Oracle|SQL Server|Firebase|DynamoDB|Cassandra|Elasticsearch)\b/gi,
      
      // Cloud platforms
      /\b(AWS|Azure|Google Cloud|Heroku|DigitalOcean|Vercel|Netlify|Firebase|Docker|Kubernetes)\b/gi,
      
      // Tools and technologies
      /\b(Git|GitHub|GitLab|Bitbucket|Jenkins|Travis CI|CircleCI|Jira|Confluence|Slack|Trello|Asana|Figma|Sketch|Adobe|Photoshop|Illustrator)\b/gi,
      
      // Soft skills
      /\b(Leadership|Communication|Teamwork|Problem Solving|Critical Thinking|Time Management|Adaptability|Creativity|Collaboration|Project Management|Agile|Scrum|Kanban)\b/gi
    ];

    const skills = new Set();
    
    skillPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          skills.add(match.toLowerCase());
        });
      }
    });

    return Array.from(skills);
  }
}

module.exports = TextExtractor; 