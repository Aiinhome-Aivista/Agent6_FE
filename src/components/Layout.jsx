// import React, { useState, useEffect } from 'react';
// import {
//     Box, Typography, AppBar, Toolbar, Drawer, List, ListItem,
//     ListItemIcon, ListItemText, Avatar, IconButton, Stack, Menu, MenuItem, Divider, Chip
// } from '@mui/material';
// import { useAuth } from '../context/AuthContext';
// import { useNavigate, useLocation, Outlet } from 'react-router-dom';
// import AssignmentIcon from '@mui/icons-material/Assignment';
// import DashboardIcon from '@mui/icons-material/Dashboard';
// import PostAddIcon from '@mui/icons-material/PostAdd';
// import PsychologyIcon from '@mui/icons-material/Psychology';
// import ShieldIcon from '@mui/icons-material/Shield';
// import LogoutIcon from '@mui/icons-material/Logout';
// import MenuIcon from '@mui/icons-material/Menu';
// import PeopleIcon from '@mui/icons-material/People';
// import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
// import LightModeIcon from '@mui/icons-material/LightMode';
// import DarkModeIcon from '@mui/icons-material/DarkMode';
// import PersonIcon from '@mui/icons-material/Person';

// const DRAWER_WIDTH = 240;

// const NAV_ITEMS = {
//     broker: [
//         { key: 'manage-application', label: 'Applications', icon: <AssignmentIcon />, path: '/manage-application' },
//     ],
//     underwriter: [
//         { key: 'case-queue', label: 'Case Queue', icon: <AssignmentIcon />, path: '/case-queue' },
//         { key: 'rulebooks', label: 'Knowledge Base', icon: <PostAddIcon />, path: '/knowledge-base' },
//         { key: 'rag-chat', label: 'RAG Chat', icon: <PsychologyIcon />, path: '/rag-chat' },
//     ],
//     admin: [
//         { key: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
//         { key: 'queue', label: 'Manage Cases', icon: <AssignmentIcon />, path: '/cases' },
//         { key: 'users', label: 'User Management', icon: <PeopleIcon />, path: '/users' },
//         { key: 'audit', label: 'Audit Logs', icon: <AdminPanelSettingsIcon />, path: '/audit' },
//         { key: 'rulebooks', label: 'Knowledge Base', icon: <PostAddIcon />, path: '/knowledge-base' },
//         { key: 'rag-chat', label: 'RAG Chat', icon: <PsychologyIcon />, path: '/rag-chat' },
//     ]
// };

// export default function Layout() {
//     const { user, logout } = useAuth();
//     const navigate = useNavigate();
//     const location = useLocation();

//     const [darkMode, setDarkMode] = useState(() => {
//         return localStorage.getItem('theme') === 'dark';
//     });

//     const toggleTheme = () => {
//         setDarkMode(prev => {
//             const next = !prev;
//             localStorage.setItem('theme', next ? 'dark' : 'light');
//             return next;
//         });
//     };

//     const themeColors = {
//         bg: darkMode ? '#0b0f19' : '#f8fafc',
//         cardBg: darkMode ? '#111827' : '#ffffff',
//         border: darkMode ? '1px solid #1f2937' : '1px solid #e2e8f0',
//         borderHex: darkMode ? '#1f2937' : '#e2e8f0',
//         textPrimary: darkMode ? '#f8fafc' : '#0f172a',
//         textSecondary: darkMode ? '#94a3b8' : '#64748b',
//         sidebarBg: darkMode ? '#111827' : '#ffffff',
//         sidebarBorder: darkMode ? '1px solid #1f2937' : '1px solid #e2e8f0',
//         sidebarHeaderBorder: darkMode ? '1px solid #1f2937' : '1px solid #f1f5f9',
//         profileBg: darkMode ? '#1f2937' : '#f8fafc',
//         profileName: darkMode ? '#f8fafc' : '#0f172a',
//         profileRole: darkMode ? '#94a3b8' : '#64748b',
//         navActiveBg: '#2563eb',
//         navActiveText: '#ffffff',
//         navHoverBg: darkMode ? '#1f2937' : '#f1f5f9',
//         navText: darkMode ? '#cbd5e1' : '#475569',
//         appBarBg: darkMode ? '#111827' : '#ffffff',
//         tableHeadBg: darkMode ? '#1f2937' : '#f8fafc',
//         tableHeadText: darkMode ? '#cbd5e1' : '#475569',
//         tableRowHover: darkMode ? '#1e293b' : '#f8fafc',
//         tableCellBorder: darkMode ? '1px solid #1f2937' : '1px solid #f1f5f9',
//     };

