import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Card, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TextField, Stack, IconButton, Chip, Select,
    MenuItem, FormControl, InputLabel, CircularProgress, Tooltip,
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Avatar,
    Divider, LinearProgress
} from '@mui/material';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import TimelineIcon from '@mui/icons-material/Timeline';
import HistoryIcon from '@mui/icons-material/History';
import PsychologyIcon from '@mui/icons-material/Psychology';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AddCommentIcon from '@mui/icons-material/AddComment';
import GavelIcon from '@mui/icons-material/Gavel';
import CreateIcon from '@mui/icons-material/Create';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import api from '../api';

const EVENT_ICON_MAP = {
    case_created: { icon: <CreateIcon fontSize="small" />, color: '#3b82f6', bg: '#eff6ff' },
    document_uploaded: { icon: <UploadFileIcon fontSize="small" />, color: '#8b5cf6', bg: '#f5f3ff' },
    risk_analyzed: { icon: <PsychologyIcon fontSize="small" />, color: '#7c3aed', bg: '#fdf4ff' },
    comment_added: { icon: <AddCommentIcon fontSize="small" />, color: '#0891b2', bg: '#ecfeff' },
    'decision_approve': { icon: <CheckCircleIcon fontSize="small" />, color: '#16a34a', bg: '#f0fdf4' },
    'decision_reject': { icon: <CancelIcon fontSize="small" />, color: '#dc2626', bg: '#fef2f2' },
    'decision_escalate': { icon: <GavelIcon fontSize="small" />, color: '#d97706', bg: '#fffbeb' },
    default: { icon: <GavelIcon fontSize="small" />, color: '#64748b', bg: '#f8fafc' },
};

function getEventStyle(eventType) {
    return EVENT_ICON_MAP[eventType] || EVENT_ICON_MAP.default;
}

