// frontend/src/pages/SupervendorDashboard.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, TableContainer, Table,
  TableHead, TableBody, TableRow, TableCell,
  Select, MenuItem, Button, TextField,
  Snackbar, Alert
} from '@mui/material';
import { getUser } from '../utils/auth';
import api from '../services/api';

const primaryColor = '#43B02A';

export default function SupervendorDashboard() {
  const navigate = useNavigate();
  const me = getUser();
  const [users, setUsers] = useState([]);
  const [edits, setEdits] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Redirect non‑supervendors away
  useEffect(() => {
    if (!me || me.role !== 'supervendor') {
      navigate('/');
    }
  }, [me, navigate]);

  // Load full team: self, subvendors, and drivers
  const loadTeam = useCallback(async () => {
    try {
      const res = await api.get('/supervendor/users');
      const data = res.data.data; // [ self, subvendors..., drivers... ]
      setUsers(data);

      // Initialize edits only once
      setEdits(prev => {
        if (Object.keys(prev).length === 0) {
          const initial = {};
          data.forEach(u => {
            initial[u._id] = {
              role: u.role || '',
              parentId: u.parentId || ''
            };
          });
          return initial;
        }
        return prev;
      });
    } catch {
      setErrorMessage('Failed to load your team');
      setSnackbarOpen(true);
    }
  }, []);

  // Fetch on mount or when me.userId changes
  useEffect(() => {
    if (me?.userId) loadTeam();
  }, [me?.userId, loadTeam]);

  const handleError = msg => {
    setErrorMessage(msg);
    setSnackbarOpen(true);
  };
  const handleCloseSnackbar = () => setSnackbarOpen(false);

  const handleEditChange = (id, field, value) => {
    setEdits(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const handleUpdate = async id => {
    const { role, parentId } = edits[id] || {};
    if (!role || !parentId) {
      return handleError('Both role and parentId are required');
    }
    try {
      await api.patch(`/supervendor/users/${id}`, { role, parentId });
      setSuccessMessage('User updated successfully');
      setSuccessOpen(true);
      await loadTeam();   // refresh list and drafts
    } catch (err) {
      handleError(err.response?.data?.message || 'Update failed');
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this person?')) return;
    try {
      await api.delete(`/supervendor/users/${id}`);
      setSuccessMessage('User deleted');
      setSuccessOpen(true);
      await loadTeam();
    } catch {
      handleError('Delete failed');
    }
  };

  return (
    <Box sx={{ py:4,px: 18, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4" sx={{ color: primaryColor,fontWeight:'bold' ,fontStyle:'italic'}}>
          Supervendor Dashboard
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ overflowX: 'auto' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: primaryColor }}>
              <TableRow>
                {['ID', 'Email', 'Role', 'Parent ID', 'Actions'].map(h => (
                  <TableCell key={h} sx={{ color: '#fff', fontWeight: 'bold' }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(u => {
                const draft = edits[u._id] || { role: '', parentId: '' };
                return (
                  <TableRow key={u._id} hover>
                    <TableCell>{u._id}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Select
                        fullWidth
                        size="small"
                        value={draft.role}
                        onChange={e =>
                          handleEditChange(u._id, 'role', e.target.value)
                        }
                        disabled={u._id === me.userId}
                      >
                        {u._id===me.userId?<MenuItem value="supervendor">Super Vendor</MenuItem>:<MenuItem value="">—</MenuItem>}
                        <MenuItem value="subvendor">Sub Vendor</MenuItem>
                        <MenuItem value="driver">Driver</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        value={draft.parentId}
                        onChange={e =>
                          handleEditChange(u._id, 'parentId', e.target.value)
                        }
                        disabled={u._id === me.userId}
                      />
                    </TableCell>
                    <TableCell>
                      {u._id !== me.userId && (
                        <Button
                          variant="contained"
                          size="small"
                          sx={{
                            mr: 1,
                            backgroundColor: primaryColor,
                            '&:hover': { backgroundColor: '#36982b' }
                          }}
                          onClick={() => handleUpdate(u._id)}
                        >
                          Update
                        </Button>
                      )}
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
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Snackbar
        open={snackbarOpen}
        onClose={handleCloseSnackbar}
        autoHideDuration={5000}
      >
        <Alert severity="error">{errorMessage}</Alert>
      </Snackbar>
      <Snackbar
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        autoHideDuration={3000}
      >
        <Alert severity="success">{successMessage}</Alert>
      </Snackbar>
    </Box>
  );
}
