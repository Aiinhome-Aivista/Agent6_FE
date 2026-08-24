import React from 'react';
import {
    Box, Container, Typography, Button, Grid, Card, CardContent, Stack, Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ShieldIcon from '@mui/icons-material/Shield';
import HubIcon from '@mui/icons-material/Hub';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import PsychologyIcon from '@mui/icons-material/Psychology';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';
import InsightsIcon from '@mui/icons-material/Insights';
import RuleIcon from '@mui/icons-material/Rule';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StorageIcon from '@mui/icons-material/Storage';
import CloudIcon from '@mui/icons-material/Cloud';
import DataObjectIcon from '@mui/icons-material/DataObject';

const features = [
    {
        icon: <HubIcon sx={{ fontSize: 36 }} />,
        title: 'Universal Ingestion',
        desc: 'One-click integration with CRMs, Legacy databases, Document scanners, and Policy APIs.',
        color: '#FF5A14',
    },
    {
        icon: <MonitorHeartIcon sx={{ fontSize: 36 }} />,
        title: 'Deterministic Rules Engine',
        desc: 'Hard-coded underwriting boundaries for Age, BMI, Income, and Medical History metrics.',
        color: '#16a34a',
    },
    {
        icon: <PsychologyIcon sx={{ fontSize: 36 }} />,
        title: 'AI Risk Assessment',
        desc: 'NLP-powered confidence scoring and document interpretation for complex medical records.',
        color: '#FF7A45',
    },
    {
        icon: <PrivacyTipIcon sx={{ fontSize: 36 }} />,
        title: 'HIPAA & Compliance',
        desc: 'Automatic detection and anonymization of sensitive PII/PHI across every submitted application.',
        color: '#dc2626',
    },
    {
        icon: <InsightsIcon sx={{ fontSize: 36 }} />,
        title: 'Dynamic Pricing',
        desc: 'Continuous evaluation of risk profiles to calculate optimized base premiums and dynamic quotes.',
        color: '#0891b2',
    },
    {
        icon: <RuleIcon sx={{ fontSize: 36 }} />,
        title: 'Guideline RAG',
        desc: 'Plug in your underwriting manuals. Indexed and semantically searched during complex edge cases.',
        color: '#d97706',
    },
];

const connectors = [
    { label: 'Salesforce', icon: <CloudIcon /> },
    { label: 'Guidewire', icon: <StorageIcon /> },
    { label: 'AWS Textract', icon: <DataObjectIcon /> },
    { label: 'DocuSign', icon: <DataObjectIcon /> },
    { label: 'Legacy SQL', icon: <StorageIcon /> },
];

const Landing = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const goPrimary = () => {
        if (user) {
            const el = document.getElementById('features');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        } else {
            // Originally navigated to /register, now commented out and redirects to /login
            // navigate('/register');
            navigate('/login');
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', fontFamily: '"Inter", sans-serif' }}>
            {/* Top nav */}
            <div
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    backgroundColor: 'white',
                    borderBottom: '1px solid #e2e8f0',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    width: '100%'
                }}
            >
                <div
                    style={{
                        maxWidth: '1200px',
                        margin: '0 auto',
                        padding: '12px 24px',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%'
                    }}
                >
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                        <ShieldIcon sx={{ color: 'primary.main' }} />
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.25rem' } }}>
                            IUA - Intelligent Underwriting Assistant
                        </Typography>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
                        {user ? (
                            <>
                                <Typography variant="body2" sx={{ fontWeight: 600, mr: 2, color: '#475569' }}>
                                    Hi, {user.username}
                                </Typography>
                                <Button variant="outlined" color="error" onClick={logout}>
                                    Sign out
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="text" onClick={() => navigate('/login')} sx={{ fontWeight: 600 }}>
                                    Sign in
                                </Button>
                                <Button variant="contained" onClick={() => navigate('/login')} endIcon={<ArrowForwardIcon />} sx={{ fontWeight: 600 }}>
                                    Get Started
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Hero */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(124,58,237,0.08) 100%)',
                    py: { xs: 8, md: 12 },
                }}
            >
                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 6, alignItems: 'center' }}>
                        <Box sx={{ flex: 1.2 }}>
                            <Chip label="Intelligent Underwriting Assistant" color="primary" variant="outlined" sx={{ mb: 2, fontWeight: 600 }} />
                            <Typography variant="h2" sx={{ fontWeight: 800, lineHeight: 1.15, mb: 2, fontSize: { xs: 36, md: 52 }, color: '#0f172a' }}>
                                Automate your risk.<br />
                                <Box component="span" sx={{ color: 'primary.main' }}>Accelerate policy decisions.</Box>
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 400, mb: 4, maxWidth: 640, color: '#475569' }}>
                                IUA ingests applicant documents, extracts medical data via OCR, and runs deterministic checks alongside LLM reasoning.
                                You get the exact risk score, with transparent logic.
                            </Typography>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <Button
                                    variant="contained" size="large"
                                    endIcon={<ArrowForwardIcon />}
                                    onClick={goPrimary}
                                    sx={{ px: 4, py: 1.5, fontSize: 16 }}
                                >
                                    {user ? 'Explore Platform' : 'Start underwriting'}
                                </Button>
                                <Button
                                    variant="outlined" size="large"
                                    onClick={() => {
                                        const el = document.getElementById('features');
                                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    sx={{ px: 4, py: 1.5, fontSize: 16 }}
                                >
                                    Explore features
                                </Button>
                            </Stack>
                        </Box>
                        <Box sx={{ flex: 1, minWidth: { md: '400px' } }}>
                            <Card sx={{ p: 1, borderRadius: 4, boxShadow: '0 20px 60px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
                                <CardContent>
                                    <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 600 }}>Live Application Risk Score</Typography>
                                    <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline', mb: 2 }}>
                                        <Typography variant="h2" sx={{ fontWeight: 800, color: 'primary.main' }}>84.2</Typography>
                                        <Typography variant="h5" sx={{ color: '#94a3b8' }}>/100</Typography>
                                    </Stack>
                                    <Stack spacing={1.5}>
                                        {[
                                            { label: 'Medical History', val: 92, color: 'primary.main' },
                                            { label: 'Financial Stability', val: 88, color: 'primary.main' },
                                            { label: 'Lifestyle Check', val: 76, color: 'primary.main' },
                                            { label: 'Fraud Probability', val: 89, color: 'primary.main' },
                                        ].map((b) => (
                                            <Box key={b.label}>
                                                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                                                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#334155' }}>{b.label}</Typography>
                                                    <Typography variant="caption" sx={{ color: '#64748b' }}>{b.val}/100</Typography>
                                                </Stack>
                                                <Box sx={{ height: 6, bgcolor: '#f1f5f9', borderRadius: 3, mt: 0.5 }}>
                                                    <Box sx={{ height: 6, bgcolor: b.color, borderRadius: 3, width: `${b.val}%` }} />
                                                </Box>
                                            </Box>
                                        ))}
                                    </Stack>
                                    <Typography variant="caption" sx={{ display: 'block', mt: 2, color: '#64748b', textAlign: 'center' }}>
                                        Decision: Auto-Approved · Premium: Standard · 12/12 Rules Passed
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* Stats strip */}
            <Container maxWidth="lg" sx={{ py: 6 }}>
                <Grid container spacing={3}>
                    {[
                        { val: '2M+', label: 'Policies Processed' },
                        { val: '50+', label: 'Supported Integrations' },
                        { val: '15', label: 'Risk Categories' },
                        { val: '<2s', label: 'Avg Decision Time' },
                    ].map((s) => (
                        <Grid size={{ xs: 6, md: 3 }} key={s.label}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main' }}>{s.val}</Typography>
                                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, mt: 1 }}>{s.label}</Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Features */}
            <Box id="features" sx={{ py: { xs: 8, md: 10 }, bgcolor: 'white', borderTop: '1px solid #f1f5f9' }}>
                <Container maxWidth="lg">
                    <Stack sx={{ alignItems: 'center', mb: 6 }}>
                        <Chip label="Capabilities" color="primary" variant="outlined" sx={{ mb: 2, fontWeight: 600 }} />
                        <Typography variant="h3" sx={{ fontWeight: 800, textAlign: 'center', mb: 2, color: '#0f172a' }}>
                            End-to-End Underwriting Automation
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 400, textAlign: 'center', maxWidth: 720, color: '#475569' }}>
                            From document OCR to final pricing, IUA covers the entire lifecycle of an insurance application.
                        </Typography>
                    </Stack>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 4 }}>
                        {features.map((f) => (
                            <Box key={f.title}>
                                <Card sx={{ height: '100%', borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none', transition: 'all .2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' } }}>
                                    <CardContent sx={{ p: 4 }}>
                                        <Box sx={{ width: 56, height: 56, borderRadius: 2, bgcolor: `${f.color}15`, color: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                                            {f.icon}
                                        </Box>
                                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: '#0f172a' }}>{f.title}</Typography>
                                        <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.6 }}>{f.desc}</Typography>
                                    </CardContent>
                                </Card>
                            </Box>
                        ))}
                    </Box>
                </Container>
            </Box>

            {/* Connectors */}
            <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
                <Stack sx={{ alignItems: 'center', mb: 5 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 1.5, color: '#0f172a' }}>Integrate seamlessly</Typography>
                    <Typography variant="body1" sx={{ color: '#475569' }}>Works with the agency management systems you already use</Typography>
                </Stack>
                <Grid container spacing={2} sx={{ justifyContent: 'center' }}>
                    {connectors.map((c) => (
                        <Grid key={c.label}>
                            <Chip
                                icon={c.icon}
                                label={c.label}
                                sx={{
                                    px: 2, py: 3, fontSize: 16, fontWeight: 600, bgcolor: 'white', border: '1px solid #cbd5e1', color: '#334155',
                                    '& .MuiChip-icon': { color: 'primary.main' },
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                }}
                            />
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* CTA */}
            <Box sx={{ py: { xs: 8, md: 10 }, background: 'linear-gradient(135deg, #FF5A14 0%, #FF7A45 100%)' }}>
                <Container maxWidth="md">
                    <Stack spacing={4} sx={{ alignItems: 'center' }}>
                        <Typography variant="h3" sx={{ color: 'white', fontWeight: 800, textAlign: 'center' }}>
                            Ready to transform your underwriting?
                        </Typography>
                        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 400, textAlign: 'center', maxWidth: 600 }}>
                            Create an account today and process your first application in minutes.
                        </Typography>
                        <Button
                            variant="contained" size="large" color="inherit"
                            onClick={goPrimary} endIcon={<ArrowForwardIcon />}
                            sx={{ bgcolor: 'white', color: 'primary.main', px: 5, py: 2, fontSize: 18, fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: '#f8fafc', transform: 'translateY(-2px)' }, transition: 'all 0.2s' }}
                        >
                            {user ? 'Explore Platform' : 'Get Started'}
                        </Button>
                    </Stack>
                </Container>
            </Box>

            {/* Footer */}
            <Box sx={{ py: 4, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'white' }}>
                <Container maxWidth="lg">
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                            <ShieldIcon sx={{ color: 'primary.main', fontSize: 24 }} />
                            <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>
                                IUA · Intelligent Underwriting Assistant
                            </Typography>
                        </Stack>
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>
                            © {new Date().getFullYear()} IUA Enterprise. All rights reserved.
                        </Typography>
                    </Stack>
                </Container>
            </Box>
        </Box>
    );
};

export default Landing;
