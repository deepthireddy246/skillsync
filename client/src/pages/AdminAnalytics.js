import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const AdminAnalytics = () => {
  return (
    <Box maxWidth={800} mx="auto" mt={2}>
      <Typography variant="h4" gutterBottom>
        Analytics
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Platform Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This page will show platform analytics and usage statistics.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminAnalytics; 