//     const [sidebarOpen, setSidebarOpen] = useState(true);
//     const [profileAnchorEl, setProfileAnchorEl] = useState(null);
//     const openProfileMenu = Boolean(profileAnchorEl);

//     const handleAvatarClick = (event) => setProfileAnchorEl(event.currentTarget);
//     const handleAvatarClose = () => setProfileAnchorEl(null);

//     const isBroker = user?.role_id === 5;
//     const isAdmin = user?.role_id === 1 || user?.role_id === 2;
//     const roleName = isBroker
//         ? 'Insurance Broker'
//         : user?.role_id === 1
//             ? 'Administrator'
//             : user?.role_id === 2
//                 ? 'Underwriting Manager'
//                 : 'Underwriter';

//     const navItems = isBroker
//         ? NAV_ITEMS.broker
//         : user?.role_id === 1
//             ? NAV_ITEMS.admin
//             : user?.role_id === 2
//                 ? NAV_ITEMS.admin.filter(item => item.key !== 'users') // Hide User Management for Manager
//                 : NAV_ITEMS.underwriter;

//     const currentPath = location.pathname;

//     const getHeaderTitle = () => {
//         if (isBroker) return 'Applications';
//         if (!isBroker && !isAdmin) return 'Case Queue';
//         const item = navItems.find(n => n.path === currentPath || currentPath.startsWith(n.path));
//         return item ? item.label : 'Dashboard';
//     };

//     if (!user) {
//         navigate('/login');
//         return null;
//     }

//     const drawerContent = (
//         <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: themeColors.sidebarBg, borderRight: themeColors.sidebarBorder }}>
//             <Toolbar sx={{ borderBottom: themeColors.sidebarHeaderBorder }}>
//                 <Stack direction="row" alignItems="center" spacing={1}>
//                     <ShieldIcon sx={{ color: '#2563eb' }} />
//                     {sidebarOpen && <Typography sx={{ fontWeight: 800, color: themeColors.textPrimary, fontSize: '1rem' }}>IUA Platform</Typography>}
//                 </Stack>
//             </Toolbar>
//             <Box sx={{ p: 2 }}>
//                 <List dense>
//                     {navItems.map(item => {
//                         const isActive = currentPath === item.path || currentPath.startsWith(item.path);
//                         return (
//                             <ListItem
//                                 button key={item.key}
//                                 onClick={() => navigate(item.path)}
//                                 sx={{
//                                     borderRadius: 2, mb: 0.5,
//                                     bgcolor: isActive ? themeColors.navActiveBg : 'transparent',
//                                     '&:hover': { bgcolor: themeColors.navHoverBg },
//                                     px: sidebarOpen ? 2 : 1.5,
//                                     justifyContent: sidebarOpen ? 'flex-start' : 'center',
//                                     transition: 'all 0.2s ease'
//                                 }}
//                             >
//                                 <ListItemIcon sx={{ color: isActive ? themeColors.navActiveText : themeColors.navText, minWidth: sidebarOpen ? 36 : 'auto' }}>
//                                     {item.icon}
//                                 </ListItemIcon>
//                                 {sidebarOpen && (
//                                     <ListItemText
//                                         primary={item.label}
//                                         primaryTypographyProps={{
//                                             color: isActive ? themeColors.navActiveText : themeColors.navText,
//                                             fontWeight: 700,
//                                             fontSize: '0.875rem'
//                                         }}
//                                     />
//                                 )}
//                             </ListItem>
//                         );
//                     })}
//                 </List>
//             </Box>
//             <Box sx={{ mt: 'auto', p: 2 }}>
//                 <ListItem
//                     button
//                     onClick={logout}
//                     sx={{
//                         borderRadius: 2,
//                         bgcolor: themeColors.profileBg,
//                         border: themeColors.border,
//                         color: '#ef4444',
//                         '&:hover': { bgcolor: '#fef2f2', color: '#ef4444', borderColor: '#fecaca' },
//                         justifyContent: sidebarOpen ? 'flex-start' : 'center',
//                         transition: 'all 0.2s ease'
//                     }}
//                 >
//                     <ListItemIcon sx={{ color: '#ef4444', minWidth: sidebarOpen ? 36 : 'auto' }}>
//                         <LogoutIcon />
//                     </ListItemIcon>
//                     {sidebarOpen && <ListItemText primary="Sign Out" primaryTypographyProps={{ color: 'inherit', fontWeight: 700, fontSize: '0.875rem' }} />}
//                 </ListItem>
//             </Box>
//         </Box>
//     );

