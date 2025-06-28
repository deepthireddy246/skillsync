import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Button, Grid, Divider, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { resumeAPI } from '../services/api';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import HistoryIcon from '@mui/icons-material/History';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lastResume, setLastResume] = useState(null);

  useEffect(() => {
    const fetchLastResume = async () => {
      try {
        const res = await resumeAPI.getHistory({ page: 1, limit: 1 });
        if (res.data.resumes.length > 0) {
          setLastResume(res.data.resumes[0]);
        }
      } catch (err) {
        // ignore
      }
    };
    fetchLastResume();
  }, []);

  return (
    <Box maxWidth={800} mx="auto" mt={2}>
      <Typography variant="h4" gutterBottom>
        Welcome, {user?.firstName}!
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Quick Actions</Typography>
              <Divider sx={{ my: 1 }} />
              <Button
                variant="contained"
                color="primary"
                startIcon={<UploadFileIcon />}
                sx={{ mb: 2, mr: 2 }}
                onClick={() => navigate('/upload')}
              >
                Upload Resume
              </Button>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<HistoryIcon />}
                onClick={() => navigate('/history')}
              >
                View History
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Last Analysis</Typography>
              <Divider sx={{ my: 1 }} />
              {lastResume ? (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    {lastResume.originalName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Status: <b>{lastResume.status}</b>
                  </Typography>
                  {lastResume.status === 'completed' && lastResume.analysis && (
                    <>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Skill Match: <b>{lastResume.analysis.skillMatch?.matchPercentage || 0}%</b>
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip label={`Strengths: ${lastResume.analysis.strengths?.length || 0}`} color="success" sx={{ mr: 1 }} />
                        <Chip label={`Missing: ${lastResume.analysis.missingSkills?.length || 0}`} color="warning" />
                      </Box>
                      <Button
                        variant="text"
                        color="primary"
                        sx={{ mt: 2 }}
                        onClick={() => navigate(`/analysis/${lastResume._id}`)}
                      >
                        View Analysis
                      </Button>
                    </>
                  )}
                  {lastResume.status === 'processing' && (
                    <Typography color="info.main">Analysis in progress...</Typography>
                  )}
                  {lastResume.status === 'failed' && (
                    <Typography color="error.main">Analysis failed.</Typography>
                  )}
                </Box>
              ) : (
                <Typography color="text.secondary">No resume uploaded yet.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 