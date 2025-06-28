import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, TablePagination, LinearProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { resumeAPI } from '../services/api';

const ResumeHistory = () => {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async (pageNum = 0, limit = 10) => {
    setLoading(true);
    try {
      const res = await resumeAPI.getHistory({ page: pageNum + 1, limit });
      setResumes(res.data.resumes);
      setTotal(res.data.pagination.total);
    } catch (err) {
      setResumes([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(page, rowsPerPage);
    // eslint-disable-next-line
  }, [page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box maxWidth={900} mx="auto" mt={2}>
      <Typography variant="h4" gutterBottom>
        Resume History
      </Typography>
      <Card>
        <CardContent>
          {loading ? <LinearProgress sx={{ mb: 2 }} /> : null}
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>File Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {resumes.map((resume) => (
                  <TableRow key={resume._id}>
                    <TableCell>{resume.originalName}</TableCell>
                    <TableCell>
                      <Chip
                        label={resume.status}
                        color={
                          resume.status === 'completed'
                            ? 'success'
                            : resume.status === 'processing'
                            ? 'info'
                            : resume.status === 'failed'
                            ? 'error'
                            : 'default'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{new Date(resume.createdAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate(`/analysis/${resume._id}`)}
                        disabled={resume.status !== 'completed'}
                      >
                        View Analysis
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {resumes.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No resumes found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default ResumeHistory; 