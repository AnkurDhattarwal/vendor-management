import { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Avatar,
  InputAdornment,
  Snackbar,
  Alert
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import api from '../services/api';
import { setToken } from '../utils/auth';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setToken(data.data.token);
      nav('/');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Login failed');
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5'
      }}
    >
      {/* Left side text */}
      <Box
        sx={{
          flex: 1,
          height: '100vh',
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography variant="h2" sx={{ color: '#43B02A', fontWeight: 1000, mb: 2,fontStyle:'italic' }}>
          moveInSync
        </Typography>
        <Typography variant="h4" sx={{ color: '#43B02A', fontWeight: 700 }}>
          Vendor Management
        </Typography>
      </Box>

      {/* Right side login form */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: 380, borderRadius: 2, textAlign: 'center' }}>
          <Avatar sx={{ m: '0 auto', bgcolor: '#43B02A' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography variant="h5" gutterBottom sx={{ mt: 2,fontWeight:'bold' }}>
            Login
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
            <TextField
              label="Email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                )
              }}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon />
                  </InputAdornment>
                )
              }}
            />
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 2, backgroundColor: '#43B02A' ,fontWeight:'bold'}}>
              Login
            </Button>
          </Box>
          <Typography sx={{ mt: 2 }}>
            <Link to="/signup" style={{ color: '#43B02A', textDecoration: 'none' }}>
              Don’t have an account? Sign up
            </Link>
          </Typography>
        </Paper>
      </Box>

      {/* Snackbar for errors */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
