import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Select,
  MenuItem,
  Button,
  TextField,
  Snackbar,
  Alert
} from '@mui/material';
import api from '../services/api';

// import { logout } from '../utils/auth';

const primaryColor = '#43B02A';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [edits, setEdits] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    api.get('/admin/users')
      .then(res => {
        setUsers(res.data.data);
        const initial = {};
        res.data.data.forEach(u => {
          initial[u._id] = { role: u.role || '', parentId: u.parentId || '' };
        });
        setEdits(initial);
      })
      .catch(() => handleError('Failed to load users'));
  }, []);

  const handleError = (msg) => {
    setErrorMessage(msg);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleEditChange = (id, field, value) => {
    setEdits(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const handleUpdate = async (id) => {
    const { role, parentId } = edits[id] || {};
    if (!role || !parentId) return handleError('Both role and parentId are required');
    try {
      await api.patch(`/admin/users/${id}`, { role, parentId });
      // show success snackbar
      setSuccessMessage('User updated successfully');
      setSuccessOpen(true);
      const res = await api.get('/admin/users');
      setUsers(res.data.data);
      const initial = {};
      res.data.data.forEach(u => initial[u._id] = { role: u.role || '', parentId: u.parentId || '' });
      setEdits(initial);
    } catch (err) {
      handleError(err.response?.data?.message || 'Update failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u._id !== id));
    } catch {
      handleError('Delete failed');
    }
  };

  return (
    <Box sx={{ py:4,px: 18, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: primaryColor, fontWeight: 'bold',fontStyle:'italic' }}>Admin Dashboard</Typography>
        {/* <Button onClick={logout} sx={{ backgroundColor: primaryColor, color: '#fff', '&:hover': { backgroundColor: '#36982b' } }}>Logout</Button> */}
      </Box>

      <Paper elevation={3} sx={{ overflowX: 'auto' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: primaryColor }}>
              <TableRow>
                {['ID', 'Email', 'Role', 'Parent ID', 'Actions'].map(header => (
                  <TableCell key={header} sx={{ color: '#fff', fontWeight: 'bold' }}>{header}</TableCell>
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
                        value={draft.role}
                        displayEmpty
                        onChange={e => handleEditChange(u._id, 'role', e.target.value)}
                        sx={{ '& .MuiSelect-select': { py: 0.5 } }}
                        disabled={u.role==='admin'}
                      >
                        {u.role==='admin'?<MenuItem value="admin">Admin</MenuItem>:<MenuItem value="">—</MenuItem>}
                        {/* <MenuItem value="">—</MenuItem> */}
                        <MenuItem value="supervendor">Super Vendor</MenuItem>
                        <MenuItem value="subvendor">Sub Vendor</MenuItem>
                        <MenuItem value="driver">Driver</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        placeholder="parentId"
                        value={u.role==='admin'?'null':draft.parentId}
                        disabled={u.role==='admin'}
                        onChange={e => handleEditChange(u._id, 'parentId', e.target.value)}
                        sx={{ '& .MuiInputBase-input': { py: 0.5 } }}
                      />
                    </TableCell>
                    <TableCell>{u.role!=='admin'?<>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleUpdate(u._id)}
                        sx={{ mr: 1, backgroundColor: primaryColor, '&:hover': { backgroundColor: '#36982b' } }}
                      >
                        Update
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        onClick={() => handleDelete(u._id)}
                      >
                        Delete
                      </Button></>:<></>}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
      {/* Success Snackbar */}
      <Snackbar open={successOpen} autoHideDuration={4000} onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setSuccessOpen(false)} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
