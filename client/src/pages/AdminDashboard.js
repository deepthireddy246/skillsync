import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const AdminDashboard = () => {
  return (
    <Box maxWidth={800} mx="auto" mt={2}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Welcome to the Admin Panel
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This is the admin dashboard. You can manage users and view analytics from here.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminDashboard; 