import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { getUser, logout } from '../utils/auth';


export default function Navbar() {
    const user = getUser();       // { userId, role, parentId, iat, exp } or null
    const nav = useNavigate();

    const handleLogout = () => {
        logout();                   // clears token & reloads to /login
    };

    return (
        <AppBar position="static" sx={{ backgroundColor: '#43B02A' }}>
            <Toolbar>
                {/* App title/logo */}
                <Typography
                    variant="h6"
                    component={Link}
                    to="/"
                    sx={{
                        textDecoration: 'none',
                        color: 'inherit',
                        flexGrow: 1,
                        fontWeight: 1000,
                        fontStyle: 'italic'
                    }}
                >
                    moveInSync
                </Typography>

                {/* If no user: show Login & Signup */}
                {!user && (
                    <Box>
                        <Button
                            component={Link}
                            to="/login"
                            color="inherit"
                        >
                            Login
                        </Button>
                        <Button
                            component={Link}
                            to="/signup"
                            color="inherit"
                        >
                            Sign Up
                        </Button>
                    </Box>
                )}

                {/* If logged in: show Admin (if admin) & Logout */}
                {user && (
                    <Box>
                        {user.role === 'admin' && (
                            <Button
                                component={Link}
                                to="/admin"
                                color="inherit"
                                sx={{ mr: 1, fontWeight: 'bold', border: '2px solid' }}
                            >
                                Admin
                            </Button>
                        )}
                        {user.role === 'supervendor' && (
                            <Button component={Link} to="/supervendor" color="inherit" sx={{ mr: 1 , fontWeight: 'bold', border: '2px solid'}}>
                                My Team
                            </Button>
                        )}
                        {user.role === 'subvendor' && (
                            <Button component={Link} to="/subvendor" color="inherit" sx={{ mr: 1 , fontWeight: 'bold', border: '2px solid'}}>
                                My Team
                            </Button>
                        )}
                        <Button
                            onClick={handleLogout}
                            color="inherit"
                            sx={{ fontWeight: 'bold', border: '2px solid' }}
                        >
                            Logout
                        </Button>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
}
