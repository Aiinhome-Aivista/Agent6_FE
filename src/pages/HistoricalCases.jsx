import React from 'react';
import {
    Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TextField, Stack, IconButton
} from '@mui/material';
import { useOutletContext } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';

export default function HistoricalCases() {
    const { themeColors, darkMode } = useOutletContext();
    const cases = [];

    return (
        <Box sx={{ pb: 6 }}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: themeColors.border, bgcolor: themeColors.cardBg, color: themeColors.textPrimary, transition: 'all 0.2s ease' }}>
                <Box sx={{ p: 3, borderBottom: themeColors.border, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: themeColors.textPrimary }}>
                        Historical Cases
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <TextField
                            size="small"
                            placeholder="Search here..."
                            InputProps={{
                                startAdornment: (
                                    <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                                ),
                            }}
                            sx={{
                                width: 260,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                                }
                            }}
                        />
                        <IconButton
                            disabled={true}
                            sx={{
                                color: '#3b82f6',
                                bgcolor: '#eff6ff',
                                '&:hover': { bgcolor: '#dbeafe' },
                                width: 32,
                                height: 32,
                                p: 0
                            }}
                        >
                            <RefreshIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Stack>
                </Box>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: themeColors.tableHeadBg }}>
                                {['Case ID', 'Applicant', 'Policy', 'Status', 'Date'].map(h => (
                                    <TableCell key={h} sx={{ fontWeight: 700, color: themeColors.tableHeadText, borderBottom: themeColors.tableCellBorder, fontSize: '0.8rem', textTransform: 'uppercase' }}>{h}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {cases.length === 0 ? (
                                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 8, color: themeColors.textSecondary, borderBottom: themeColors.tableCellBorder }}>
                                    No results found.
                                </TableCell></TableRow>
                            ) : (
                                null
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>
        </Box>
    );
}
