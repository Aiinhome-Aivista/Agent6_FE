import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Card, IconButton, CircularProgress,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { useOutletContext } from 'react-router-dom';
import RefreshIcon from '@mui/icons-material/Refresh';
import api from '../api';

export default function AuditLogs() {
    const { themeColors } = useOutletContext();
    const [auditLogs, setAuditLogs] = useState([]);
    const [auditLoading, setAuditLoading] = useState(false);
    const [refreshingAudits, setRefreshingAudits] = useState(false);

    const fetchAuditLogs = async () => {
        setAuditLoading(true);
        try {
            const r = await api.get('/auth/audit');
            setAuditLogs(r.data);
        } catch (e) {
            console.error(e);
        } finally {
            setAuditLoading(false);
        }
    };

    useEffect(() => {
        fetchAuditLogs();
    }, []);

    const handleRefreshAudits = async () => {
        setRefreshingAudits(true);
        await fetchAuditLogs();
        setRefreshingAudits(false);
    };

    return (
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: themeColors.border, bgcolor: themeColors.cardBg, color: themeColors.textPrimary, transition: 'all 0.2s ease' }}>
            <Box sx={{ p: 3, borderBottom: themeColors.border, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: themeColors.textPrimary }}>
                        System Compliance Audit Logs
                    </Typography>
                    <Typography variant="caption" sx={{ color: themeColors.textSecondary, fontWeight: 600 }}>
                        Verifiable regulatory audit and event trail across all insurance transactions.
                    </Typography>
                </Box>
                <IconButton
                    onClick={handleRefreshAudits}
                    disabled={auditLoading}
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
                            animation: refreshingAudits ? 'spin 1s linear infinite' : 'none',
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
                            {['Event ID', 'Operator', 'Action Performed', 'Associated Details', 'Timestamp'].map(h => (
                                <TableCell key={h} sx={{ fontWeight: 700, color: themeColors.tableHeadText, borderBottom: themeColors.tableCellBorder, fontSize: '0.8rem', textTransform: 'uppercase' }}>{h}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {auditLoading ? (
                            <TableRow><TableCell colSpan={5} align="center" sx={{ py: 8, borderBottom: themeColors.tableCellBorder }}><CircularProgress /></TableCell></TableRow>
                        ) : auditLogs.length === 0 ? (
                            <TableRow><TableCell colSpan={5} align="center" sx={{ py: 8, color: themeColors.textSecondary, borderBottom: themeColors.tableCellBorder }}>
                                No audit logs recorded yet.
                            </TableCell></TableRow>
                        ) : auditLogs.map(l => {
                            let parsedDetails = {};
                            try {
                                parsedDetails = typeof l.details === 'string' ? JSON.parse(l.details) : l.details || {};
                            } catch (err) {
                                console.error(err);
                            }
                            return (
                                <TableRow key={l.id} hover sx={{ '&:hover': { bgcolor: `${themeColors.tableRowHover} !important` } }}>
                                    <TableCell sx={{ fontWeight: 700, color: themeColors.textSecondary, borderBottom: themeColors.tableCellBorder }}>#{l.id}</TableCell>
                                    <TableCell sx={{ fontWeight: 800, color: themeColors.textPrimary, borderBottom: themeColors.tableCellBorder }}>{l.username}</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#FF5A14', borderBottom: themeColors.tableCellBorder }}>{l.action}</TableCell>
                                    <TableCell sx={{ color: themeColors.textSecondary, borderBottom: themeColors.tableCellBorder, fontSize: '0.8rem', fontFamily: 'monospace' }}>
                                        {Object.entries(parsedDetails).map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`).join(' · ')}
                                    </TableCell>
                                    <TableCell sx={{ color: themeColors.textSecondary, borderBottom: themeColors.tableCellBorder, fontSize: '0.85rem' }}>{new Date(l.created_at).toLocaleString()}</TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Card>
    );
}
