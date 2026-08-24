import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Card, IconButton, CircularProgress,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip
} from '@mui/material';
import { useOutletContext } from 'react-router-dom';
import RefreshIcon from '@mui/icons-material/Refresh';
import api from '../api';

export default function UserManagement() {
    const { themeColors } = useOutletContext();
    const [usersList, setUsersList] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [refreshingUsers, setRefreshingUsers] = useState(false);

    const fetchUsers = async () => {
        setUsersLoading(true);
        try {
            const r = await api.get('/auth/users');
            setUsersList(r.data);
        } catch (e) {
            console.error(e);
        } finally {
            setUsersLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRefreshUsers = async () => {
        setRefreshingUsers(true);
        await fetchUsers();
        setRefreshingUsers(false);
    };

    return (
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: themeColors.border, bgcolor: themeColors.cardBg, color: themeColors.textPrimary, transition: 'all 0.2s ease' }}>
            <Box sx={{ p: 3, borderBottom: themeColors.border, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: themeColors.textPrimary }}>
                        User Management
                    </Typography>
                    <Typography variant="caption" sx={{ color: themeColors.textSecondary, fontWeight: 600 }}>
                        Manage active system roles, credentials, and privilege scopes.
                    </Typography>
                </Box>
                <IconButton
                    onClick={handleRefreshUsers}
                    disabled={usersLoading}
                    sx={{
                        color: '#FF5A14',
                        bgcolor: '#FFF7F2',
                        '&:hover': { bgcolor: 'rgba(255, 90, 20, 0.08)' },
                        width: 32,
                        height: 32,
                        p: 0
                    }}
                >
                    <RefreshIcon
                        sx={{
                            fontSize: 18,
                            animation: refreshingUsers ? 'spin 1s linear infinite' : 'none',
                            '@keyframes spin': {
                                '0%': { transform: 'rotate(0deg)' },
                                '100%': { transform: 'rotate(360deg)' }
                            }
                        }}
                    />
                </IconButton>
            </Box>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: themeColors.tableHeadBg }}>
                            {['User ID', 'Username', 'Email Address', 'Privilege Role', 'Status', 'Date Joined'].map(h => (
                                <TableCell key={h} sx={{ fontWeight: 700, color: themeColors.tableHeadText, borderBottom: themeColors.tableCellBorder, fontSize: '0.8rem', textTransform: 'uppercase' }}>{h}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {usersLoading ? (
                            <TableRow><TableCell colSpan={6} align="center" sx={{ py: 8, borderBottom: themeColors.tableCellBorder }}><CircularProgress /></TableCell></TableRow>
                        ) : usersList.length === 0 ? (
                            <TableRow><TableCell colSpan={6} align="center" sx={{ py: 8, color: themeColors.textSecondary, borderBottom: themeColors.tableCellBorder }}>
                                No users found.
                            </TableCell></TableRow>
                        ) : usersList.map(u => (
                            <TableRow key={u.id} hover sx={{ '&:hover': { bgcolor: `${themeColors.tableRowHover} !important` } }}>
                                <TableCell sx={{ fontWeight: 700, color: themeColors.textSecondary, borderBottom: themeColors.tableCellBorder }}>#{u.id}</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: themeColors.textPrimary, borderBottom: themeColors.tableCellBorder, py: 2 }}>{u.username}</TableCell>
                                <TableCell sx={{ fontWeight: 500, color: themeColors.textSecondary, borderBottom: themeColors.tableCellBorder }}>{u.email}</TableCell>
                                <TableCell sx={{ borderBottom: themeColors.tableCellBorder }}>
                                    <Chip
                                        label={u.role.toUpperCase()}
                                        size="small"
                                        sx={{
                                            fontWeight: 700,
                                            fontSize: '0.7rem',
                                            bgcolor: u.role === 'Admin' ? '#fee2e2' : u.role === 'Manager' ? '#fef3c7' : u.role === 'Senior_Underwriter' ? '#faf5ff' : u.role === 'Underwriter' ? '#FFF7F2' : '#f0fdf4',
                                            color: u.role === 'Admin' ? '#991b1b' : u.role === 'Manager' ? '#92400e' : u.role === 'Senior_Underwriter' ? '#6b21a8' : u.role === 'Underwriter' ? '#F56B2F' : '#166534'
                                        }}
                                    />
                                </TableCell>
                                <TableCell sx={{ borderBottom: themeColors.tableCellBorder }}>
                                    <Chip
                                        label={u.is_active ? 'ACTIVE' : 'INACTIVE'}
                                        size="small"
                                        color={u.is_active ? 'success' : 'default'}
                                        sx={{ fontWeight: 800, fontSize: '0.65rem' }}
                                    />
                                </TableCell>
                                <TableCell sx={{ color: themeColors.textSecondary, borderBottom: themeColors.tableCellBorder, fontSize: '0.85rem' }}>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Card>
    );
}
