import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid, CircularProgress } from '@mui/material';
import { useOutletContext } from 'react-router-dom';
import api from '../api';

export default function AdminDashboard() {
    const { themeColors } = useOutletContext();
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCases = async () => {
            try {
                const r = await api.get('/cases/');
                setCases(r.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchCases();
    }, []);

    const statsCards = [
        { label: 'Total Cases', val: cases.length, color: '#FF5A14' },
        { label: 'Pending Upload', val: cases.filter(c => c.status === 'pending').length, color: '#d97706' },
        { label: 'Under Review', val: cases.filter(c => c.status === 'under_review' || c.status === 'Underwriter Review').length, color: '#FF7A45' },
        { label: 'Approved', val: cases.filter(c => c.status === 'approved' || c.status === 'Approved').length, color: '#16a34a' },
    ];

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, color: themeColors.textPrimary }}>
                Dashboard Overview
            </Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {statsCards.map((s, i) => (
                    <Grid item xs={12} sm={6} md={3} key={i}>
                        <Card sx={{ 
                            borderRadius: 3, 
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', 
                            bgcolor: themeColors.cardBg, 
                            border: themeColors.border, 
                            borderTop: `4px solid ${s.color}`, 
                            color: themeColors.textPrimary, 
                            transition: 'all 0.2s ease' 
                        }}>
                            <CardContent>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: themeColors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 }}>
                                    {s.label}
                                </Typography>
                                <Typography variant="h3" sx={{ fontWeight: 900, color: s.color, mt: 1 }}>
                                    {s.val}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
