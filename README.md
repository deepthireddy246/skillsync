# SkillSync - AI-Powered Resume Analysis Platform

A full-stack web application for resume upload, AI-powered analysis, and skill matching using Node.js, React, MongoDB, and OpenAI.

## 🚀 Current Status

✅ **Frontend**: Running successfully on http://localhost:3000  
✅ **Backend**: Running successfully on http://localhost:5001  
✅ **MongoDB**: Connected and running  
✅ **Authentication**: JWT-based auth system implemented  
✅ **File Upload**: Resume upload functionality working  
✅ **UI Components**: All pages implemented with Material-UI  

⚠️ **OpenAI Integration**: Requires API key for resume analysis features

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **OpenAI API** for resume analysis
- **Multer** for file uploads
- **Express Validator** for input validation

### Frontend
- **React** with functional components and hooks
- **Material-UI** for modern UI components
- **React Router** for navigation
- **React Dropzone** for file uploads
- **Axios** for API communication

## 📁 Project Structure

```
skillsync/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts (Auth)
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service functions
│   │   └── App.js          # Main app component
│   └── package.json
├── server/                 # Node.js backend
│   ├── middleware/         # Express middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions
│   └── index.js           # Server entry point
├── uploads/               # File upload directory
└── package.json           # Root package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (running locally or cloud instance)
- OpenAI API key (for AI features)

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd skillsync
   npm install
   cd client && npm install
   cd ../server && npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env file with your configuration
   ```

3. **Start MongoDB:**
   ```bash
   # On macOS with Homebrew
   brew services start mongodb-community
   
   # Or start manually
   mongod
   ```

4. **Start the application:**
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start separately
   npm run server  # Backend on port 5001
   npm run client  # Frontend on port 3000
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/skillsync

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

### OpenAI API Key Setup

1. Get an API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add it to your `.env` file
3. The AI features will be available once the key is configured

<img src="https://github.com/deepthireddy246/skillsync/blob/main/output.png" alt="Banner" width="100%">
## 📱 Features

### ✅ Implemented Features
- **User Authentication**: Register, login, logout
- **Resume Upload**: Support for PDF, DOC, DOCX files
- **File Management**: Upload, view, delete resumes
- **User Dashboard**: Overview of uploaded resumes
- **Profile Management**: User profile and settings
- **Admin Panel**: User management and analytics (basic structure)
- **Responsive Design**: Mobile-friendly UI

### 🔄 AI Features (Require OpenAI API Key)
- **Resume Analysis**: AI-powered skill extraction and analysis
- **Skill Matching**: Match resume skills with job requirements
- **Bullet Point Generation**: AI-generated resume improvements
- **Suggestions**: Personalized resume improvement recommendations

## 🎯 Usage

1. **Register/Login**: Create an account or sign in
2. **Upload Resume**: Drag & drop or select a resume file
3. **View Analysis**: See AI-generated insights and recommendations
4. **Manage Resumes**: View history and manage uploaded files
5. **Profile Settings**: Update personal information

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- File upload security (type and size validation)
- CORS configuration
- Rate limiting
- Helmet.js for security headers

## 🧪 Testing

The application is ready for testing with the following endpoints:

- **Frontend**: http://localhost:3000
- **Backend Health Check**: http://localhost:5001/api/health
- **API Documentation**: Available in the routes files

## 🚧 Known Issues & Next Steps

### Current Issues
- OpenAI API key required for AI features
- Some ESLint warnings about unused variables (non-critical)

### Next Steps
1. **Add OpenAI API key** to enable AI features
2. **Test resume upload and analysis** functionality
3. **Implement additional features** like:
   - Email notifications
   - Resume templates
   - Job matching algorithms
   - Advanced analytics
4. **Add comprehensive testing**
5. **Deploy to production**



## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:
1. Check the console logs for error messages
2. Ensure MongoDB is running
3. Verify environment variables are set correctly
4. Check that all dependencies are installed

---

**SkillSync** - Empowering job seekers with AI-driven resume insights! 🚀 
