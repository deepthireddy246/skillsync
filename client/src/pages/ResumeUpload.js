import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Typography, Button, LinearProgress, Alert } from '@mui/material';
import { resumeAPI } from '../services/api';
import { useDropzone } from 'react-dropzone';
import UploadFileIcon from '@mui/icons-material/UploadFile';

const ResumeUpload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const onDrop = (acceptedFiles) => {
    setError('');
    setSuccess('');
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    setSuccess('');
    try {
      const response = await resumeAPI.upload(file);
      setSuccess('Resume uploaded successfully! Redirecting...');
      setTimeout(() => {
        navigate(`/analysis/${response.data.resume.id}`);
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box maxWidth={500} mx="auto">
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Upload Your Resume
          </Typography>
          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed #1976d2',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              bgcolor: isDragActive ? 'primary.lighter' : 'background.paper',
              cursor: 'pointer',
              mb: 2,
            }}
          >
            <input {...getInputProps()} />
            <UploadFileIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography>
              {file ? file.name : 'Drag & drop a PDF or DOCX file here, or click to select'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Max file size: 5MB
            </Typography>
          </Box>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          {uploading && <LinearProgress sx={{ mb: 2 }} />}
          <Button
            variant="contained"
            color="primary"
            fullWidth
            disabled={!file || uploading}
            onClick={handleUpload}
            size="large"
          >
            Upload Resume
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ResumeUpload; 