import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Typography, Card, IconButton, Stack, Button, CircularProgress,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions, Tooltip
} from '@mui/material';
import { useOutletContext } from 'react-router-dom';
import RefreshIcon from '@mui/icons-material/Refresh';
import PostAddIcon from '@mui/icons-material/PostAdd';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import api from '../api';

export default function KnowledgeBase() {
    const { themeColors, darkMode } = useOutletContext();
    const [rulebooks, setRulebooks] = useState([]);
    const [rbLoading, setRbLoading] = useState(false);
    const [refreshingRulebooks, setRefreshingRulebooks] = useState(false);
    
    // Upload states
    const [rbUploading, setRbUploading] = useState(false);
    const [rbError, setRbError] = useState('');
    const [rbSuccess, setRbSuccess] = useState('');
    const [selectedRbFiles, setSelectedRbFiles] = useState([]);
    const [openRbUploadDialog, setOpenRbUploadDialog] = useState(false);
    
    // Details/GraphRAG states
    const [selectedKb, setSelectedKb] = useState(null);
    const [openKbDetailsDialog, setOpenKbDetailsDialog] = useState(false);
    const [kbDetailsLoading, setKbDetailsLoading] = useState(false);
    const visContainerRef = useRef(null);

    const fetchRulebooks = async () => {
        setRbLoading(true);
        setRbError('');
        try {
            const r = await api.get('/rulebooks/');
            setRulebooks(r.data);
        } catch (e) {
            console.error(e);
            setRbError('Failed to fetch rulebooks.');
        } finally {
            setRbLoading(false);
        }
    };

    useEffect(() => {
        fetchRulebooks();
    }, []);

    const handleRefreshRulebooks = async () => {
        setRefreshingRulebooks(true);
        await fetchRulebooks();
        setRefreshingRulebooks(false);
    };

    const handleViewKbDetails = async (id) => {
        setKbDetailsLoading(true);
        setSelectedKb(null);
        setOpenKbDetailsDialog(true);
        try {
            const res = await api.get(`/rulebooks/${id}`);
            setSelectedKb(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setKbDetailsLoading(false);
        }
    };

    // Load vis-network script and initialize network
    useEffect(() => {
        if (!window.vis) {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/vis-network/standalone/umd/vis-network.min.js';
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    useEffect(() => {
        if (openKbDetailsDialog && selectedKb && visContainerRef.current) {
            const timer = setTimeout(() => {
                if (!window.vis || !visContainerRef.current) return;

                const nodesArray = (selectedKb.entities || []).map(ent => ({
                    id: ent.id,
                    label: ent.name,
                    title: `${ent.label}: ${ent.name}`,
                    color: ent.label === 'Patient' ? '#FF5A14' :
                        ent.label === 'Disease' ? '#ef4444' :
                            ent.label === 'Medication' ? '#10b981' : '#F56B2F',
                    font: { color: darkMode ? '#ffffff' : '#000000', size: 13, bold: true }
                }));

                const edgesArray = (selectedKb.relationships || []).map(rel => ({
                    from: rel.from_node,
                    to: rel.to_node,
                    label: rel.type,
                    arrows: 'to',
                    color: { color: '#6366f1' },
                    font: { size: 10, color: darkMode ? '#cbd5e1' : '#475569', strokeWidth: 0 }
                }));

                const data = {
                    nodes: new window.vis.DataSet(nodesArray),
                    edges: new window.vis.DataSet(edgesArray)
                };

                const options = {
                    nodes: {
                        shape: 'dot',
                        size: 22,
                        shadow: { enabled: true, color: 'rgba(0,0,0,0.2)', size: 4 }
                    },
                    edges: {
                        width: 2.5,
                        shadow: { enabled: true, color: 'rgba(0,0,0,0.1)', size: 3 },
                        smooth: { type: 'dynamic', roundness: 0.5 }
                    },
                    physics: {
                        enabled: true,
                        solver: 'forceAtlas2Based',
                        forceAtlas2Based: {
                            gravitationalConstant: -70,
                            centralGravity: 0.015,
                            springConstant: 0.07,
                            springLength: 120
                        }
                    },
                    interaction: {
                        dragNodes: true,
                        zoomView: true,
                        dragView: true
                    }
                };

                new window.vis.Network(visContainerRef.current, data, options);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [openKbDetailsDialog, selectedKb, darkMode]);

    const openRbUpload = () => {
        setSelectedRbFiles([]);
        setRbError('');
        setRbSuccess('');
        setOpenRbUploadDialog(true);
    };

    const handleRbFileSelect = (e) => {
        const files = Array.from(e.target.files);
        setRbError('');
        setRbSuccess('');
        const validFiles = [];
        for (const file of files) {
            if (!file.name.toLowerCase().endsWith('.pdf')) {
                setRbError('Only PDF documents are allowed for the Knowledge Base!');
                return;
            }
            if (file.size > 25 * 1024 * 1024) {
                setRbError('Maximum file size is 25MB!');
                return;
            }
            validFiles.push(file);
        }
        setSelectedRbFiles(validFiles);
    };

    const handleRbUpload = async () => {
        if (!selectedRbFiles.length) return;
        setRbUploading(true);
        setRbError('');
        setRbSuccess('');
        const fd = new FormData();
        selectedRbFiles.forEach(f => fd.append('file', f));
        try {
            await api.post('/rulebooks/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            setRbSuccess('Document successfully processed and indexed into Knowledge Base!');
            setSelectedRbFiles([]);
            fetchRulebooks();
            setTimeout(() => {
                setOpenRbUploadDialog(false);
                setRbSuccess('');
            }, 1500);
        } catch (e) {
            const errDetail = e.response?.data?.detail;
            if (errDetail && typeof errDetail === 'object' && errDetail.error === 'RELEVANCE_TOO_LOW') {
                setRbError(
                    `Domain Relevance: ${errDetail.relevance_score}% (Required: >=${errDetail.threshold}%). ` +
                    `Category: ${errDetail.category || 'General'}. Reason: ${errDetail.reason || 'Not related to healthcare/insurance.'}`
                );
            } else {
                setRbError('Upload failed: ' + (typeof errDetail === 'string' ? errDetail : e.message));
            }
        } finally {
            setRbUploading(false);
        }
    };

    return (
        <>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: themeColors.border, bgcolor: themeColors.cardBg, color: themeColors.textPrimary, transition: 'all 0.2s ease' }}>
                <Box sx={{ p: 3, borderBottom: themeColors.border, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: themeColors.textPrimary }}>
                            Knowledge Base Documents
                        </Typography>
                        <Typography variant="caption" sx={{ color: themeColors.textSecondary, fontWeight: 600 }}>
                            AI-processed manuals with semantic knowledge graph extraction and domain relevance scoring.
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1.5 }}>
                        <IconButton
                            onClick={handleRefreshRulebooks}
                            disabled={rbLoading}
                            sx={{
                                color: '#FF5A14',
                                bgcolor: darkMode ? '#4A4A4A' : '#FFF7F2',
                                '&:hover': { bgcolor: darkMode ? '#F56B2F' : 'rgba(255, 90, 20, 0.08)' },
                                width: 32,
                                height: 32,
                                p: 0
                            }}
                        >
                            <RefreshIcon
                                sx={{
                                    fontSize: 18,
                                    animation: refreshingRulebooks ? 'spin 1s linear infinite' : 'none',
                                    '@keyframes spin': {
                                        '0%': { transform: 'rotate(0deg)' },
                                        '100%': { transform: 'rotate(360deg)' }
                                    }
                                }}
                            />
                        </IconButton>
                        <Button
                            variant="contained"
                            startIcon={<PostAddIcon />}
                            onClick={openRbUpload}
                            sx={{ fontWeight: 700, borderRadius: 2 }}
                        >
                            Add Document
                        </Button>
                    </Box>
                </Box>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: themeColors.tableHeadBg }}>
                                {['Document', 'Company', 'Product', 'Category', 'Type', 'Relevance', 'Status'].map(h => (
                                    <TableCell key={h} sx={{ fontWeight: 700, color: themeColors.tableHeadText, borderBottom: themeColors.tableCellBorder, fontSize: '0.8rem', textTransform: 'uppercase' }}>{h}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rbLoading ? (
                                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 8, borderBottom: themeColors.tableCellBorder }}><CircularProgress /></TableCell></TableRow>
                            ) : rulebooks.length === 0 ? (
                                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 8, color: themeColors.textSecondary, borderBottom: themeColors.tableCellBorder }}>
                                    No documents in Knowledge Base yet — click "Add Document" above!
                                </TableCell></TableRow>
                            ) : rulebooks.map(rb => (
                                <TableRow key={rb.id} hover sx={{ '&:hover': { bgcolor: `${themeColors.tableRowHover} !important` } }}>
                                    <TableCell 
                                        sx={{ fontWeight: 700, color: themeColors.textPrimary, borderBottom: themeColors.tableCellBorder, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                        // onClick={() => handleViewKbDetails(rb.id)}
                                    >
                                        <Tooltip title={rb.file_name} placement="top">
                                            <span>{rb.file_name}</span>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 500, color: themeColors.textSecondary, borderBottom: themeColors.tableCellBorder }}>{rb.company_name || '—'}</TableCell>
                                    <TableCell sx={{ fontWeight: 500, color: themeColors.textSecondary, borderBottom: themeColors.tableCellBorder }}>{rb.product_name || '—'}</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: themeColors.textPrimary, borderBottom: themeColors.tableCellBorder }}>
                                        <Chip
                                            label={rb.category || 'General'}
                                            size="small"
                                            variant="outlined"
                                            sx={{
                                                fontWeight: 700,
                                                fontSize: '0.65rem',
                                                color: themeColors.textPrimary,
                                                borderColor: darkMode ? '#334155' : '#e2e8f0',
                                                bgcolor: darkMode ? '#1e293b50' : '#f8fafc'
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 500, color: themeColors.textSecondary, borderBottom: themeColors.tableCellBorder }}>{rb.document_type || '—'}</TableCell>
                                    <TableCell sx={{ borderBottom: themeColors.tableCellBorder }}>
                                        {rb.relevance_score != null ? (
                                            <Chip
                                                label={`${rb.relevance_label || 'Relevant'} (${rb.relevance_score}%)`}
                                                size="small"
                                                sx={{
                                                    fontWeight: 800,
                                                    fontSize: '0.7rem',
                                                    bgcolor: rb.relevance_score >= 90 ? (darkMode ? 'rgba(255, 90, 20, 0.1)' : '#FFF7F2') :
                                                        rb.relevance_score >= 75 ? (darkMode ? 'rgba(255, 90, 20, 0.1)' : '#FFF7F2') :
                                                            (darkMode ? '#451a03' : '#fff7ed'),
                                                    color: rb.relevance_score >= 90 ? '#FF5A14' :
                                                        rb.relevance_score >= 75 ? '#FF5A14' : '#d97706',
                                                    border: `1px solid ${rb.relevance_score >= 90 ? '#FF5A14' : rb.relevance_score >= 75 ? '#FF5A14' : '#d97706'}40`
                                                }}
                                            />
                                        ) : (
                                            <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>—</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: themeColors.tableCellBorder }}>
                                        <Chip
                                            label={rb.graph_processed === 1 ? 'Processed' : 'Pending'}
                                            size="small"
                                            sx={{
                                                fontWeight: 700,
                                                fontSize: '0.7rem',
                                                bgcolor: rb.graph_processed === 1 ? (darkMode ? 'rgba(255, 90, 20, 0.1)' : '#FFF7F2') : (darkMode ? '#451a03' : '#fff7ed'),
                                                color: rb.graph_processed === 1 ? '#FF5A14' : '#d97706'
                                            }}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>

            {/* Rule Book Upload Dialog */}
            <Dialog open={openRbUploadDialog} onClose={() => !rbUploading && setOpenRbUploadDialog(false)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
                <DialogTitle sx={{ fontWeight: 800, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>Add to Knowledge Base</DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Box sx={{ border: '2px dashed #cbd5e1', borderRadius: 3, p: 3, textAlign: 'center', bgcolor: '#f8fafc', mb: 2 }}>
                        <UploadFileIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 1.5 }} />
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155', mb: 0.5 }}>Select Manual PDF</Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 1.5 }}>
                            Only PDF manuals accepted • Max size 25MB
                        </Typography>
                        <Button variant="outlined" component="label" disabled={rbUploading} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}>
                            Browse Files
                            <input type="file" hidden accept=".pdf" onChange={handleRbFileSelect} />
                        </Button>
                    </Box>
                    {rbError && (
                        <Box sx={{ p: 1.5, bgcolor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 2, mb: 2 }}>
                            <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 700, display: 'block', textAlign: 'center' }}>
                                ⚠️ {rbError}
                            </Typography>
                        </Box>
                    )}

                    {rbSuccess && (
                        <Box sx={{ p: 1.5, bgcolor: '#f0fdf4', border: '1px solid #86efac', borderRadius: 2, mb: 2 }}>
                            <Typography variant="caption" sx={{ color: '#166534', fontWeight: 700, display: 'block', textAlign: 'center' }}>
                                ✅ {rbSuccess}
                            </Typography>
                        </Box>
                    )}

                    {selectedRbFiles.length > 0 && (
                        <Box sx={{ mb: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 1 }}>
                                Selected PDF:
                            </Typography>
                            <Stack spacing={1}>
                                {selectedRbFiles.map((file, idx) => (
                                    <Box key={idx} sx={{ p: 1, bgcolor: '#f1f5f9', borderRadius: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#0f172a', maxWidth: '70%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {file.name}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                                        </Typography>
                                    </Box>
                                ))}
                            </Stack>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setOpenRbUploadDialog(false)} disabled={rbUploading} sx={{ color: '#64748b', fontWeight: 600 }}>Cancel</Button>
                    <Button onClick={handleRbUpload} variant="contained" disabled={selectedRbFiles.length === 0 || rbUploading} sx={{ fontWeight: 700, borderRadius: 2, minWidth: 100 }}>
                        {rbUploading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Process & Ingest'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Knowledge Base GraphRAG Details Dialog */}
            <Dialog open={openKbDetailsDialog} onClose={() => setOpenKbDetailsDialog(false)} maxWidth="md" fullWidth slotProps={{ paper: { sx: { borderRadius: 4, height: '85vh', bgcolor: themeColors.cardBg } } }}>
                <DialogTitle sx={{ bgcolor: themeColors.tableHeadBg, borderBottom: themeColors.border, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: themeColors.textPrimary }}>Document Knowledge Graph</Typography>
                    <Button onClick={() => setOpenKbDetailsDialog(false)} sx={{ color: themeColors.textSecondary }}>Close</Button>
                </DialogTitle>
                <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
                    {kbDetailsLoading ? (
                        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <CircularProgress />
                        </Box>
                    ) : selectedKb ? (
                        <Box sx={{ flex: 1, display: 'flex' }}>
                            <Box sx={{ flex: 0.35, borderRight: themeColors.border, p: 2, overflowY: 'auto', bgcolor: darkMode ? '#0f172a' : '#f8fafc' }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: themeColors.textPrimary, mb: 1, textTransform: 'uppercase' }}>Details</Typography>
                                <Typography variant="body2" sx={{ color: themeColors.textSecondary, mb: 0.5 }}><b>File:</b> {selectedKb.file_name}</Typography>
                                <Typography variant="body2" sx={{ color: themeColors.textSecondary, mb: 0.5 }}><b>Company:</b> {selectedKb.company_name}</Typography>
                                <Typography variant="body2" sx={{ color: themeColors.textSecondary, mb: 2 }}><b>Product:</b> {selectedKb.product_name}</Typography>

                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: themeColors.textPrimary, mb: 1, mt: 3, textTransform: 'uppercase' }}>Entities ({selectedKb.entities?.length || 0})</Typography>
                                <Stack spacing={1}>
                                    {(selectedKb.entities || []).slice(0, 15).map(e => (
                                        <Box key={e.id} sx={{ p: 1, bgcolor: themeColors.cardBg, borderRadius: 1, border: themeColors.border }}>
                                            <Typography variant="caption" sx={{ fontWeight: 800, color: '#FF5A14', display: 'block' }}>{e.label}</Typography>
                                            <Typography variant="body2" sx={{ color: themeColors.textPrimary }}>{e.name}</Typography>
                                        </Box>
                                    ))}
                                </Stack>
                            </Box>
                            <Box sx={{ flex: 0.65, position: 'relative' }}>
                                <Box ref={visContainerRef} sx={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />
                            </Box>
                        </Box>
                    ) : (
                        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Typography sx={{ color: themeColors.textSecondary }}>Failed to load document details.</Typography>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