//     return (
//         <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: themeColors.bg, color: themeColors.textPrimary, transition: 'all 0.25s ease' }}>
//             <AppBar position="fixed" sx={{ zIndex: 1300, bgcolor: themeColors.appBarBg, borderBottom: themeColors.border, boxShadow: 'none', color: themeColors.textPrimary, transition: 'all 0.25s ease' }}>
//                 <Toolbar>
//                     <IconButton onClick={() => setSidebarOpen(o => !o)} sx={{ mr: 2, color: themeColors.textSecondary }}>
//                         <MenuIcon />
//                     </IconButton>
//                     <Typography variant="h6" sx={{ fontWeight: 800, flexGrow: 1, color: themeColors.textPrimary }}>
//                         {getHeaderTitle()}
//                     </Typography>
//                     <IconButton onClick={toggleTheme} sx={{ mr: 2, color: darkMode ? '#fcd34d' : '#64748b', transition: 'all 0.2s ease' }} title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
//                         {darkMode ? <LightModeIcon sx={{ fontSize: 22 }} /> : <DarkModeIcon sx={{ fontSize: 22 }} />}
//                     </IconButton>
//                     <IconButton
//                         onClick={handleAvatarClick}
//                         sx={{
//                             p: 0,
//                             border: openProfileMenu ? '2px solid #2563eb' : '2px solid transparent',
//                             transition: 'all 0.2s ease'
//                         }}
//                         title="Profile & Settings"
//                     >
//                         <Avatar sx={{ bgcolor: '#2563eb', fontWeight: 800 }}>{user.username.charAt(0).toUpperCase()}</Avatar>
//                     </IconButton>
//                     <Menu
//                         anchorEl={profileAnchorEl}
//                         open={openProfileMenu}
//                         onClose={handleAvatarClose}
//                         onClick={handleAvatarClose}
//                         PaperProps={{
//                             elevation: 4,
//                             sx: {
//                                 overflow: 'visible',
//                                 filter: 'drop-shadow(0px 4px 20px rgba(0,0,0,0.1))',
//                                 mt: 1.5,
//                                 borderRadius: 3,
//                                 bgcolor: themeColors.cardBg,
//                                 border: themeColors.border,
//                                 p: 1.5,
//                                 minWidth: 200,
//                                 '& .MuiAvatar-root': {
//                                     width: 44,
//                                     height: 44,
//                                 },
//                             },
//                         }}
//                         transformOrigin={{ horizontal: 'right', vertical: 'top' }}
//                         anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
//                     >
//                         <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 200 }}>
//                             <Typography sx={{ color: themeColors.textPrimary, fontWeight: 800, fontSize: '1rem', mb: 0.5 }}>
//                                 {user?.username}
//                             </Typography>
//                             <Chip label={roleName} size="small" sx={{ bgcolor: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', fontWeight: 700, borderRadius: 1.5, mb: 1.5 }} />
//                             <Divider sx={{ width: '100%', mb: 1.5, borderColor: themeColors.borderHex }} />
//                             <MenuItem onClick={logout} sx={{ width: '100%', borderRadius: 2, color: '#ef4444', '&:hover': { bgcolor: '#fef2f2' } }}>
//                                 <ListItemIcon><LogoutIcon sx={{ color: '#ef4444', fontSize: 20 }} /></ListItemIcon>
//                                 <Typography sx={{ fontWeight: 600 }}>Sign Out</Typography>
//                             </MenuItem>
//                         </Box>
//                     </Menu>
//                 </Toolbar>
//             </AppBar>

