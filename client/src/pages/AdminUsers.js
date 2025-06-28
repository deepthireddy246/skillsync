import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const AdminUsers = () => {
  return (
    <Box maxWidth={800} mx="auto" mt={2}>
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            User Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This page will show a list of all users and allow admin actions.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminUsers; 