function formatTs(ts) {
    if (!ts) return '—';
    const d = new Date(ts);
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function HistoricalCases() {
    const { themeColors, darkMode } = useOutletContext();
    const { user } = useAuth();
    const isBroker = user?.role_id === 5;

    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filters
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterPolicy, setFilterPolicy] = useState('');
    const [filterDateFrom, setFilterDateFrom] = useState('');
    const [filterDateTo, setFilterDateTo] = useState('');

    // Timeline modal
    const [timelineCase, setTimelineCase] = useState(null);
    const [timelineEvents, setTimelineEvents] = useState([]);
    const [timelineLoading, setTimelineLoading] = useState(false);

    const fetchCases = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (filterStatus) params.append('status', filterStatus);
            if (filterPolicy) params.append('policy_type', filterPolicy);
            if (filterDateFrom) params.append('date_from', filterDateFrom);
            if (filterDateTo) params.append('date_to', filterDateTo);
            const res = await api.get(`/cases/historical?${params.toString()}`);
            setCases(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [search, filterStatus, filterPolicy, filterDateFrom, filterDateTo]);

    useEffect(() => {
        fetchCases();
    }, []);   // initial load

    const handleSearch = () => fetchCases();

    const openTimeline = async (row) => {
        setTimelineCase(row);
        setTimelineLoading(true);
        setTimelineEvents([]);
        try {
            const res = await api.get(`/cases/${row.id}/timeline`);
            setTimelineEvents(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setTimelineLoading(false);
        }
    };

    const statusChip = (status) => {
        const color = status === 'Approved' ? 'success' : 'error';
        return <Chip label={status?.toUpperCase()} size="small" color={color} sx={{ fontWeight: 700, fontSize: '0.7rem' }} />;
    };

    const riskColor = (score) => {
        if (score == null) return '#64748b';
        if (score <= 30) return '#16a34a';
        if (score <= 60) return '#d97706';
        return '#dc2626';
    };

    return (
        <Box sx={{ pb: 6 }}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: themeColors.border, bgcolor: themeColors.cardBg, color: themeColors.textPrimary }}>

                {/* ── Header ── */}
                <Box sx={{ p: 3, borderBottom: themeColors.border }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2} sx={{ width: '100%' }}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: themeColors.textPrimary }}>
                                Historical Cases
                            </Typography>
                        </Stack>

                        <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap" sx={{ ml: 'auto' }}>
                            <Tooltip title="Refresh">
                                <IconButton onClick={fetchCases} disabled={loading}
                                    sx={{ color: '#3b82f6', bgcolor: '#eff6ff', '&:hover': { bgcolor: '#dbeafe' }, width: 34, height: 34 }}>
                                    <RefreshIcon sx={{ fontSize: 18, animation: loading ? 'spin 1s linear infinite' : 'none', '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }} />
                                </IconButton>
                            </Tooltip>

                            {/* Search */}
                            <TextField
                                size="small"
                                placeholder="Search here..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                sx={{ width: 260, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : '#f8fafc' } }}
                            />
                        </Stack>
                    </Stack>
                </Box>

                {/* ── Table ── */}
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: themeColors.tableHeadBg }}>
                                {(isBroker ? ['Case ID', 'Applicant', 'Policy', 'Assigned To', 'Status', 'Date'] : ['Case ID', 'Applicant', 'Policy', 'Status', 'Date']).map(h => (
                                    <TableCell key={h} sx={{ fontWeight: 700, color: themeColors.tableHeadText, borderBottom: themeColors.tableCellBorder, fontSize: '0.78rem', textTransform: 'uppercase' }}>{h}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={isBroker ? 7 : 6} align="center" sx={{ py: 8 }}><CircularProgress /></TableCell></TableRow>
                            ) : cases.length === 0 ? (
                                <TableRow><TableCell colSpan={isBroker ? 7 : 6} align="center" sx={{ py: 8, color: themeColors.textSecondary }}>
                                    No historical cases found. Try adjusting your filters.
                                </TableCell></TableRow>
                            ) : cases.map(row => (
                                <TableRow key={row.id} hover sx={{ '&:hover': { bgcolor: `${themeColors.tableRowHover} !important` } }}>
                                    <TableCell sx={{ fontWeight: 700, color: '#2563eb', fontFamily: 'monospace', borderBottom: themeColors.tableCellBorder, fontSize: '0.8rem' }}>{row.case_number}</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: themeColors.textPrimary, borderBottom: themeColors.tableCellBorder }}>{row.applicant_name}</TableCell>
                                    <TableCell sx={{ color: themeColors.textSecondary, borderBottom: themeColors.tableCellBorder, fontSize: '0.85rem' }}>{row.policy_type}</TableCell>
                                    {isBroker && (
                                        <TableCell sx={{ color: themeColors.textSecondary, borderBottom: themeColors.tableCellBorder, fontSize: '0.82rem' }}>{row.assigned_user || 'Pending Assignment'}</TableCell>
                                    )}
                                    <TableCell sx={{ borderBottom: themeColors.tableCellBorder }}>{statusChip(row.status)}</TableCell>
                                    <TableCell sx={{ color: themeColors.textSecondary, borderBottom: themeColors.tableCellBorder, fontSize: '0.82rem' }}>
                                        {new Date(row.created_at).toLocaleDateString('en-IN')}
                                    </TableCell>
                                    {/* <TableCell sx={{ borderBottom: themeColors.tableCellBorder }}>
                                        <Tooltip title="View Case Timeline">
                                            <IconButton size="small" onClick={() => openTimeline(row)}
                                                sx={{ bgcolor: '#eff6ff', border: '1px solid #bfdbfe', color: '#3b82f6', '&:hover': { bgcolor: '#dbeafe' } }}>
                                                <TimelineIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell> */}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>

            {/* ── Timeline Modal ── */}
            <Dialog open={Boolean(timelineCase)} onClose={() => setTimelineCase(null)} maxWidth="md" fullWidth
                PaperProps={{ sx: { borderRadius: 4, boxShadow: '0 25px 60px -15px rgba(0,0,0,0.2)' } }}>
                {timelineCase && (
                    <>
                        <DialogTitle sx={{ bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0', pb: 2 }}>
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                                <TimelineIcon sx={{ color: '#3b82f6', fontSize: 28 }} />
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                        Case Timeline — <Box component="span" sx={{ color: '#2563eb', fontFamily: 'monospace' }}>{timelineCase.case_number}</Box>
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {timelineCase.applicant_name} · {timelineCase.policy_type}
                                    </Typography>
                                </Box>
                                <Box sx={{ ml: 'auto' }}>{statusChip(timelineCase.status)}</Box>
                            </Stack>
                        </DialogTitle>

                        <DialogContent sx={{ p: 4 }}>
                            {timelineLoading ? (
                                <Box sx={{ py: 8, textAlign: 'center' }}><CircularProgress /><Typography sx={{ mt: 2, color: '#64748b' }}>Loading timeline...</Typography></Box>
                            ) : timelineEvents.length === 0 ? (
                                <Typography sx={{ color: '#94a3b8', textAlign: 'center', py: 6 }}>No timeline events found.</Typography>
                            ) : (
                                <Box sx={{ position: 'relative', pl: 3 }}>
                                    {/* Vertical line */}
                                    <Box sx={{ position: 'absolute', left: 19, top: 20, bottom: 20, width: 2, bgcolor: '#e2e8f0', borderRadius: 1 }} />

                                    <Stack spacing={0}>
                                        {timelineEvents.map((evt, idx) => {
                                            const style = getEventStyle(evt.event_type);
                                            const isLast = idx === timelineEvents.length - 1;
                                            return (
                                                <Box key={idx} sx={{ display: 'flex', gap: 2, pb: isLast ? 0 : 3, position: 'relative' }}>
                                                    {/* Icon circle */}
                                                    <Avatar sx={{ width: 36, height: 36, bgcolor: style.bg, border: `2px solid ${style.color}`, color: style.color, flexShrink: 0, zIndex: 1 }}>
                                                        {style.icon}
                                                    </Avatar>

                                                    {/* Content */}
                                                    <Box sx={{ flex: 1, pt: 0.5, pb: 1, px: 2, bgcolor: darkMode ? '#1e293b' : '#f8fafc', borderRadius: 2, border: '1px solid', borderColor: darkMode ? '#334155' : '#e2e8f0' }}>
                                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1}>
                                                            <Box>
                                                                <Typography sx={{ fontWeight: 800, color: style.color, fontSize: '0.9rem' }}>{evt.title}</Typography>
                                                                {evt.description && (
                                                                    <Typography variant="body2" sx={{ color: darkMode ? '#94a3b8' : '#475569', mt: 0.3, lineHeight: 1.5, wordBreak: 'break-word' }}>
                                                                        {evt.description}
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                            <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                                                                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block', fontSize: '0.72rem' }}>
                                                                    {formatTs(evt.timestamp)}
                                                                </Typography>
                                                                <Chip label={`${evt.actor} · ${evt.actor_role}`} size="small"
                                                                    sx={{ mt: 0.5, bgcolor: style.bg, color: style.color, fontWeight: 700, fontSize: '0.65rem', height: 20 }} />
                                                            </Box>
                                                        </Stack>
                                                    </Box>
                                                </Box>
                                            );
                                        })}
                                    </Stack>
                                </Box>
                            )}
                        </DialogContent>

                        <DialogActions sx={{ px: 4, pb: 3, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                            {/* Show rejection reason if rejected */}
                            {timelineCase.status === 'Rejected' && timelineCase.rejection_reason && (
                                <Box sx={{ flex: 1, p: 1.5, bgcolor: '#fef2f2', borderRadius: 2, border: '1px solid #fca5a5' }}>
                                    <Typography variant="caption" sx={{ color: '#991b1b', fontWeight: 700 }}>
                                        Rejection Reason: {timelineCase.rejection_reason}
                                    </Typography>
                                </Box>
                            )}
                            <Button onClick={() => setTimelineCase(null)} variant="contained" sx={{ fontWeight: 700, borderRadius: 2, ml: 'auto' }}>Close</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
}
