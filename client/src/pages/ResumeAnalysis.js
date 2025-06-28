import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Card, CardContent, Typography, LinearProgress, Alert, Chip, Grid, Divider } from '@mui/material';
import { resumeAPI } from '../services/api';

const ResumeAnalysis = () => {
  const { resumeId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await resumeAPI.getResume(resumeId);
        if (res.data.resume.status === 'completed') {
          setAnalysis(res.data.resume.analysis);
        } else if (res.data.resume.status === 'processing') {
          // Poll for completion
          setTimeout(fetchAnalysis, 2000);
        } else if (res.data.resume.status === 'failed') {
          setError(res.data.resume.error?.message || 'Analysis failed.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch analysis.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
    // eslint-disable-next-line
  }, [resumeId]);

  if (loading) return <LinearProgress sx={{ mt: 4 }} />;
  if (error) return <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>;
  if (!analysis) return null;

  return (
    <Box maxWidth={900} mx="auto" mt={2}>
      <Typography variant="h4" gutterBottom>
        Resume Analysis
      </Typography>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6">Skill Match</Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Target Job: <b>{analysis.skillMatch?.targetJob}</b>
          </Typography>
          <Typography variant="h5" color="primary">
            {analysis.skillMatch?.matchPercentage || 0}% Match
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Chip label={`Matched: ${analysis.skillMatch?.matchedSkills?.length || 0}`} color="success" sx={{ mr: 1 }} />
            <Chip label={`Missing: ${analysis.skillMatch?.missingSkills?.length || 0}`} color="warning" />
          </Box>
        </CardContent>
      </Card>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">Strengths</Typography>
              <Divider sx={{ my: 1 }} />
              {analysis.strengths?.length ? analysis.strengths.map((s, i) => (
                <Box key={i} mb={1}>
                  <Typography variant="subtitle1"><b>{s.skill}</b> ({Math.round((s.confidence || 0) * 100)}%)</Typography>
                  <Typography variant="body2" color="text.secondary">{s.description}</Typography>
                </Box>
              )) : <Typography color="text.secondary">No strengths identified.</Typography>}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">Missing Skills</Typography>
              <Divider sx={{ my: 1 }} />
              {analysis.missingSkills?.length ? analysis.missingSkills.map((m, i) => (
                <Box key={i} mb={1}>
                  <Typography variant="subtitle1"><b>{m.skill}</b> ({m.importance})</Typography>
                  <Typography variant="body2" color="text.secondary">{m.suggestion}</Typography>
                </Box>
              )) : <Typography color="text.secondary">No missing skills identified.</Typography>}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6">Suggestions</Typography>
          <Divider sx={{ my: 1 }} />
          {analysis.suggestions?.length ? analysis.suggestions.map((s, i) => (
            <Box key={i} mb={1}>
              <Typography variant="subtitle1"><b>{s.title}</b> ({s.category}, {s.priority})</Typography>
              <Typography variant="body2" color="text.secondary">{s.description}</Typography>
            </Box>
          )) : <Typography color="text.secondary">No suggestions available.</Typography>}
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Typography variant="h6">Bullet Points</Typography>
          <Divider sx={{ my: 1 }} />
          {analysis.bulletPoints?.length ? analysis.bulletPoints.map((bp, i) => (
            <Box key={i} mb={2}>
              <Typography variant="subtitle2" color="primary"><b>{bp.category}</b></Typography>
              <ul style={{ margin: 0 }}>
                {bp.points.map((pt, j) => (
                  <li key={j}><Typography variant="body2">{pt}</Typography></li>
                ))}
              </ul>
            </Box>
          )) : <Typography color="text.secondary">No bullet points generated.</Typography>}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ResumeAnalysis; 