//             <Drawer
//                 variant="permanent"
//                 sx={{
//                     width: sidebarOpen ? DRAWER_WIDTH : 72,
//                     flexShrink: 0,
//                     transition: 'all 0.25s ease',
//                     '& .MuiDrawer-paper': {
//                         width: sidebarOpen ? DRAWER_WIDTH : 72,
//                         boxSizing: 'border-box',
//                         bgcolor: themeColors.sidebarBg,
//                         borderRight: 'none',
//                         transition: 'all 0.25s ease',
//                         overflowX: 'hidden'
//                     },
//                 }}
//             >
//                 {drawerContent}
//             </Drawer>

//             <Box component="main" sx={{ flexGrow: 1, p: 4, pt: 12, bgcolor: themeColors.bg, minHeight: '100vh', transition: 'all 0.25s ease' }}>
//                 {/* Outlet renders the child routes, we pass themeColors and darkMode through context */}
//                 <Outlet context={{ darkMode, themeColors }} />
//             </Box>
//         </Box>
//     );
// }


import React, { useState, useEffect } from 'react';
import {
    Box, Typography, AppBar, Toolbar, Drawer, List, ListItem, ListItemButton,
    ListItemIcon, ListItemText, Avatar, IconButton, Stack, Menu, MenuItem, Divider, Chip
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PostAddIcon from '@mui/icons-material/PostAdd';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ShieldIcon from '@mui/icons-material/Shield';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import PeopleIcon from '@mui/icons-material/People';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';

const DRAWER_WIDTH = 240;

const NAV_ITEMS = {
    broker: [
        { key: 'manage-application', label: 'Applications', icon: <AssignmentIcon />, path: '/manage-application' },
    ],
    underwriter: [
        { key: 'case-queue', label: 'Case Queue', icon: <AssignmentIcon />, path: '/case-queue' },
        { key: 'claim-tracker', label: 'Claim Tracker', icon: <SearchIcon />, path: '/claim-tracker' },
        { key: 'rulebooks', label: 'Knowledge Base', icon: <PostAddIcon />, path: '/knowledge-base' },
        { key: 'rag-chat', label: 'RAG Chat', icon: <PsychologyIcon />, path: '/rag-chat' },
    ],
    admin: [
        { key: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { key: 'queue', label: 'Manage Cases', icon: <AssignmentIcon />, path: '/cases' },
        { key: 'claim-tracker', label: 'Claim Tracker', icon: <SearchIcon />, path: '/claim-tracker' },
        { key: 'users', label: 'User Management', icon: <PeopleIcon />, path: '/users' },
        { key: 'audit', label: 'Audit Logs', icon: <AdminPanelSettingsIcon />, path: '/audit' },
        { key: 'rulebooks', label: 'Knowledge Base', icon: <PostAddIcon />, path: '/knowledge-base' },
        { key: 'rag-chat', label: 'RAG Chat', icon: <PsychologyIcon />, path: '/rag-chat' },
    ]
};

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });

    const toggleTheme = () => {
        setDarkMode(prev => {
            const next = !prev;
            localStorage.setItem('theme', next ? 'dark' : 'light');
            return next;
        });
    };

    const themeColors = {
        bg: darkMode ? '#0b0f19' : '#f8fafc',
        cardBg: darkMode ? '#111827' : '#ffffff',
        border: darkMode ? '1px solid #1f2937' : '1px solid #e2e8f0',
        borderHex: darkMode ? '#1f2937' : '#e2e8f0',
        textPrimary: darkMode ? '#f8fafc' : '#0f172a',
        textSecondary: darkMode ? '#94a3b8' : '#64748b',
        sidebarBg: darkMode ? '#111827' : '#ffffff',
        sidebarBorder: darkMode ? '1px solid #1f2937' : '1px solid #e2e8f0',
        sidebarHeaderBorder: darkMode ? '1px solid #1f2937' : '1px solid #f1f5f9',
        profileBg: darkMode ? '#1f2937' : '#f8fafc',
        profileName: darkMode ? '#f8fafc' : '#0f172a',
        profileRole: darkMode ? '#94a3b8' : '#64748b',
        navActiveBg: '#2563eb',
        navActiveText: '#ffffff',
        navHoverBg: darkMode ? '#1f2937' : '#f1f5f9',
        navText: darkMode ? '#cbd5e1' : '#475569',
        appBarBg: darkMode ? '#111827' : '#ffffff',
        tableHeadBg: darkMode ? '#1f2937' : '#f8fafc',
        tableHeadText: darkMode ? '#cbd5e1' : '#475569',
        tableRowHover: darkMode ? '#1e293b' : '#f8fafc',
        tableCellBorder: darkMode ? '1px solid #1f2937' : '1px solid #f1f5f9',
    };

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [profileAnchorEl, setProfileAnchorEl] = useState(null);
    const openProfileMenu = Boolean(profileAnchorEl);

    const handleAvatarClick = (event) => setProfileAnchorEl(event.currentTarget);
    const handleAvatarClose = () => setProfileAnchorEl(null);

    const isBroker = user?.role_id === 5;
    const isAdmin = user?.role_id === 1 || user?.role_id === 2;
    const roleName = isBroker
        ? 'Insurance Broker'
        : user?.role_id === 1
            ? 'Administrator'
            : user?.role_id === 2
                ? 'Underwriting Manager'
                : 'Underwriter';

    const navItems = isBroker
        ? NAV_ITEMS.broker
        : user?.role_id === 1
            ? NAV_ITEMS.admin
            : user?.role_id === 2
                ? NAV_ITEMS.admin.filter(item => item.key !== 'users') // Hide User Management for Manager
                : NAV_ITEMS.underwriter;

    const currentPath = location.pathname;

    const getHeaderTitle = () => {
        if (isBroker) return 'Applications';
        const item = navItems.find(n => n.path === currentPath || currentPath.startsWith(n.path));
        if (item) return item.label;
        if (!isBroker && !isAdmin) return 'Case Queue';
        return 'Dashboard';
    };

    if (!user) {
        navigate('/login');
        return null;
    }

    const drawerContent = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: themeColors.sidebarBg, borderRight: themeColors.sidebarBorder }}>
            <Toolbar sx={{ borderBottom: themeColors.sidebarHeaderBorder }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                    <ShieldIcon sx={{ color: '#2563eb' }} />
                    {sidebarOpen && <Typography sx={{ fontWeight: 800, color: themeColors.textPrimary, fontSize: '1rem' }}>IUA Platform</Typography>}
                </Box>
            </Toolbar>
            <Box sx={{ p: 2 }}>
                <List dense>
                    {navItems.map(item => {
                        const isActive = currentPath === item.path || currentPath.startsWith(item.path);
                        return (
                            <ListItemButton
                                key={item.key}
                                onClick={() => navigate(item.path)}
                                sx={{
                                    borderRadius: 2, mb: 0.5,
                                    bgcolor: isActive ? themeColors.navActiveBg : 'transparent',
                                    '&:hover': { bgcolor: themeColors.navHoverBg },
                                    px: sidebarOpen ? 2 : 1.5,
                                    justifyContent: sidebarOpen ? 'flex-start' : 'center',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <ListItemIcon sx={{ color: isActive ? themeColors.navActiveText : themeColors.navText, minWidth: sidebarOpen ? 36 : 'auto' }}>
                                    {item.icon}
                                </ListItemIcon>
                                {sidebarOpen && (
                                    <ListItemText
                                        primary={item.label}
                                        slotProps={{
                                            primary: {
                                                sx: {
                                                    color: isActive ? themeColors.navActiveText : themeColors.navText,
                                                    fontWeight: 700,
                                                    fontSize: '0.875rem'
                                                }
                                            }
                                        }}
                                    />
                                )}
                            </ListItemButton>
                        );
                    })}
                </List>
            </Box>
            <Box sx={{ mt: 'auto', p: 2 }}>
                <ListItemButton
                    onClick={logout}
                    sx={{
                        borderRadius: 2,
                        bgcolor: themeColors.profileBg,
                        border: themeColors.border,
                        color: '#ef4444',
                        '&:hover': { bgcolor: '#fef2f2', color: '#ef4444', borderColor: '#fecaca' },
                        justifyContent: sidebarOpen ? 'flex-start' : 'center',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <ListItemIcon sx={{ color: '#ef4444', minWidth: sidebarOpen ? 36 : 'auto' }}>
                        <LogoutIcon />
                    </ListItemIcon>
                    {sidebarOpen && <ListItemText primary="Sign Out" slotProps={{ primary: { sx: { color: 'inherit', fontWeight: 700, fontSize: '0.875rem' } } }} />}
                </ListItemButton>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: themeColors.bg, color: themeColors.textPrimary, transition: 'all 0.25s ease' }}>
            <AppBar position="fixed" sx={{ zIndex: 1300, bgcolor: themeColors.appBarBg, borderBottom: themeColors.border, boxShadow: 'none', color: themeColors.textPrimary, transition: 'all 0.25s ease' }}>
                <Toolbar>
                    <IconButton onClick={() => setSidebarOpen(o => !o)} sx={{ mr: 2, color: themeColors.textSecondary }}>
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ fontWeight: 800, flexGrow: 1, color: themeColors.textPrimary }}>
                        {getHeaderTitle()}
                    </Typography>
                    <IconButton onClick={toggleTheme} sx={{ mr: 2, color: darkMode ? '#fcd34d' : '#64748b', transition: 'all 0.2s ease' }} title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
                        {darkMode ? <LightModeIcon sx={{ fontSize: 22 }} /> : <DarkModeIcon sx={{ fontSize: 22 }} />}
                    </IconButton>
                    <IconButton
                        onClick={handleAvatarClick}
                        sx={{
                            p: 0,
                            border: openProfileMenu ? '2px solid #2563eb' : '2px solid transparent',
                            transition: 'all 0.2s ease'
                        }}
                        title="Profile & Settings"
                    >
                        <Avatar sx={{ bgcolor: '#2563eb', fontWeight: 800 }}>{user.username.charAt(0).toUpperCase()}</Avatar>
                    </IconButton>
                    <Menu
                        anchorEl={profileAnchorEl}
                        open={openProfileMenu}
                        onClose={handleAvatarClose}
                        onClick={handleAvatarClose}
                        PaperProps={{
                            elevation: 4,
                            sx: {
                                overflow: 'visible',
                                filter: 'drop-shadow(0px 4px 20px rgba(0,0,0,0.1))',
                                mt: 1.5,
                                borderRadius: 3,
                                bgcolor: themeColors.cardBg,
                                border: themeColors.border,
                                p: 1.5,
                                minWidth: 200,
                                '& .MuiAvatar-root': {
                                    width: 44,
                                    height: 44,
                                },
                            },
                        }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 200 }}>
                            <Typography sx={{ color: themeColors.textPrimary, fontWeight: 800, fontSize: '1rem', mb: 0.5 }}>
                                {user?.username}
                            </Typography>
                            <Chip label={roleName} size="small" sx={{ bgcolor: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', fontWeight: 700, borderRadius: 1.5, mb: 1.5 }} />
                            <Divider sx={{ width: '100%', mb: 1.5, borderColor: themeColors.borderHex }} />
                            <MenuItem onClick={logout} sx={{ width: '100%', borderRadius: 2, color: '#ef4444', '&:hover': { bgcolor: '#fef2f2' } }}>
                                <ListItemIcon><LogoutIcon sx={{ color: '#ef4444', fontSize: 20 }} /></ListItemIcon>
                                <Typography sx={{ fontWeight: 600 }}>Sign Out</Typography>
                            </MenuItem>
                        </Box>
                    </Menu>
                </Toolbar>
            </AppBar>

            <Drawer
                variant="permanent"
                sx={{
                    width: sidebarOpen ? DRAWER_WIDTH : 72,
                    flexShrink: 0,
                    transition: 'all 0.25s ease',
                    '& .MuiDrawer-paper': {
                        width: sidebarOpen ? DRAWER_WIDTH : 72,
                        boxSizing: 'border-box',
                        bgcolor: themeColors.sidebarBg,
                        borderRight: 'none',
                        transition: 'all 0.25s ease',
                        overflowX: 'hidden'
                    },
                }}
            >
                {drawerContent}
            </Drawer>

            <Box component="main" sx={{ flexGrow: 1, p: 4, pt: 12, bgcolor: themeColors.bg, minHeight: '100vh', transition: 'all 0.25s ease' }}>
                {/* Outlet renders the child routes, we pass themeColors and darkMode through context */}
                <Outlet context={{ darkMode, themeColors }} />
            </Box>
        </Box>
    );
}