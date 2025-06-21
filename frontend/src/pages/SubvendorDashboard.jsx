import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, TableContainer, Table,
  TableHead, TableBody, TableRow, TableCell,
  TextField, Button, Snackbar, Alert
} from '@mui/material';
import { getUser } from '../utils/auth';
import api from '../services/api';

const primaryColor = '#43B02A';

export default function SubvendorDashboard() {
  const navigate = useNavigate();
  const me = getUser();
  const [users, setUsers] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!me || me.role !== 'subvendor') {
      navigate('/');
    }
  }, [me, navigate]);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/subvendor/users');
        setUsers(res.data.data);
      } catch {
        setErrorMessage('Failed to load your drivers');
        setSnackbarOpen(true);
      }
    }
    load();
  }, []);

  const handleCloseSnackbar = () => setSnackbarOpen(false);

  const handleDelete = async id => {
    if (!window.confirm('Delete this driver?')) return;
    try {
      await api.delete(`/subvendor/users/${id}`);
      setSuccessMessage('Driver deleted');
      setSuccessOpen(true);
      setUsers(prev => prev.filter(u => u._id !== id));
    } catch {
      setErrorMessage('Delete failed');
      setSnackbarOpen(true);
    }
  };

  return (
    <Box sx={{ py: 4, px: 18, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4" sx={{ color: primaryColor, fontWeight: 'bold', fontStyle: 'italic' }}>
          Subvendor Dashboard
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ overflowX: 'auto' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: primaryColor }}>
              <TableRow>
                {['ID', 'Email', 'Role', 'Parent ID', 'Actions'].map(h => (
                  <TableCell key={h} sx={{ color: '#fff', fontWeight: 'bold' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(u => (
                <TableRow key={u._id} hover>
                  <TableCell>{u._id}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <TextField fullWidth size="small" value={u.role} disabled />
                  </TableCell>
                  <TableCell>
                    <TextField fullWidth size="small" value={u.parentId} disabled />
                  </TableCell>
                  <TableCell>
                    {u._id !== me.userId && (
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        onClick={() => handleDelete(u._id)}
                      >
                        Delete
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Snackbar open={snackbarOpen} onClose={handleCloseSnackbar} autoHideDuration={5000}>
        <Alert severity="error">{errorMessage}</Alert>
      </Snackbar>
      <Snackbar open={successOpen} onClose={() => setSuccessOpen(false)} autoHideDuration={3000}>
        <Alert severity="success">{successMessage}</Alert>
      </Snackbar>
    </Box>
  );
}
