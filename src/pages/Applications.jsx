import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Card, CardContent, Grid, Stack, Button, Chip,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    CircularProgress, IconButton, Divider, LinearProgress, Stepper, Step, StepLabel,
    Accordion, AccordionSummary, AccordionDetails, Tooltip,
    Snackbar, Alert, Autocomplete, Paper
} from '@mui/material';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PostAddIcon from '@mui/icons-material/PostAdd';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import AddCommentIcon from '@mui/icons-material/AddComment';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Badge from '@mui/material/Badge';
import PsychologyIcon from '@mui/icons-material/Psychology';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DescriptionIcon from '@mui/icons-material/Description';
import api from '../api';

const resolveCitationToFile = (citationStr, uploadedDocs) => {
    if (!uploadedDocs || uploadedDocs.length === 0) return citationStr;
    const lowerCitation = citationStr.toLowerCase();
    
    let bestMatch = null;
    let maxMatches = 0;
    
    uploadedDocs.forEach(d => {
        const lowerName = d.file_name.toLowerCase();
        if (lowerName.includes(lowerCitation) || lowerCitation.includes(lowerName.replace('.pdf', ''))) {
            bestMatch = d.file_name;
            maxMatches = 999;
        } else {
            const words = lowerCitation.split(/\s+/).filter(w => w.length > 3);
            let matches = 0;
            words.forEach(w => {
                if (lowerName.includes(w)) matches++;
            });
            if (matches > maxMatches) {
                maxMatches = matches;
                bestMatch = d.file_name;
            }
        }
    });
    if (bestMatch && maxMatches > 0) return bestMatch;

    if (lowerCitation.includes('medical') || lowerCitation.includes('hospital')) {
         const m = uploadedDocs.find(d => d.file_name.toLowerCase().includes('medical') || d.file_name.toLowerCase().includes('hospital'));
         if (m) return m.file_name;
    }
    if (lowerCitation.includes('bank') || lowerCitation.includes('financial') || lowerCitation.includes('statement')) {
         const m = uploadedDocs.find(d => d.file_name.toLowerCase().includes('bank') || d.file_name.toLowerCase().includes('statement') || d.file_name.toLowerCase().includes('invoice'));
         if (m) return m.file_name;
    }
    if (lowerCitation.includes('policy') || lowerCitation.includes('insurance') || lowerCitation.includes('document')) {
         const m = uploadedDocs.find(d => d.file_name.toLowerCase().includes('policy') || d.file_name.toLowerCase().includes('document') || d.file_name.toLowerCase().includes('aadhaar'));
         if (m) return m.file_name;
    }
    if (lowerCitation.includes('identity') || lowerCitation.includes('aadhaar') || lowerCitation.includes('pan') || lowerCitation.includes('kyc')) {
         const m = uploadedDocs.find(d => d.file_name.toLowerCase().includes('aadhaar') || d.file_name.toLowerCase().includes('pan'));
         if (m) return m.file_name;
    }
    return citationStr;
};

export default function Applications() {
    const { user } = useAuth();
    const { themeColors, darkMode } = useOutletContext();
    
    const isBroker = user?.role_id === 5;
    const isAdmin = user?.role_id === 1 || user?.role_id === 2;

    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshingCases, setRefreshingCases] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [openNotification, setOpenNotification] = useState(false);

    // New / Edit Case states
    const [openNewCase, setOpenNewCase] = useState(false);
    const [applicantName, setApplicantName] = useState('');
    const [policyType, setPolicyType] = useState('Health Insurance');
    const [applicationType, setApplicationType] = useState('New Policy');
    const [productType, setProductType] = useState('Standard');
    const [claimType, setClaimType] = useState('Hospitalization');
    const [existingPolicyDetails, setExistingPolicyDetails] = useState('');
    const [requestedCoverage, setRequestedCoverage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [editCaseId, setEditCaseId] = useState(null);
    const [viewMode, setViewMode] = useState(false);
    const [existingDocs, setExistingDocs] = useState([]);

    // File Upload States
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploadError, setUploadError] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [uploadResult, setUploadResult] = useState(null);
    const [openResultDialog, setOpenResultDialog] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [openUploadDialog, setOpenUploadDialog] = useState(false);
    const [uploadCaseId, setUploadCaseId] = useState(null);

    // Review & Decision States
    const [selectedCase, setSelectedCase] = useState(null);
    const [riskData, setRiskData] = useState(null);
    const [riskLoading, setRiskLoading] = useState(false);
    const [decisionLoading, setDecisionLoading] = useState(false);
    const [decisionRemarks, setDecisionRemarks] = useState('');

    // Context States
    const [apiKey, setApiKey] = useState('');
    const [patientId, setPatientId] = useState('');
    const [fetchingApi, setFetchingApi] = useState(false);
    
    // Missing Docs States
    const [missingDocsDialog, setMissingDocsDialog] = useState(false);
    const [missingDocsList, setMissingDocsList] = useState([]);

    // Enhanced Decision States
    const [openReferModal, setOpenReferModal] = useState(false);
    const [referralTargets, setReferralTargets] = useState([]);
    const [selectedReferUser, setSelectedReferUser] = useState('');
    const [openRejectModal, setOpenRejectModal] = useState(false);
    const [rejectionReasonType, setRejectionReasonType] = useState('predefined');
    const [selectedPredefinedReason, setSelectedPredefinedReason] = useState('');
    const [rejectCustomReason, setRejectCustomReason] = useState('');
    const [rejectDoc, setRejectDoc] = useState(null);

    // Add Comment States
    const [openAddComment, setOpenAddComment] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [commentingCase, setCommentingCase] = useState(null);

    const handleAddCommentClick = (row) => {
        setCommentingCase(row);
        setCommentText('');
        setOpenAddComment(true);
    };

    const handleSubmitComment = async () => {
        if (!commentText.trim() || !commentingCase) return;
        setDecisionLoading(true);
        try {
            await api.post(`/cases/${commentingCase.id}/decision`, {
                decision: 'request_document', // Reuses status to notify broker and request info
                remarks: commentText
            });
            setOpenAddComment(false);
            setCommentingCase(null);
            fetchCases();
        } catch (e) { alert('Failed to send comment.'); }
        finally { setDecisionLoading(false); }
    };

    const fetchCases = async (showTableLoader = true) => {
        if (showTableLoader) setLoading(true);
        try { const r = await api.get('/cases/'); setCases(r.data); }
        catch (e) { console.error(e); }
        finally { if (showTableLoader) setLoading(false); }
    };

    useEffect(() => {
        fetchCases(true);
    }, []);

    const handleRefreshCases = async () => {
        setRefreshingCases(true);
        await fetchCases(false);
        setRefreshingCases(false);
    };

    const executeCaseSave = async (skipCheck = false) => {
        setSubmitting(true);
        try {
            if (!skipCheck && selectedFiles.length > 0) {
                const checkFd = new FormData();
                selectedFiles.forEach(f => checkFd.append('files', f));
                checkFd.append('application_type', applicationType);
                const checkRes = await api.post('/cases/check_documents', checkFd, { headers: { 'Content-Type': 'multipart/form-data' } });
                let missing = checkRes.data.missing || [];
                if (existingDocs && existingDocs.length > 0) {
                    missing = missing.filter(missingDoc => {
                        const mLower = missingDoc.toLowerCase();
                        return !existingDocs.some(ed => {
                            const edName = (ed.file_name || '').toLowerCase();
                            return edName.includes(mLower) || 
                                   (mLower.includes('identity') && (edName.includes('identity') || edName.includes('aadhaar') || edName.includes('pan'))) ||
                                   (mLower.includes('medical') && edName.includes('medical')) ||
                                   (mLower.includes('bank') && edName.includes('bank')) ||
                                   (mLower.includes('policy') && edName.includes('policy')) ||
                                   (mLower.includes('claim form') && edName.includes('claim')) ||
                                   (mLower.includes('hospital') && edName.includes('hospital')) ||
                                   (mLower.includes('discharge') && edName.includes('discharge')) ||
                                   (mLower.includes('previous claim history') && edName.includes('history'));
                        });
                    });
                }

                if (missing.length > 0) {
                    setMissingDocsList(missing);
                    setMissingDocsDialog(true);
                    setSubmitting(false);
                    return;
                }
            }

            let targetCaseId = editCaseId;
            if (editCaseId) {
                await api.put(`/cases/${editCaseId}`, {
                    applicant_name: applicantName,
                    policy_type: policyType,
                    application_type: applicationType,
                    product_type: productType,
                    existing_policy_details: existingPolicyDetails || null,
                    requested_coverage: requestedCoverage ? Number(requestedCoverage) : null
                });
            } else {
                const res = await api.post('/cases/', {
                    applicant_name: applicantName,
                    policy_type: policyType,
                    application_type: applicationType,
                    product_type: productType,
                    existing_policy_details: existingPolicyDetails || null,
                    requested_coverage: requestedCoverage ? Number(requestedCoverage) : null
                });
                targetCaseId = res.data.case_id;
            }

            if (selectedFiles.length > 0) {
                setUploadError('');
                const fd = new FormData();
                selectedFiles.forEach(f => fd.append('files', f));
                const upRes = await api.post(`/cases/${targetCaseId}/upload`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                setUploadResult(upRes.data);
                setOpenNewCase(false);
                setOpenResultDialog(true);
            } else {
                setOpenNewCase(false);
            }

            setApplicantName('');
            setPolicyType('Health Insurance');
            setApplicationType('New Policy');
            setProductType('Standard');
            setExistingPolicyDetails('');
            setRequestedCoverage('');
            setSelectedFiles([]);
            fetchCases();
        } catch (e) { alert('Failed to save case. ' + (e.response?.data?.detail || e.message)); }
        finally { setSubmitting(false); }
    };

    const handleCreateCase = () => executeCaseSave(false);

    const openEditCase = async (row, isViewMode = false) => {
        setApplicantName(row.applicant_name);
        setPolicyType(row.policy_type || 'Health Insurance');
        setApplicationType(row.application_type || 'Existing Claim');
        setProductType(row.product_type || 'Standard');
        setExistingPolicyDetails(row.existing_policy_details || '');
        setRequestedCoverage(row.requested_coverage || '');
        setEditCaseId(row.id);
        setViewMode(isViewMode);
        setExistingDocs([]);
        setSelectedFiles([]);
        setUploadError('');
        setOpenNewCase(true);
        try {
            const res = await api.get(`/cases/${row.id}/documents`);
            setExistingDocs(res.data);
        } catch (e) { console.error(e); }
    };

    const handleNewApplicationClick = () => {
        setEditCaseId(null);
        setViewMode(false);
        setApplicantName('');
        setPolicyType('Health Insurance');
        setApplicationType('New Policy');
        setProductType('Standard');
        setExistingPolicyDetails('');
        setRequestedCoverage('');
        setSelectedFiles([]);
        setExistingDocs([]);
        setOpenNewCase(true);
    };

    const handleDeleteDoc = async (docId) => {
        if (!window.confirm('Are you sure you want to delete this document?')) return;
        try {
            await api.delete(`/cases/${editCaseId}/documents/${docId}`);
            setExistingDocs(prev => prev.filter(d => d.id !== docId));
        } catch (e) {
            console.error('Error deleting document:', e);
            alert('Failed to delete document');
        }
    };

    const handleCustomFileSelect = (e) => {
        const files = Array.from(e.target.files);
        setUploadError('');
        const validFiles = [];
        for (const file of files) {
            if (!file.name.toLowerCase().endsWith('.pdf')) {
                setUploadError('Only PDF files are allowed!');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setUploadError('Maximum file size is 5MB!');
                return;
            }
            validFiles.push(file);
        }
        setSelectedFiles(prev => {
            const newFiles = validFiles.filter(vf => !prev.some(pf => pf.name === vf.name));
            return [...prev, ...newFiles];
        });
    };

    const removeSelectedFile = (fileName) => {
        setSelectedFiles(prev => prev.filter(f => f.name !== fileName));
    };

    const handleCustomUploadProcess = async () => {
        if (!selectedFiles.length || !uploadCaseId) return;
        setUploading(true);
        setUploadError('');
        const fd = new FormData();
        selectedFiles.forEach(f => fd.append('files', f));
        try {
            const res = await api.post(`/cases/${uploadCaseId}/upload`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            setUploadResult(res.data);
            setOpenUploadDialog(false);
            setOpenResultDialog(true);
            fetchCases();
        } catch (e) {
            setUploadError('Upload Failed: ' + (e.response?.data?.detail || e.message));
        } finally {
            setUploading(false);
        }
    };

    const openReview = async (row) => {
        setSelectedCase(row); setRiskData(null); setRiskLoading(true); setDecisionRemarks('');
        try { const r = await api.get(`/cases/${row.id}/risk`); setRiskData(r.data); }
        catch { setRiskData(null); }
        finally { setRiskLoading(false); }
    };

    const fetchReferralTargets = async () => {
        try {
            const res = await api.get('/auth/referral-targets');
            setReferralTargets(res.data);
        } catch (e) {
            console.error('Failed to fetch referral targets:', e);
        }
    };

    const handleDecision = async (decision) => {
        if (!selectedCase) return;
        if (decision === 'approve') {
            setDecisionLoading(true);
            try {
                await api.post(`/cases/${selectedCase.id}/decision`, { decision, remarks: 'Underwriter: approve' });
                setSelectedCase(null); fetchCases();
            } catch (e) { alert('Decision failed.'); }
            finally { setDecisionLoading(false); }
        } else if (decision === 'reject') {
            setOpenRejectModal(true);
        } else if (decision === 'escalate') {
            fetchReferralTargets();
            setOpenReferModal(true);
        }
    };

    const handleReferSubmit = async () => {
        if (!selectedCase || !selectedReferUser) return;
        setDecisionLoading(true);
        try {
            await api.post(`/cases/${selectedCase.id}/decision`, { 
                decision: 'escalate', 
                remarks: decisionRemarks || '',
                referred_to_user_id: selectedReferUser 
            });
            setOpenReferModal(false);
            setSelectedCase(null); 
            fetchCases();
        } catch (e) { alert('Refer failed.'); }
        finally { setDecisionLoading(false); }
    };

    const handleRejectSubmit = async () => {
        if (!selectedCase) return;
        const finalReason = rejectCustomReason;
        if (!finalReason || !rejectDoc) {
            alert('Rejection Reason and Supporting Document are mandatory for rejection.');
            return;
        }
        setDecisionLoading(true);
        try {
            const payload = { 
                decision: 'reject', 
                remarks: finalReason,
                rejection_reason: finalReason
            };
            await api.post(`/cases/${selectedCase.id}/decision`, payload);
            setOpenRejectModal(false);
            setSelectedCase(null); 
            fetchCases();
        } catch (e) { alert('Reject failed.'); }
        finally { setDecisionLoading(false); }
    };

    const handleAddContextSubmit = async () => {
        if (!contextText.trim() || !selectedCase) return;
        setAddingContext(true);
        try {
            await api.post(`/cases/${selectedCase.id}/add_context`, { text: contextText });
            setContextText('');
            setOpenAddContext(false);
            
            // Refresh risk data
            setRiskLoading(true);
            const r = await api.get(`/cases/${selectedCase.id}/risk`);
            setRiskData(r.data);
            fetchCases(); 
        } catch (e) {
            alert('Failed to add context.');
        } finally {
            setRiskLoading(false);
            setAddingContext(false);
        }
    };

    const handleFetchApiSubmit = async () => {
        if (!patientId.trim() || !selectedCase) return;
        setFetchingApi(true);
        try {
            await api.post(`/cases/${selectedCase.id}/enrich_context`, { 
                api_key: apiKey, 
                patient_id: patientId 
            });
            setOpenFetchApi(false);
            setPatientId('');
            setRiskLoading(true);
            const r = await api.get(`/cases/${selectedCase.id}/risk`);
            setRiskData(r.data);
            fetchCases(); 
        } catch (e) {
            alert('Failed to enrich context from external API.');
        } finally {
            setRiskLoading(false);
            setFetchingApi(false);
        }
    };

    const filteredCases = cases.filter(c => 
        (c.case_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.applicant_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.policy_type || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
const notifications = cases.filter(
    c => c.underwriter_remarks
);

    const currentCaseForStepper = editCaseId ? cases.find(c => c.id === editCaseId) : null;
    const isEscalatedForStepper = currentCaseForStepper && (
        (currentCaseForStepper.current_role_id && currentCaseForStepper.current_role_id < 4) || 
        currentCaseForStepper.status?.toUpperCase() === 'REFERRED' ||
        (!isBroker && currentCaseForStepper.current_role_id && user?.role_id > currentCaseForStepper.current_role_id)
    );

    const steps = ['SUBMITTED', 'REVIEW PROCESS', 'FINAL DECISION'];
    const activeStep = (() => {
        if (!currentCaseForStepper) return 0;
        const status = currentCaseForStepper.status;
        if (status === 'Approved' || status === 'Rejected') {
            return 2;
        } else if (isEscalatedForStepper || status === 'Underwriter Review' || status === 'Pending Additional Documents') {
            return 1;
        }
        return 0;
    })();

    const getDynamicStepLabel = (stepKey) => {
        if (stepKey === 'REVIEW PROCESS') {
            if (isEscalatedForStepper) return 'ESCALATED';
            if (currentCaseForStepper?.status === 'Underwriter Review' || currentCaseForStepper?.status === 'Pending Additional Documents') return 'UNDERWRITER REVIEW';
            return 'REVIEW PROCESS';
        } else if (stepKey === 'FINAL DECISION') {
            if (currentCaseForStepper?.status === 'Approved') return 'APPROVED';
            if (currentCaseForStepper?.status === 'Rejected') return 'REJECTED';
            return 'FINAL DECISION';
        }
        return stepKey;
    };

    return (
        <Box sx={{ pb: 6 }}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: themeColors.border, bgcolor: themeColors.cardBg, color: themeColors.textPrimary, transition: 'all 0.2s ease' }}>
                <Box sx={{ p: 3, borderBottom: themeColors.border, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: themeColors.textPrimary }}>
                        {isBroker
                            ? 'My Applications'
                            : (isAdmin ? 'Manage Cases' : 'Case Queue')}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <TextField
                            size="small"
                            placeholder="Search here..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
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
                            onClick={handleRefreshCases}
                            disabled={loading}
                            sx={{
                                color: '#3b82f6',
                                bgcolor: '#eff6ff',
                                '&:hover': { bgcolor: '#dbeafe' },
                                width: 32,
                                height: 32,
                                p: 0
                            }}
                        >
                            <RefreshIcon
                                sx={{
                                    fontSize: 18,
                                    animation: refreshingCases ? 'spin 1s linear infinite' : 'none',
                                    '@keyframes spin': {
                                        '0%': { transform: 'rotate(0deg)' },
                                        '100%': { transform: 'rotate(360deg)' }
                                    }
                                }}
                            />
                        </IconButton>
                         {/* Notification Bell */}
    <Badge
        badgeContent={notifications.length}
        color="error"
    >
        <IconButton
            onClick={() => setOpenNotification(true)}
            sx={{
                color: '#2563eb',
                bgcolor: '#eff6ff',
                border: '1px solid #bfdbfe',
                '&:hover': { bgcolor: '#dbeafe' }
            }}
        >
            <NotificationsIcon />
        </IconButton>
    </Badge>
                        {isBroker && (
                            <Button variant="contained" startIcon={<PostAddIcon />} onClick={handleNewApplicationClick}
                                sx={{ fontWeight: 700, borderRadius: 2 }}>
                                New Application
                            </Button>
                        )}
                    </Stack>
                </Box>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: themeColors.tableHeadBg }}>
                                {(isBroker ? ['Case ID', 'Applicant', 'Policy', 'Assigned To', 'Status', 'Date', 'Actions'] : ['Case ID', 'Applicant', 'Policy', 'Status', 'Date', 'Actions']).map(h => (
                                    <TableCell key={h} sx={{ fontWeight: 700, color: themeColors.tableHeadText, borderBottom: themeColors.tableCellBorder, fontSize: '0.8rem', textTransform: 'uppercase' }}>{h}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 8, borderBottom: themeColors.tableCellBorder }}><CircularProgress /></TableCell></TableRow>
                                            ) : filteredCases.length === 0 ? (
                                                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 8, color: themeColors.textSecondary, borderBottom: themeColors.tableCellBorder }}>
                                                    {searchQuery ? 'No cases match your search query.' : (isBroker ? 'No cases yet — click "New Application" above!' : 'Queue is empty.')}
                                                </TableCell></TableRow>
                            ) : filteredCases.map(row => (
                                <TableRow key={row.id} hover sx={{ '&:hover': { bgcolor: `${themeColors.tableRowHover} !important` } }}>
                                    <TableCell sx={{ fontWeight: 700, color: '#2563eb', borderBottom: themeColors.tableCellBorder, fontFamily: 'monospace' }}>{row.case_number}</TableCell>
                                    <TableCell sx={{ fontWeight: 800, color: themeColors.textPrimary, borderBottom: themeColors.tableCellBorder }}>{row.applicant_name}</TableCell>
                                    <TableCell sx={{ color: themeColors.textSecondary, borderBottom: themeColors.tableCellBorder }}>{row.policy_type}</TableCell>
                                    {isBroker && (
                                        <TableCell sx={{ color: themeColors.textSecondary, borderBottom: themeColors.tableCellBorder, fontWeight: 500 }}>
                                            {row.assigned_user ? row.assigned_user : 'Pending Assignment'}
                                        </TableCell>
                                    )}
                                    <TableCell sx={{ borderBottom: themeColors.tableCellBorder }}>
                                        {(() => {
                                            const isEscalatedPastUser = !isBroker && row.current_role_id && user?.role_id > row.current_role_id;
                                            const isReferredStatus = row.status === 'Referred' || row.status === 'REFERRED';
                                            const isEscalatedGlobal = row.current_role_id && row.current_role_id < 4;
                                            const displayStatus = (isEscalatedPastUser || isReferredStatus || isEscalatedGlobal) ? 'ESCALATED' : row.status.replace('_', ' ').toUpperCase();
                                            const chipColor = (isEscalatedPastUser || isReferredStatus || isEscalatedGlobal) ? 'error' : (row.status === 'Pending' || row.status === 'Pending Additional Documents' ? 'warning' : row.status === 'Underwriter Review' ? 'info' : row.status === 'Approved' ? 'success' : row.status === 'Rejected' ? 'error' : 'default');
                                            return (
                                                <Chip
                                                    label={displayStatus} size="small"
                                                    color={chipColor}
                                                    sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                                                />
                                            );
                                        })()}
                                    </TableCell>
                                    {/* {!isBroker && (
                                        <TableCell sx={{ borderBottom: themeColors.tableCellBorder }}>
                                            {(() => {
                                                if (!row.sla_due_at) return '-';
                                                const due = new Date(row.sla_due_at);
                                                const now = new Date();
                                                due.setHours(0, 0, 0, 0);
                                                now.setHours(0, 0, 0, 0);
                                                const diffMs = due - now;
                                                const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
                                                if (diffDays < 0) return <Typography sx={{color: '#ef4444', fontWeight: 700, fontSize: '0.8rem'}}>Overdue</Typography>;
                                                if (diffDays === 0) return <Typography sx={{color: '#f59e0b', fontWeight: 700, fontSize: '0.8rem'}}>Due Today</Typography>;
                                                return <Typography sx={{color: '#10b981', fontWeight: 700, fontSize: '0.8rem'}}>{diffDays} Days Left</Typography>;
                                            })()}
                                        </TableCell>
                                    )} */}
                                    <TableCell sx={{ color: themeColors.textSecondary, borderBottom: themeColors.tableCellBorder, fontSize: '0.85rem' }}>{new Date(row.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell sx={{ borderBottom: themeColors.tableCellBorder }}>
                                        {isBroker && (row.status === 'Pending' || row.status === 'Pending Additional Documents' || row.status === 'Rejected') ? (
                                            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', justifyContent: 'center' }}>
                                                <IconButton variant="outlined" color="primary" size="small" onClick={() => {
                                                        if (row.user_id !== user.id) {
                                                            setErrorMsg('This application belongs to another broker and is not visible to you.');
                                                        } else {
                                                            openEditCase(row);
                                                        }
                                                    }} sx={{ textTransform: 'none', fontWeight: 600, border: '1px solid #bfdbfe' }}>
                                                      <EditDocumentIcon />
                                                </IconButton>
                                                {row.status === 'Rejected' && row.underwriter_remarks && (
                                                    <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#ef4444', fontWeight: 600, bgcolor: '#fef2f2', p: 0.5, borderRadius: 1 }}>
                                                        Note: {row.underwriter_remarks}
                                                    </Typography>
                                                )}
                                            </Box>
                                        ) : (
                                            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', justifyContent: 'center' }}>
                                                {isBroker ? (
                                                    <IconButton size="small" color="primary" onClick={() => {
                                                        if (row.user_id !== user.id) {
                                                            setErrorMsg('This application belongs to another broker and is not visible to you.');
                                                        } else {
                                                            openEditCase(row, true);
                                                        }
                                                    }} sx={{ bgcolor: '#eff6ff', border: '1px solid #bfdbfe' }}>
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                ) : (
                                                    <Stack direction="row" spacing={1}>
                                                        <IconButton size="small"
                                                            onClick={() => openReview(row)}
                                                            color={row.current_role_id && user?.role_id > row.current_role_id ? 'inherit' : 'primary'}
                                                            sx={{ bgcolor: '#eff6ff', border: '1px solid #bfdbfe', color: '#3b82f6', '&:hover': { bgcolor: '#dbeafe' } }}>
                                                            <VisibilityIcon fontSize="small" />
                                                        </IconButton>
                                                        <Tooltip title="Quick Comment to Broker">
                                                            <IconButton 
                                                                size="small" 
                                                                onClick={() => handleAddCommentClick(row)}
                                                                sx={{ bgcolor: '#eff6ff', border: '1px solid #bfdbfe', color: '#3b82f6', '&:hover': { bgcolor: '#dbeafe' } }}
                                                            >
                                                                <AddCommentIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Stack>
                                                )}
                                            </Box>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>

            {/* Upload Docs Dialog */}
            <Dialog open={openUploadDialog} onClose={() => !uploading && setOpenUploadDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 800, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>Upload Application Documents</DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Box sx={{ border: '2px dashed #cbd5e1', borderRadius: 3, p: 3, textAlign: 'center', bgcolor: '#f8fafc', mb: 2 }}>
                        <UploadFileIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 1.5 }} />
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155', mb: 0.5 }}>Select application files</Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 1.5 }}>
                            Only PDF files accepted • Max size 3MB
                        </Typography>
                        <Button variant="outlined" component="label" disabled={uploading} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}>
                            Browse Files
                            <input type="file" hidden accept=".pdf" multiple onChange={handleCustomFileSelect} />
                        </Button>
                    </Box>

                    {uploadError && (
                        <Box sx={{ p: 1.5, bgcolor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 2, mb: 2 }}>
                            <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 700, display: 'block', textAlign: 'center' }}>
                                ⚠️ {uploadError}
                            </Typography>
                        </Box>
                    )}

                    {selectedFiles.length > 0 && (
                        <Box sx={{ mb: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 1 }}>
                                Selected Files ({selectedFiles.length}):
                            </Typography>
                            <Stack spacing={1}>
                                {selectedFiles.map((file, idx) => (
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
                    <Button onClick={() => setOpenUploadDialog(false)} disabled={uploading} sx={{ color: '#64748b', fontWeight: 600 }}>Cancel</Button>
                    <Button onClick={handleCustomUploadProcess} variant="contained" disabled={selectedFiles.length === 0 || uploading} sx={{ fontWeight: 700, borderRadius: 2, minWidth: 100 }}>
                        {uploading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Process'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Upload Results Dialog */}
            <Dialog open={openResultDialog} onClose={() => setOpenResultDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle sx={{ bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0', p: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <CheckCircleIcon sx={{ color: '#16a34a', fontSize: 28 }} />
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>Application Processed Successfully!</Typography>
                    </Stack>
                </DialogTitle>
                <DialogContent sx={{ p: 4 }}>
                    {uploadResult && (
                        <Box>
                            {isBroker ? (
                                <Box sx={{ p: 3, mt: 3, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px solid #86efac', textAlign: 'center' }}>
                                    <Typography variant="h6" sx={{ color: '#166534', fontWeight: 700, mb: 1 }}>
                                        Application Under Processing
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#15803d', fontWeight: 500 }}>
                                        The application files have been successfully uploaded and are currently being processed. You can view the uploaded documents from your dashboard.
                                    </Typography>
                                </Box>
                            ) : (
                                <>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, p: 2.5, bgcolor: uploadResult.risk_score <= 20 ? '#f0fdf4' : uploadResult.risk_score <= 40 ? '#fff7ed' : '#fef2f2', borderRadius: 3, border: `1px solid ${uploadResult.risk_score <= 20 ? '#86efac' : uploadResult.risk_score <= 40 ? '#fed7aa' : '#fca5a5'}` }}>
                                        <Box>
                                            <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 800 }}>Risk Recommendation</Typography>
                                            <Typography variant="h5" sx={{ fontWeight: 900, color: uploadResult.risk_score <= 20 ? '#166534' : uploadResult.risk_score <= 40 ? '#9a3412' : '#991b1b', mt: 0.5 }}>
                                                {uploadResult.recommendation}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ textAlign: 'right' }}>
                                            <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 800 }}>Risk Score</Typography>
                                            <Stack direction="row" alignItems="baseline" justifyContent="flex-end" sx={{ mt: 0.5 }}>
                                                <Typography variant="h3" sx={{ fontWeight: 900, color: uploadResult.risk_score <= 20 ? '#16a34a' : uploadResult.risk_score <= 40 ? '#d97706' : '#ef4444' }}>
                                                    {uploadResult.risk_score}
                                                </Typography>
                                                <Typography variant="h6" sx={{ color: '#94a3b8', ml: 0.5 }}>/100</Typography>
                                            </Stack>
                                        </Box>
                                    </Box>
                                    
                                    {/* Health Insurance Specifics */}
                                    {(uploadResult.ped_waiting_period_months != null || uploadResult.base_premium_inr != null) && (
                                        <Box sx={{ mb: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid #e2e8f0' }}>
                                            <Grid container spacing={2}>
                                                <Grid item xs={6}>
                                                    <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 800 }}>Tier</Typography>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>{uploadResult.recommended_plan_tier}</Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 800 }}>Base Premium</Typography>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>₹{uploadResult.base_premium_inr} / Year</Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 800 }}>Loading</Typography>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>{uploadResult.loading_percentage}%</Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 800 }}>Final Premium</Typography>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>₹{uploadResult.final_premium_inr} / Year</Typography>
                                                </Grid>
                                                {uploadResult.ped_waiting_period_months > 0 && (
                                                    <Grid item xs={12}>
                                                        <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 800 }}>PED Waiting Period</Typography>
                                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#ef4444' }}>{uploadResult.ped_waiting_period_months} Months</Typography>
                                                    </Grid>
                                                )}
                                                {uploadResult.exclusions && uploadResult.exclusions.length > 0 && (
                                                    <Grid item xs={12}>
                                                        <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 800 }}>Exclusions</Typography>
                                                        <Stack spacing={0.5}>
                                                            {uploadResult.exclusions.map((ex, idx) => (
                                                                <Typography key={idx} variant="body2" sx={{ color: '#475569', fontSize: '0.8rem' }}>• {ex}</Typography>
                                                            ))}
                                                        </Stack>
                                                    </Grid>
                                                )}
                                            </Grid>
                                        </Box>
                                    )}

                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#475569', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box component="span" sx={{ width: 4, height: 16, bgcolor: '#3b82f6', borderRadius: 1 }} />
                                        Process Stats
                                    </Typography>
                                    <Stack spacing={1.5}>
                                        <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                                            <Typography variant="body2" sx={{ color: '#0f172a', fontWeight: 600 }}>
                                                {uploadResult.message || 'The insurance application files have been successfully processed and analysed. The Risk Assessment Engine has computed a blended underwriting recommendation score.'}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 4, pb: 4 }}>
                    <Button onClick={() => setOpenResultDialog(false)} variant="contained" sx={{ fontWeight: 700, px: 4, borderRadius: 2 }}>
                        Got it
                    </Button>
                </DialogActions>
            </Dialog>

            {/* New / Edit Case Dialog */}
            <Dialog open={openNewCase} onClose={() => setOpenNewCase(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 800, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    {viewMode ? 'Application & Documents View' : (editCaseId ? 'Edit Application & Documents' : 'New Insurance Application')}
                </DialogTitle>
                {viewMode && isBroker && currentCaseForStepper && (
                    <Box sx={{ width: '100%', pt: 4, pb: 2, px: 2 }}>
                        <Stepper activeStep={activeStep} alternativeLabel>
                            {steps.map((label) => (
                                <Step key={label}>
                                    <StepLabel>{getDynamicStepLabel(label)}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                    </Box>
                )}
                <DialogContent sx={{ pt: 4 }}>
                    <TextField autoFocus fullWidth label="Applicant Full Name" variant="outlined" value={applicantName}
                        onChange={e => setApplicantName(e.target.value)} sx={{ mt: 3, mb: 3 }} InputProps={{ readOnly: viewMode }} />
                    
                    <Box sx={{ display: 'flex', gap: 2, mb: applicationType === 'Existing Claim' ? 2 : 4 }}>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, mb: 0.5, display: 'block' }}>Application Type</Typography>
                            <select
                                value={applicationType}
                                onChange={e => setApplicationType(e.target.value)}
                                disabled={viewMode}
                                style={{ width: '100%', padding: '14px 40px 14px 12px', fontSize: '1rem', border: '1px solid #c4c4c4', borderRadius: '6px', backgroundColor: viewMode ? '#f1f5f9' : '#fff', cursor: viewMode ? 'default' : 'pointer', outline: 'none', appearance: 'none', backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23334155' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '20px' }}
                            >
                                <option value="Existing Claim">Existing Claim</option>
                                <option value="New Policy">New Policy</option>
                            </select>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, mb: 0.5, display: 'block' }}>Insurance Type</Typography>
                            <select
                                value={policyType}
                                onChange={e => setPolicyType(e.target.value)}
                                disabled={viewMode}
                                style={{ width: '100%', padding: '14px 40px 14px 12px', fontSize: '1rem', border: '1px solid #c4c4c4', borderRadius: '6px', backgroundColor: viewMode ? '#f1f5f9' : '#fff', cursor: viewMode ? 'default' : 'pointer', outline: 'none', appearance: 'none', backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23334155' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '20px' }}
                            >
                                <option value="Health Insurance">Health Insurance</option>
                                <option value="Life Insurance">Life Insurance</option>
                                <option value="Auto Insurance">Auto Insurance</option>
                                <option value="Property Insurance">Property Insurance</option>
                            </select>
                        </Box>
                    </Box>

                    {/* applicationType === 'Existing Claim' && (
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, mb: 0.5, display: 'block' }}>Claim Category</Typography>
                            <select
                                value={claimType}
                                onChange={e => setClaimType(e.target.value)}
                                disabled={viewMode}
                                style={{ width: '100%', padding: '14px 12px', fontSize: '1rem', border: '1px solid #c4c4c4', borderRadius: '6px', background: viewMode ? '#f1f5f9' : '#fff', cursor: viewMode ? 'default' : 'pointer', outline: 'none' }}
                            >
                                <option value="Hospitalization">General Hospitalization</option>
                                <option value="Critical Illness">Critical Illness</option>
                                <option value="Maternity">Maternity</option>
                                <option value="Accident">Accident / Trauma</option>
                            </select>
                        </Box>
                    ) */}

                    {/* (() => {
                        let policies = [];
                        if (applicationType === 'Existing Claim') {
                            if (claimType === 'Critical Illness') policies = ['Cancer Cover', 'Heart Ailment Cover', 'Organ Transplant'];
                            else if (claimType === 'Maternity') policies = ['Newborn Baby Cover', 'Vaccination Cover'];
                            else if (claimType === 'Accident') policies = ['Permanent Disability', 'Loss of Income'];
                            else if (claimType === 'Hospitalization') policies = ['Room Rent Waiver', 'Consumables Cover', 'Daily Cash'];
                        } else {
                            if (policyType === 'Health Insurance') policies = ['Critical Illness Add-on', 'Personal Accident', 'OPD Care'];
                            else if (policyType === 'Life Insurance') policies = ['Accidental Death Benefit', 'Terminal Illness Rider'];
                            else if (policyType === 'Auto Insurance') policies = ['Zero Depreciation', 'Engine Protect'];
                        }

                        if (policies.length > 0) {
                            return (
                                <Box sx={{ mb: 4 }}>
                                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800, mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>Suggested Add-on Sub-Policies</Typography>
                                    <Grid container spacing={1.5}>
                                        {policies.map(p => (
                                            <Grid item xs={4} key={p}>
                                                <Box sx={{ p: 1.5, bgcolor: '#f0fdfa', border: '1px solid #5eead4', borderRadius: 2, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { bgcolor: '#ccfbf1', transform: 'translateY(-2px)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' } }}>
                                                    <Typography variant="caption" sx={{ color: '#0f766e', fontWeight: 800, lineHeight: 1.2, display: 'block' }}>{p}</Typography>
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            );
                        }
                        return null;
                    })() */}

                    {editCaseId && existingDocs.length > 0 && (
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#334155' }}>Already Uploaded Documents:</Typography>
                            <Stack spacing={1}>
                                {existingDocs.map((doc, idx) => (
                                    <Box key={idx} sx={{ p: 1.5, bgcolor: '#f1f5f9', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <DescriptionIcon color="primary" />
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                                                {doc.file_name}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <IconButton size="small" component="a" href={`http://127.0.0.1:8000/uploads/${doc.file_name}`} target="_blank" rel="noopener noreferrer" sx={{ color: '#3b82f6' }}>
                                                <VisibilityIcon fontSize="small" />
                                            </IconButton>
                                            {!viewMode && (
                                                <IconButton size="small" onClick={() => handleDeleteDoc(doc.id)} sx={{ color: '#ef4444' }}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                        </Box>
                                    </Box>
                                ))}
                            </Stack>
                        </Box>
                    )}
                    
                    {!viewMode && (
                        <>
                            <Box sx={{ border: '2px dashed #cbd5e1', borderRadius: 3, p: 3, textAlign: 'center', bgcolor: '#f8fafc', mb: 2 }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155', mb: 0.5 }}>{editCaseId ? 'Upload Missing/New Documents' : 'Upload Application Documents'}</Typography>
                                <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 1.5 }}>
                                    Only PDF files accepted • Max size 5MB
                                </Typography>
                                <Button variant="outlined" component="label" sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}>
                                    Browse Files
                                    <input type="file" hidden accept=".pdf" multiple onChange={handleCustomFileSelect} />
                                </Button>
                            </Box>
                            {uploadError && (
                                <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 700, display: 'block', textAlign: 'center', mb: 2 }}>
                                    ⚠️ {uploadError}
                                </Typography>
                            )}
                            {selectedFiles.length > 0 && (
                                <Box sx={{ mb: 1 }}>
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 1 }}>Selected New Files ({selectedFiles.length}):</Typography>
                                    <Stack spacing={1}>
                                        {selectedFiles.map((f, i) => (
                                            <Box key={i} sx={{ p: 1, bgcolor: '#e0e7ff', borderRadius: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="caption" sx={{ fontWeight: 600 }}>{f.name}</Typography>
                                                <IconButton size="small" onClick={() => removeSelectedFile(f.name)} sx={{ p: 0.5, color: '#ef4444' }}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        ))}
                                    </Stack>
                                </Box>
                            )}
                        </>
                    )}

                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'space-between' }}>
                    {viewMode ? (
                        <Button onClick={() => setOpenNewCase(false)} variant="contained" sx={{ fontWeight: 700, borderRadius: 2, ml: 'auto' }}>Close</Button>
                    ) : (
                        <>
                            <Button onClick={() => setOpenNewCase(false)} sx={{ color: '#64748b', fontWeight: 600 }}>Cancel</Button>
                            <Button onClick={handleCreateCase} variant="contained" disabled={!applicantName || submitting} sx={{ fontWeight: 700, borderRadius: 2 }}>
                                {submitting ? (
                                    <>
                                        <CircularProgress size={20} sx={{ mr: 1, color: '#94a3b8' }} />
                                        Analysing Documents...
                                    </>
                                ) : 'Analyse Documents'}
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>

            {/* Validation Documents Dialog */}
            <Dialog open={missingDocsDialog} onClose={() => setMissingDocsDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ bgcolor: missingDocsList.length > 0 ? '#fef2f2' : '#f0fdf4', borderBottom: `1px solid ${missingDocsList.length > 0 ? '#fca5a5' : '#86efac'}`, p: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: missingDocsList.length > 0 ? '#b91c1c' : '#166534' }}>
                            {missingDocsList.length > 0 ? '⚠️ Missing Required Documents' : '✅ All Required Documents Detected'}
                        </Typography>
                    </Stack>
                </DialogTitle>
                <DialogContent sx={{ p: 4 }}>
                    <Typography variant="body1" sx={{ color: '#334155', fontWeight: 600, mb: 2 }}>
                        Here is the document validation summary for your upload:
                    </Typography>

                    {/* Mandatory section label */}
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800, display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
                        📋 Mandatory Documents
                    </Typography>
                    <Stack spacing={1.5} sx={{ mb: 3 }}>
                        {(applicationType === 'New Policy' ? ['Identity Proof (Aadhaar or PAN)', 'Medical Reports', 'Bank Statement'] : ['Identity Proof (Aadhaar or PAN)', 'Policy Document', 'Claim Form', 'Hospital Bills', 'Discharge Summary', 'Medical Reports / Prescriptions', 'Previous Claim History']).map((doc, idx) => {
                            const isMissing = missingDocsList.some(d => {
                                const dL = d.toLowerCase();
                                const docL = doc.toLowerCase();
                                return dL.includes(docL) || docL.includes(dL) || 
                                       (docL.includes('identity') && dL.includes('identity')) ||
                                       (docL.includes('medical') && dL.includes('medical')) ||
                                       (docL.includes('bank') && dL.includes('bank')) ||
                                       (docL.includes('policy') && dL.includes('policy')) ||
                                       (docL.includes('claim form') && dL.includes('claim')) ||
                                       (docL.includes('hospital') && dL.includes('hospital')) ||
                                       (docL.includes('discharge') && dL.includes('discharge')) ||
                                       (docL.includes('previous claim history') && dL.includes('previous claim history'));
                            });
                            const displayName = doc.includes('Identity Proof') ? 'Identity Proof (e.g., Aadhaar, PAN)' : doc;
                            return (
                                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', p: 1.5, bgcolor: isMissing ? '#fee2e2' : '#dcfce7', borderRadius: 2 }}>
                                    {isMissing ? <span style={{ color: '#ef4444', marginRight: 10, fontSize: '18px' }}>❌</span> : <span style={{ color: '#22c55e', marginRight: 10, fontSize: '18px' }}>✅</span>}
                                    <Typography variant="body2" sx={{ color: isMissing ? '#991b1b' : '#166534', fontWeight: 700 }}>
                                        {displayName}
                                    </Typography>
                                </Box>
                            )
                        })}
                    </Stack>

                    {/* Optional documents */}
                    <>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800, display: 'block', mb: 1, mt: 2, textTransform: 'uppercase', letterSpacing: 1 }}>
                            📎 Additional Documents (Optional)
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                            {(applicationType === 'New Policy' 
                                ? ['Passport Size Photo / Image'] 
                                : ['Bank Statement', 'Passport Size Photo', 'Cancelled Cheque', 'Lab Reports / Test Results', 'Referral Letter from Doctor']
                            ).map((doc, idx) => (
                                    <Chip 
                                        key={idx} 
                                        label={doc} 
                                        icon={<span style={{ fontSize: '14px', marginLeft: 8 }}>📄</span>}
                                        variant="outlined"
                                        sx={{ 
                                            bgcolor: '#f8fafc', 
                                            border: '1px dashed #cbd5e1', 
                                            color: '#475569', 
                                            fontWeight: 600,
                                            py: 1,
                                            '& .MuiChip-icon': { color: '#94a3b8' }
                                        }} 
                                    />
                                ))}
                            </Box>
                        </>

                    {missingDocsList.length > 0 && (
                        <Typography variant="body2" sx={{ color: '#7f1d1d', fontWeight: 500 }}>
                            If you proceed without these documents, the application might get rejected. Do you want to process with the current files or provide the required documents?
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 4, pb: 4, justifyContent: 'space-between' }}>
                    <Button onClick={() => { setMissingDocsDialog(false); }} variant="outlined" color={missingDocsList.length > 0 ? "error" : "primary"} sx={{ fontWeight: 700 }}>
                        {missingDocsList.length > 0 ? 'Provide Required' : 'Cancel'}
                    </Button>
                    <Button onClick={() => { setMissingDocsDialog(false); executeCaseSave(true); }} variant="contained" color={missingDocsList.length > 0 ? "error" : "success"} sx={{ fontWeight: 700 }}>
                        {missingDocsList.length > 0 ? 'Process Anyway' : 'Submit Application'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Underwriter Review Dialog */}
            <Dialog open={Boolean(selectedCase)} onClose={() => setSelectedCase(null)} maxWidth="lg" fullWidth slotProps={{ paper: { sx: { borderRadius: 4, border: 'none', outline: 'none', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' } } }}>
                {selectedCase && (
                    <>
                        <DialogTitle sx={{ bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0', p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                    Underwriter Review — <Box component="span" sx={{ color: '#2563eb', fontFamily: 'monospace' }}>{selectedCase.case_number}</Box>
                                </Typography>
                                <Typography variant="body2" color="text.secondary">{selectedCase.applicant_name} · {selectedCase.policy_type}</Typography>
                                <Box sx={{ mt: 1, display: 'flex', gap: 2 }}>
                                    <Chip 
                                        label={`Assigned To: ${selectedCase.assigned_to === user?.id ? 'Self' : (selectedCase.assigned_user || 'Pending Assignment')}`} 
                                        size="small" 
                                        sx={{ bgcolor: '#f1f5f9', color: '#334155', fontWeight: 600, fontSize: '0.75rem' }} 
                                    />
                                    <Chip 
                                        label={`SLA Due: ${selectedCase.sla_due_at ? new Date(selectedCase.sla_due_at).toLocaleDateString() : 'N/A'} (${(() => {
                                            if (!selectedCase.sla_due_at) return '';
                                            const due = new Date(selectedCase.sla_due_at);
                                            const now = new Date();
                                            due.setHours(0, 0, 0, 0);
                                            now.setHours(0, 0, 0, 0);
                                            const diffDays = Math.round((due - now) / (1000 * 60 * 60 * 24));
                                            return diffDays > 0 ? `${diffDays} Days Left` : diffDays === 0 ? 'Due Today' : `Overdue by ${Math.abs(diffDays)} Days`;
                                        })()})`} 
                                        size="small" 
                                        color="warning" 
                                        sx={{ fontWeight: 600, fontSize: '0.75rem' }} 
                                    />
                                </Box>
                            </Box>
                            {riskData && (
                                <Stack direction="row" spacing={3} alignItems="center">
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 800, lineHeight: 1 }}>AI Risk Score</Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 900, color: riskData.risk_score <= 20 ? '#16a34a' : riskData.risk_score <= 40 ? '#d97706' : '#ef4444', lineHeight: 1 }}>
                                            {(() => {
                                                const computedScore = riskData.findings?.breakdown ? riskData.findings.breakdown.reduce((sum, b) => sum + (b.weighted_score || 0), 0) : (riskData.findings?.risk_score ?? riskData.risk_score ?? 0);
                                                return computedScore % 1 === 0 ? computedScore.toFixed(0) : computedScore.toFixed(1);
                                            })()}<Box component="span" sx={{ fontSize: '0.9rem', color: '#94a3b8' }}>/100</Box>
                                        </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'center', px: 2, borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>
                                        <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 800, lineHeight: 1 }}>Recommendation</Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 900, color: riskData.risk_score <= 20 ? '#16a34a' : riskData.risk_score <= 40 ? '#d97706' : '#ef4444', lineHeight: 1 }}>
                                            {(() => {
                                                const rec = riskData.findings?.recommendation || riskData.findings?.decision || '';
                                                if (rec.toLowerCase().includes('approve')) return 'Approve';
                                                if (rec.toLowerCase().includes('refer')) return 'Refer';
                                                if (rec.toLowerCase().includes('decline') || rec.toLowerCase().includes('reject')) return 'Decline';
                                                if (rec.toLowerCase().includes('review')) return 'Review';
                                                return rec || 'N/A';
                                            })()}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 800, lineHeight: 1 }}>Confidence</Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 900, color: '#7c3aed', lineHeight: 1 }}>
                                            {riskData.confidence_score != null ? Math.round(riskData.confidence_score > 1 ? riskData.confidence_score : riskData.confidence_score * 100) : (riskData.findings?.ai_confidence != null ? Math.round(riskData.findings.ai_confidence > 1 ? riskData.findings.ai_confidence : riskData.findings.ai_confidence * 100) : 85)}<Box component="span" sx={{ fontSize: '0.9rem', color: '#94a3b8' }}>%</Box>
                                        </Typography>
                                    </Box>
                                </Stack>
                            )}
                        </DialogTitle>
                        <DialogContent sx={{ p: 4, pt: 1.5 }}>
                            {riskLoading ? (
                                <Box sx={{ textAlign: 'center', py: 8 }}><CircularProgress /><Typography sx={{ mt: 2, color: '#64748b' }}>Loading AI risk analysis…</Typography></Box>
                            ) : (
                                <Stack spacing={3} sx={{ mt: 1 }}>
                                    {/* AI Summaries & Discrepancy Warning */}
                                    {riskData && (
                                        <Stack spacing={3}>

                                            {(() => {
                                                        const brokerCov = selectedCase?.requested_coverage ? Number(selectedCase.requested_coverage) : null;
                                                        const aiCovStr = String(riskData.findings?.extracted_details?.policy_details?.coverage_amount || '');
                                                        const aiCov = Number(aiCovStr.replace(/[^0-9.-]+/g, ''));
                                                        const showMismatch = brokerCov && aiCov && brokerCov !== aiCov;

                                                        const cc_global = riskData.findings?.claim_history?.current_claim;
                                                        const isObj_global = cc_global && typeof cc_global === 'object';
                                                        let globalClaimAmount = 0;
                                                        if (isObj_global) {
                                                            globalClaimAmount = Number(String(cc_global.amount_claimed || '').replace(/[^0-9]/g, '')) || 0;
                                                        } else {
                                                            const match = String(cc_global || '').match(/(?:Rs\.|₹)\s*([\d,]+)/i);
                                                            if (match) globalClaimAmount = Number(match[1].replace(/,/g, ''));
                                                        }
                                                        const isClaimAssessment = globalClaimAmount > 0;
                                                        
                                                        return (
                                                            <Stack spacing={3}>
                                                                {riskData.findings?.ai_narrative && (
                                                                    <Box sx={{ p: 3, bgcolor: '#f1f5f9', borderLeft: '4px solid #3b82f6', borderRadius: 2 }}>
                                                                        <Typography variant="overline" sx={{ fontWeight: 800, color: '#475569', display: 'block', mb: 1, fontSize: '0.8rem' }}>AI Underwriting Narrative</Typography>
                                                                        <Typography variant="body1" sx={{ color: '#1e293b', fontWeight: 500, lineHeight: 1.6, fontSize: '1.15rem' }}>{riskData.findings.ai_narrative}</Typography>
                                                                    </Box>
                                                                )}
                                                                
                                                                {(riskData.findings?.explainability?.chance_of_approval_justification || riskData.findings?.explainability?.why_approved_or_rejected) && (
                                                                    <Box sx={{ p: 3, bgcolor: '#fdf4ff', borderLeft: '4px solid #d946ef', borderRadius: 2, mt: 2 }}>
                                                                        <Typography variant="overline" sx={{ fontWeight: 800, color: '#86198f', display: 'block', mb: 1, fontSize: '0.8rem' }}>Approval Probability & Justification</Typography>
                                                                        <Typography variant="body1" sx={{ color: '#4a044e', fontWeight: 600, lineHeight: 1.6, fontSize: '1.15rem' }}>
                                                                            {riskData.findings.explainability.chance_of_approval_justification || riskData.findings.explainability.why_approved_or_rejected}
                                                                        </Typography>
                                                                    </Box>
                                                                )}

                                                                {/* Risk Score Formula Table Moved to Bottom Section */}

                                                                <Grid container spacing={2}>
                                                                    <Grid xs={12} sm={4}>
                                                                        <Box sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                                                                            <Typography variant="overline" sx={{ fontWeight: 800, color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Application Type</Typography>
                                                                            <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 800, fontSize: '1.15rem' }}>
                                                                                {selectedCase.application_type || 'Existing Claim'} &nbsp;
                                                                                <Box component="span" sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                                                                                    ({selectedCase.policy_type || 'Health Insurance'})
                                                                                </Box>
                                                                            </Typography>
                                                                        </Box>
                                                                    </Grid>
                                                                    <Grid xs={12} sm={4}>
                                                                        <Box sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                                                                            <Typography variant="overline" sx={{ fontWeight: 800, color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Total Coverage</Typography>
                                                                            <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 800, fontSize: '1.15rem' }}>
                                                                                {selectedCase.requested_coverage ? `₹${Number(selectedCase.requested_coverage).toLocaleString()}` : (aiCovStr || 'Not Specified')}
                                                                            </Typography>
                                                                        </Box>
                                                                    </Grid>
                                                                    <Grid xs={12} sm={4}>
                                                                        <Box sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                                                                            <Typography variant="overline" sx={{ fontWeight: 800, color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Coverage Type</Typography>
                                                                            <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 800, fontSize: '1.15rem' }}>
                                                                                {riskData.findings?.extracted_details?.policy_details?.coverage_type || 'Single (Individual)'}
                                                                            </Typography>
                                                                        </Box>
                                                                    </Grid>
                                                                </Grid>

                                                                {riskData.findings?.claim_history && (
                                                                    <Box sx={{ p: 2, bgcolor: '#fffbeb', borderLeft: '4px solid #f59e0b', borderRadius: 2 }}>
                                                                        <Typography variant="overline" sx={{ fontWeight: 800, color: '#92400e', display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                                            Claim History Analysis
                                                                        </Typography>
                                                                        
                                                                        <Typography variant="caption" sx={{ color: '#b45309', fontWeight: 700, display: 'block', mb: 0.5, mt: 1 }}>Earlier Claims</Typography>
                                                                        <Table size="small" sx={{ mb: 2, bgcolor: '#fef3c7', borderRadius: 1, overflow: 'hidden' }}>
                                                                            <TableHead sx={{ bgcolor: '#fde68a' }}>
                                                                                <TableRow>
                                                                                    <TableCell sx={{ fontWeight: 800, color: '#92400e', py: 0.5 }}>Date</TableCell>
                                                                                    <TableCell sx={{ fontWeight: 800, color: '#92400e', py: 0.5 }}>Amount</TableCell>
                                                                                    <TableCell sx={{ fontWeight: 800, color: '#92400e', py: 0.5 }}>Type</TableCell>
                                                                                    <TableCell sx={{ fontWeight: 800, color: '#92400e', py: 0.5 }}>Reason</TableCell>
                                                                                </TableRow>
                                                                            </TableHead>
                                                                            <TableBody>
                                                                                {riskData.findings.claim_history.earlier_claims && riskData.findings.claim_history.earlier_claims.length > 0 ? (
                                                                                    riskData.findings.claim_history.earlier_claims.map((claim, idx) => {
                                                                                        const isObj = typeof claim === 'object' && claim !== null;
                                                                                        return (
                                                                                            <TableRow key={idx}>
                                                                                                <TableCell sx={{ color: '#78350f', py: 0.5 }}>{isObj && claim.claim_date ? claim.claim_date : '-'}</TableCell>
                                                                                                <TableCell sx={{ color: '#78350f', py: 0.5 }}>{isObj ? claim.amount_claimed : '-'}</TableCell>
                                                                                                <TableCell sx={{ color: '#78350f', py: 0.5 }}>{isObj ? claim.claim_type : '-'}</TableCell>
                                                                                                <TableCell sx={{ color: '#78350f', py: 0.5 }}>{isObj ? claim.reason_for_claim : claim}</TableCell>
                                                                                            </TableRow>
                                                                                        );
                                                                                    })
                                                                                ) : (
                                                                                    <TableRow>
                                                                                        <TableCell colSpan={4} align="center" sx={{ color: '#78350f', py: 2, fontStyle: 'italic' }}>No earlier claims detected.</TableCell>
                                                                                    </TableRow>
                                                                                )}
                                                                            </TableBody>
                                                                        </Table>

                                                                        {selectedCase.application_type !== 'New Policy' && (
                                                                            <Box sx={{ mt: 2 }}>
                                                                                <Typography variant="caption" sx={{ color: '#b45309', fontWeight: 700, display: 'block', mb: 0.5 }}>Current Claim</Typography>
                                                                                {(() => {
                                                                                    const cc = riskData.findings.claim_history.current_claim;
                                                                            const isObj = typeof cc === 'object' && cc !== null;
                                                                            
                                                                            let contentRows = null;

                                                                            if (!cc || cc === 'None identified' || cc === 'None' || 
                                                                                (isObj && (cc.amount_claimed === 'None' || cc.amount_claimed === null) && (cc.claim_type === 'None' || cc.claim_type === null))) {
                                                                                // Fallback: show from extracted_details if available
                                                                                const medCond = riskData.findings?.extracted_details?.patient_details?.medical_condition;
                                                                                const polNum = riskData.findings?.extracted_details?.policy_details?.policy_number;
                                                                                if (medCond) {
                                                                                    const fallDate = '-';
                                                                                    const aiCov = riskData.findings?.extracted_details?.policy_details?.coverage_amount;
                                                                                    const fallAmount = selectedCase.requested_coverage ? `₹${Number(selectedCase.requested_coverage).toLocaleString()}` : (aiCov || '-');
                                                                                    const fallType = selectedCase.policy_type || 'Health Insurance';
                                                                                    
                                                                                    contentRows = (
                                                                                        <TableRow>
                                                                                            <TableCell sx={{ color: '#78350f', py: 0.5, fontWeight: 700 }}>{fallDate}</TableCell>
                                                                                            <TableCell sx={{ color: '#78350f', py: 0.5, fontWeight: 700 }}>{fallAmount}</TableCell>
                                                                                            <TableCell sx={{ color: '#78350f', py: 0.5, fontWeight: 700 }}>{fallType}</TableCell>
                                                                                            <TableCell sx={{ color: '#78350f', py: 0.5, fontWeight: 700 }}>
                                                                                                {medCond}
                                                                                                {polNum && <Typography variant="caption" sx={{ display: 'block', color: '#92400e', mt: 0.5 }}>Policy: {polNum}</Typography>}
                                                                                            </TableCell>
                                                                                        </TableRow>
                                                                                    );
                                                                                } else {
                                                                                    contentRows = (
                                                                                        <TableRow>
                                                                                            <TableCell colSpan={4} align="center" sx={{ color: '#78350f', py: 2, fontStyle: 'italic' }}>No current claim detected.</TableCell>
                                                                                        </TableRow>
                                                                                    );
                                                                                }
                                                                            } else {
                                                                                let parsedAmount = '-';
                                                                                let parsedType = '-';
                                                                                let parsedReason = cc;

                                                                                if (!isObj && typeof cc === 'string') {
                                                                                    const match = cc.match(/(Rs\.\s*[\d,]+)\s+for\s+(.*?)\s+\((.*?)\)/i);
                                                                                    if (match) {
                                                                                        parsedAmount = match[1];
                                                                                        parsedReason = match[2];
                                                                                        parsedType = match[3];
                                                                                    }
                                                                                }

                                                                                contentRows = (
                                                                                    <TableRow>
                                                                                        <TableCell sx={{ color: '#78350f', py: 0.5, fontWeight: 700 }}>{isObj && (cc.date || cc.claim_date) ? (cc.date || cc.claim_date) : '-'}</TableCell>
                                                                                        <TableCell sx={{ color: '#78350f', py: 0.5, fontWeight: 700 }}>{isObj ? cc.amount_claimed : parsedAmount}</TableCell>
                                                                                        <TableCell sx={{ color: '#78350f', py: 0.5, fontWeight: 700 }}>{isObj ? cc.claim_type : parsedType}</TableCell>
                                                                                        <TableCell sx={{ color: '#78350f', py: 0.5, fontWeight: 700 }}>{isObj ? cc.reason_for_claim : parsedReason}</TableCell>
                                                                                    </TableRow>
                                                                                );
                                                                            }

                                                                            return (
                                                                                <Table size="small" sx={{ bgcolor: '#fef3c7', borderRadius: 1, overflow: 'hidden' }}>
                                                                                    <TableHead sx={{ bgcolor: '#fde68a' }}>
                                                                                        <TableRow>
                                                                                            <TableCell sx={{ fontWeight: 800, color: '#92400e', py: 0.5 }}>Date</TableCell>
                                                                                            <TableCell sx={{ fontWeight: 800, color: '#92400e', py: 0.5 }}>Amount</TableCell>
                                                                                            <TableCell sx={{ fontWeight: 800, color: '#92400e', py: 0.5 }}>Type</TableCell>
                                                                                            <TableCell sx={{ fontWeight: 800, color: '#92400e', py: 0.5 }}>Reason</TableCell>
                                                                                        </TableRow>
                                                                                    </TableHead>
                                                                                    <TableBody>
                                                                                        {contentRows}
                                                                                    </TableBody>
                                                                                </Table>
                                                                            );
                                                                        })()}
                                                                            </Box>
                                                                        )}
                                                                    </Box>
                                                                )}

                                                                {showMismatch && (
                                                                    <Box sx={{ p: 2, bgcolor: '#fef2f2', border: '2px solid #ef4444', borderRadius: 2 }}>
                                                                        <Typography variant="subtitle1" sx={{ color: '#b91c1c', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                            ⚠️ CRITICAL DISCREPANCY DETECTED
                                                                        </Typography>
                                                                        <Typography variant="body2" sx={{ color: '#7f1d1d', fontWeight: 600, mt: 0.5 }}>
                                                                            Broker requested <strong>₹{brokerCov.toLocaleString()}</strong> but AI extracted <strong>₹{aiCov.toLocaleString()}</strong> from documents.
                                                                        </Typography>
                                                                    </Box>
                                                                )}



                                                                
                                                                {selectedCase.application_type === 'Existing Claim' && riskData.findings?.claim_decision_engine?.decision !== 'Not Applicable' ? (
                                                                    <Box sx={{ p: 2, bgcolor: '#f8fafc', borderLeft: '4px solid #10b981', borderRadius: 1, mt: 2 }}>
                                                                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#047857', mb: 1.5, textTransform: 'uppercase' }}>Claim Adjudication Decision</Typography>
                                                                        <Grid container spacing={2}>
                                                                            <Grid item xs={12} md={6}>
                                                                                <Box sx={{ p: 1.5, bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                                                                                    <Stack spacing={1}>
                                                                                        <Stack direction="row" justifyContent="space-between">
                                                                                            <Typography variant="body2" sx={{ color: '#64748b' }}>Claim Eligibility</Typography>
                                                                                            <Typography variant="body2" sx={{ fontWeight: 700, color: riskData.findings.claim_decision_engine.claim_eligibility ? '#16a34a' : '#ef4444' }}>
                                                                                                {riskData.findings.claim_decision_engine.claim_eligibility ? 'Eligible' : 'Not Eligible'}
                                                                                            </Typography>
                                                                                        </Stack>
                                                                                        <Stack direction="row" justifyContent="space-between">
                                                                                            <Typography variant="body2" sx={{ color: '#64748b' }}>Approved Amount</Typography>
                                                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>₹{Number(riskData.findings?.claim_decision_engine?.approved_amount || 0).toLocaleString()}</Typography>
                                                                                        </Stack>
                                                                                        {riskData.findings.claim_decision_engine.deductions?.map((deduction, idx) => (
                                                                                            <Stack key={idx} direction="row" justifyContent="space-between">
                                                                                                <Typography variant="body2" sx={{ color: '#64748b', textTransform: 'capitalize' }}>Deduction ({deduction.type})</Typography>
                                                                                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#ef4444' }}>- ₹{Number(deduction.amount || 0).toLocaleString()}</Typography>
                                                                                            </Stack>
                                                                                        ))}
                                                                                        <Divider sx={{ my: 1 }} />
                                                                                        <Stack direction="row" justifyContent="space-between">
                                                                                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>Final Payable Amount</Typography>
                                                                                            <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#16a34a' }}>₹{Number(riskData.findings?.claim_decision_engine?.final_payable_amount || 0).toLocaleString()}</Typography>
                                                                                        </Stack>
                                                                                    </Stack>
                                                                                </Box>
                                                                            </Grid>
                                                                            <Grid item xs={12} md={6}>
                                                                                {riskData.findings.policy_information && (
                                                                                    <Box sx={{ p: 1.5, bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 2, height: '100%' }}>
                                                                                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800, display: 'block', mb: 1 }}>Policy Information</Typography>
                                                                                        <Stack spacing={0.5}>
                                                                                            <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.8rem' }}><strong>Policy No:</strong> {riskData.findings.policy_information.policy_number || 'N/A'}</Typography>
                                                                                            <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.8rem' }}><strong>Sum Insured:</strong> {riskData.findings.policy_information.sum_insured === 'UNKNOWN' ? 'UNKNOWN' : `₹${Number(riskData.findings.policy_information.sum_insured).toLocaleString()}`}</Typography>
                                                                                            <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.8rem' }}><strong>Used So Far:</strong> {riskData.findings.policy_information.used_sum_insured === 'UNKNOWN' ? 'UNKNOWN' : `₹${Number(riskData.findings.policy_information.used_sum_insured).toLocaleString()}`}</Typography>
                                                                                            <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.8rem' }}><strong>Remaining:</strong> {riskData.findings.policy_information.remaining_sum_insured === 'UNKNOWN' ? 'UNKNOWN' : `₹${Number(riskData.findings.policy_information.remaining_sum_insured).toLocaleString()}`}</Typography>
                                                                                            <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.8rem' }}><strong>Waiting Period Completed:</strong> {riskData.findings.policy_information.waiting_period_completed ? 'Yes' : 'No'}</Typography>
                                                                                        </Stack>
                                                                                    </Box>
                                                                                )}
                                                                            </Grid>
                                                                            <Grid item xs={12}>
                                                                                 <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800 }}>Decision Justification</Typography>
                                                                                 <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.85rem', mt: 0.5 }}>
                                                                                     {riskData.findings.claim_decision_engine.reason}
                                                                                 </Typography>
                                                                            </Grid>
                                                                        </Grid>
                                                                    </Box>
                                                                ) : riskData.findings?.premium_calculation?.premium_output?.length > 0 && (
                                                                        <Box sx={{ p: 2, bgcolor: '#f8fafc', borderLeft: '4px solid #8b5cf6', borderRadius: 1, mt: 2 }}>
                                                                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#5b21b6', mb: 1.5, textTransform: 'uppercase' }}>Policy Eligibility & Premium Details</Typography>
                                                                            <Grid container spacing={2}>
                                                                                {riskData.findings.policy_eligibility?.eligible_plans && (
                                                                                    <Grid item xs={12}>
                                                                                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800, mb: 1, display: 'block' }}>Eligible Plans</Typography>
                                                                                        <Stack spacing={1} direction="row" flexWrap="wrap" useFlexGap>
                                                                                            {riskData.findings.policy_eligibility.eligible_plans.map((plan, idx) => (
                                                                                                <Box key={idx} sx={{ p: 1.5, minWidth: 250, flexGrow: 1, bgcolor: plan.allowed ? '#f0fdf4' : '#fef2f2', border: `1px solid ${plan.allowed ? '#bbf7d0' : '#fecaca'}`, borderRadius: 1 }}>
                                                                                                    <Typography variant="body2" sx={{ fontWeight: 700, color: plan.allowed ? '#166534' : '#991b1b' }}>{plan.plan_name} {plan.allowed ? '✅' : '❌'}</Typography>
                                                                                                    <Typography variant="caption" sx={{ color: '#475569' }}>{plan.reason}</Typography>
                                                                                                </Box>
                                                                                            ))}
                                                                                        </Stack>
                                                                                    </Grid>
                                                                                )}
                                                                                <Grid item xs={12}>
                                                                                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800, mb: 1, mt: riskData.findings.policy_eligibility?.eligible_plans ? 1 : 0, display: 'block' }}>Premium Breakdown by Sum Assured</Typography>
                                                                                    <Grid container spacing={1.5}>
                                                                                        {riskData.findings.premium_calculation.premium_output.map((po, idx) => (
                                                                                            <Grid item xs={12} sm={6} md={4} xl={3} key={idx}>
                                                                                            <Box sx={{ p: 1.2, bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                                                                                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b', mb: 1, fontSize: '0.8rem' }}>Sum Assured: ₹{(po.sum_assured || 0).toLocaleString()}</Typography>
                                                                                                <Stack spacing={0.5}>
                                                                                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                                                                        <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.7rem' }}>Base Premium</Typography>
                                                                                                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>₹{(po.base_premium || 0).toLocaleString()} <Box component="span" sx={{ fontSize: '0.65rem', color: '#94a3b8' }}>/ Yr</Box></Typography>
                                                                                                    </Stack>
                                                                                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                                                                        <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.7rem' }}>Risk Loading</Typography>
                                                                                                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>{po.risk_loading_percent || 0}%</Typography>
                                                                                                    </Stack>
                                                                                                    <Divider sx={{ my: 0.5 }} />
                                                                                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                                                                        <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.65rem' }}>Final (incl. ₹{((po.final_premium || 0) - ((po.base_premium || 0) * (1 + (po.risk_loading_percent || 0) / 100))).toLocaleString()} GST)</Typography>
                                                                                                        <Typography sx={{ fontWeight: 900, color: '#16a34a', fontSize: '0.8rem' }}>₹{(po.final_premium || 0).toLocaleString()} <Box component="span" sx={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>/ Yr</Box></Typography>
                                                                                                    </Stack>
                                                                                                </Stack>
                                                                                                
                                                                                                {po.addons && po.addons.length > 0 && (
                                                                                                    <Box sx={{ mt: 1.5, p: 1, bgcolor: '#f8fafc', borderRadius: 1, border: '1px solid #e2e8f0' }}>
                                                                                                        <Typography variant="caption" sx={{ color: '#475569', fontWeight: 800, display: 'block', mb: 0.5 }}>Recommended Add-ons:</Typography>
                                                                                                        {po.addons.map((addon, aIdx) => (
                                                                                                            <Stack key={aIdx} direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.2 }}>
                                                                                                                <Typography variant="body2" sx={{ fontSize: '0.65rem', color: '#64748b' }}>+ {addon.name}</Typography>
                                                                                                                <Typography variant="body2" sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#0f172a' }}>₹{addon.price.toLocaleString()}</Typography>
                                                                                                            </Stack>
                                                                                                        ))}
                                                                                                    </Box>
                                                                                                )}
                                                                                            </Box>
                                                                                        </Grid>
                                                                                    ))}
                                                                                </Grid>
                                                                            </Grid>
                                                                            {(riskData.findings.exclusions || []).length > 0 && (
                                                                                <Grid xs={12}>
                                                                                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800, mt: 1, display: 'block' }}>Exclusions</Typography>
                                                                                    {riskData.findings.exclusions.map((ex, idx) => (
                                                                                        <Typography key={idx} variant="body2" sx={{ color: '#475569', fontSize: '0.8rem' }}>• {ex}</Typography>
                                                                                    ))}
                                                                                </Grid>
                                                                            )}
                                                                        </Grid>
                                                                    </Box>
                                                                )}

                                                                </Stack>
                                                            );
                                                        })()}
                                            </Stack>
                                        )}



                                        {riskData?.findings?.extracted_details && (
                                            <Card sx={{
                                                        borderRadius: 4,
                                                        border: '1px solid #e2e8f0',
                                                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                                        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.08)',
                                                        mb: 1,
                                                        overflow: 'hidden'
                                                    }}>
                                                        <Box sx={{
                                                            px: 3,
                                                            py: 2,
                                                            background: 'linear-gradient(90deg, #1e293b 0%, #0f172a 100%)',
                                                            color: '#ffffff',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between'
                                                        }}>
                                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                                <AssignmentIcon sx={{ color: '#60a5fa' }} />
                                                                <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', letterSpacing: 0.5 }}>
                                                                    APPLICANT & POLICY SUMMARY CARD
                                                                </Typography>
                                                            </Stack>
                                                        </Box>

                                                        <CardContent sx={{ p: 4 }}>
                                                            <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} divider={<Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' }, borderColor: '#e2e8f0' }} />} sx={{ width: '100%' }}>
                                                                <Box sx={{ flex: 1 }}>
                                                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#475569', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                        <Box component="span" sx={{ width: 4, height: 16, bgcolor: '#3b82f6', borderRadius: 1 }} />
                                                                        Patient Bio-Data
                                                                    </Typography>
                                                                    <Stack spacing={1.5}>
                                                                        <Box>
                                                                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block' }}>Age</Typography>
                                                                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                                                                {riskData.findings.extracted_details.patient_details?.age ? `${riskData.findings.extracted_details.patient_details.age} years` : '—'}
                                                                            </Typography>
                                                                        </Box>
                                                                        <Box>
                                                                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block' }}>Gender</Typography>
                                                                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b', textTransform: 'capitalize' }}>
                                                                                {riskData.findings.extracted_details.patient_details?.gender || '—'}
                                                                            </Typography>
                                                                        </Box>
                                                                        <Box>
                                                                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block' }}>BMI</Typography>
                                                                            <Chip
                                                                                label={riskData.findings.extracted_details.patient_details?.bmi ? `${riskData.findings.extracted_details.patient_details.bmi}` : '—'}
                                                                                size="small"
                                                                                sx={{
                                                                                    fontWeight: 700,
                                                                                    height: 24,
                                                                                    bgcolor: !riskData.findings.extracted_details.patient_details?.bmi ? '#e2e8f0' : parseFloat(riskData.findings.extracted_details.patient_details.bmi) > 27.5 || parseFloat(riskData.findings.extracted_details.patient_details.bmi) < 18.5 ? '#fef2f2' : '#f0fdf4',
                                                                                    color: !riskData.findings.extracted_details.patient_details?.bmi ? '#475569' : parseFloat(riskData.findings.extracted_details.patient_details.bmi) > 27.5 || parseFloat(riskData.findings.extracted_details.patient_details.bmi) < 18.5 ? '#ef4444' : '#16a34a',
                                                                                    border: 'none'
                                                                                }}
                                                                            />
                                                                        </Box>
                                                                        <Box>
                                                                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block' }}>Blood Pressure</Typography>
                                                                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                                                                {riskData.findings.extracted_details.patient_details?.blood_pressure || '—'}
                                                                            </Typography>
                                                                        </Box>
                                                                    </Stack>
                                                                </Box>

                                                                <Box sx={{ flex: 1 }}>
                                                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#475569', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                        <Box component="span" sx={{ width: 4, height: 16, bgcolor: '#3b82f6', borderRadius: 1 }} />
                                                                        Contact & Medical
                                                                    </Typography>
                                                                    <Stack spacing={1.5}>
                                                                        <Box>
                                                                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block' }}>Occupation</Typography>
                                                                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                                                                {riskData.findings.extracted_details.patient_details?.occupation || '—'}
                                                                            </Typography>
                                                                        </Box>
                                                                        <Box>
                                                                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block' }}>Marital Status</Typography>
                                                                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                                                                {riskData.findings.extracted_details.patient_details?.marital_status || '—'}
                                                                            </Typography>
                                                                        </Box>
                                                                        <Box>
                                                                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block' }}>Contact Number</Typography>
                                                                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                                                                {riskData.findings.extracted_details.patient_details?.contact_number || '—'}
                                                                            </Typography>
                                                                        </Box>
                                                                        <Box>
                                                                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block' }}>Email ID</Typography>
                                                                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b', overflowWrap: 'anywhere' }}>
                                                                                {riskData.findings.extracted_details.patient_details?.email || '—'}
                                                                            </Typography>
                                                                        </Box>
                                                                        <Box>
                                                                            <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 800, display: 'block' }}>Medical Condition</Typography>
                                                                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#b91c1c' }}>
                                                                                {riskData.findings.extracted_details.patient_details?.medical_condition || '—'}
                                                                            </Typography>
                                                                        </Box>
                                                                    </Stack>
                                                                </Box>

                                                                <Box sx={{ flex: 1 }}>
                                                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#475569', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                        <Box component="span" sx={{ width: 4, height: 16, bgcolor: '#10b981', borderRadius: 1 }} />
                                                                        Policy & Nominee
                                                                    </Typography>
                                                                    <Stack spacing={1.5}>
                                                                        <Box>
                                                                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block' }}>Proposal ID / Quote No</Typography>
                                                                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                                                                {riskData.findings.extracted_details.policy_details?.policy_number || '—'}
                                                                            </Typography>
                                                                        </Box>
                                                                        <Box>
                                                                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block' }}>Coverage Amount (AI Detected)</Typography>
                                                                            <Typography variant="body2" sx={{ fontWeight: 800, color: '#059669' }}>
                                                                                {riskData.findings.extracted_details.policy_details?.coverage_amount || '—'}
                                                                            </Typography>
                                                                        </Box>


                                                                        <Box>
                                                                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block' }}>Policy Term</Typography>
                                                                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                                                                {riskData.findings.extracted_details.policy_details?.policy_term_years ? `${riskData.findings.extracted_details.policy_details.policy_term_years} Years` : '—'}
                                                                            </Typography>
                                                                        </Box>
                                                                        <Box>
                                                                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block' }}>Nominee Details</Typography>
                                                                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                                                                {riskData.findings.extracted_details.policy_details?.nominee || '—'}
                                                                            </Typography>
                                                                        </Box>
                                                                    </Stack>
                                                                </Box>

                                                                <Box sx={{ flex: 1 }}>
                                                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#475569', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                        <Box component="span" sx={{ width: 4, height: 16, bgcolor: '#f59e0b', borderRadius: 1 }} />
                                                                        Application Summary
                                                                    </Typography>
                                                                    <Stack spacing={2}>
                                                                        <Box sx={{ mt: 1 }}>
                                                                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 0.5 }}>
                                                                                POLICY SUMMARY
                                                                            </Typography>
                                                                            <Typography variant="body2" sx={{ color: '#334155', fontStyle: 'italic', fontWeight: 500 }}>
                                                                                "{riskData.findings.extracted_details.policy_details.policy_summary?.replace?.(/(^|\s)I(\d)/g, '$1$2') || riskData.findings.extracted_details.policy_details.policy_summary}"
                                                                            </Typography>
                                                                        </Box>
                                                                        <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed #cbd5e1' }}>
                                                                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800, display: 'block', mb: 1 }}>
                                                                                UPLOADED DOCUMENTS
                                                                            </Typography>
                                                                            {riskData.uploaded_documents && riskData.uploaded_documents.length > 0 ? (
                                                                                <Stack spacing={1}>
                                                                                    {riskData.uploaded_documents.map(doc => (
                                                                                        <Box key={doc.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                                            <UploadFileIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                                                                                            <Typography
                                                                                                variant="caption"
                                                                                                onClick={() => window.open(`http://127.0.0.1:8000/uploads/${doc.file_name}`, '_blank')}
                                                                                                sx={{ fontWeight: 600, color: '#3b82f6', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                                                                                            >
                                                                                                {doc.file_name} <VisibilityIcon sx={{ fontSize: 12, ml: 0.5, verticalAlign: 'middle' }} />
                                                                                            </Typography>
                                                                                        </Box>
                                                                                    ))}
                                                                                </Stack>
                                                                            ) : (
                                                                                <Typography variant="caption" sx={{ color: '#94a3b8' }}>No documents uploaded.</Typography>
                                                                            )}
                                                                        </Box>
                                                                    </Stack>
                                                                </Box>
                                                            </Stack>
                                                        </CardContent>
                                            </Card>
                                        )}
                                            <Box>
                                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                                                    <PsychologyIcon sx={{ color: '#7c3aed', fontSize: 28 }} />
                                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Analysis of Patient Files</Typography>
                                                </Stack>
                                                {riskData ? (
                                                    <Box>
                                                        <Typography variant="body2" sx={{ color: '#475569', mb: 2 }}>
                                                            Risk Assessment Engine evaluated {riskData.findings?.rules_total || 4} deterministic underwriting rules against the applicant's document profile.
                                                        </Typography>
                                                        <Box sx={{ mb: 3, p: 2, bgcolor: '#f0fdfa', border: '1px solid #ccfbf1', borderRadius: 2 }}>
                                                            <Typography variant="caption" sx={{ fontWeight: 800, color: '#0f766e', display: 'block', mb: 0.5, textTransform: 'uppercase' }}>
                                                                How is the AI Risk Score Calculated?
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ color: '#115e59', fontSize: '0.85rem', lineHeight: 1.6 }}>
                                                                1. <strong>AI Evaluation:</strong> The AI reads the documents (e.g. Medical Reports) and understands the applicant's profile.<br/>
                                                                2. <strong>Raw Score:</strong> Based on the findings, it assigns a base risk penalty. (High number = High Risk)<br/>
                                                                3. <strong>Weightage:</strong> Each parameter (Age, BMI, etc.) has a fixed percentage of importance in the policy.<br/>
                                                                4. <strong>Weighted Score:</strong> <code>Raw Score × Weightage %</code> gives the final risk point for that parameter.<br/>
                                                                The Final AI Risk Score (at the top) is the sum total of all these individual weighted points.
                                                            </Typography>
                                                        </Box>
                                                        <Stack spacing={2} sx={{ width: '100%' }}>
                                                            {(riskData.findings?.breakdown || []).map((b, i) => {
                                                                const weight = typeof b.weight === 'number' ? (b.weight <= 1 ? b.weight * 100 : b.weight) : b.weight;
                                                                const raw = b.raw_score ?? b.score;
                                                                const finalScore = b.weighted_score ?? (Number.isInteger(b.score * b.weight) ? (b.score * b.weight) : (b.score * b.weight).toFixed(1));
                                                                
                                                                return (
                                                                <Paper key={i} variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: '#f8fafc', borderColor: '#e2e8f0' }}>
                                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                                        <Box>
                                                                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                                                                {b.factor || b.label}
                                                                            </Typography>
                                                                            <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b', display: 'block' }}>
                                                                                Calculation: {raw} (Raw Score) × {weight/100} (Weightage of {weight}%) = {finalScore}
                                                                            </Typography>
                                                                        </Box>
                                                                        <Typography variant="subtitle2" sx={{ fontWeight: 900, color: finalScore <= weight * 0.4 ? '#16a34a' : (finalScore <= weight * 0.7 ? '#f59e0b' : '#ef4444') }}>
                                                                            {finalScore} <Box component="span" sx={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.75rem' }}>/ {weight}</Box>
                                                                        </Typography>
                                                                    </Box>
                                                                    
                                                                    <Typography variant="body2" sx={{ color: '#475569', mb: 1.5 }}>
                                                                        <Box component="span" sx={{ fontWeight: 700, color: '#1e293b' }}>Justification:</Box> {b.justification || 'No justification provided.'}
                                                                    </Typography>

                                                                    {(b.triggered_rules?.length > 0) && (
                                                                        <Box sx={{ mb: 1 }}>
                                                                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', display: 'block', mb: 0.5 }}>Triggered Rules:</Typography>
                                                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                                                {b.triggered_rules.map((rule, idx) => <Chip key={`rule-${idx}`} label={rule} size="small" sx={{ bgcolor: '#f3e8ff', color: '#7e22ce', height: 22, fontSize: '0.7rem' }} />)}
                                                                            </Box>
                                                                        </Box>
                                                                    )}

                                                                    {(b.citations && Array.isArray(b.citations) && b.citations.filter(c => c && c.trim() !== '' && c.toLowerCase() !== 'none' && c.toLowerCase() !== 'n/a' && !c.toLowerCase().includes('list of')).length > 0) && (
                                                                        <Box sx={{ mt: 1 }}>
                                                                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', display: 'block', mb: 0.5 }}>Citations / Source Documents:</Typography>
                                                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                                                {b.citations.filter(c => c && c.trim() !== '' && c.toLowerCase() !== 'none' && c.toLowerCase() !== 'n/a' && !c.toLowerCase().includes('list of')).map((doc, idx) => {
                                                                                    const resolvedFile = resolveCitationToFile(doc, riskData?.uploaded_documents || []);
                                                                                    return <Chip component="a" href={`http://127.0.0.1:8000/uploads/${resolvedFile}`} target="_blank" clickable key={`doc-${idx}`} label={resolvedFile || doc} size="small" icon={<DescriptionIcon sx={{ fontSize: 14 }}/>} sx={{ bgcolor: '#e0f2fe', color: '#0369a1', height: 22, fontSize: '0.7rem', cursor: 'pointer', textDecoration: 'none' }} />;
                                                                                })}
                                                                            </Box>
                                                                        </Box>
                                                                    )}
                                                                </Paper>
                                                            )})}
                                                        </Stack>
                                                    </Box>
                                                ) : (
                                                    <Box sx={{ p: 3, bgcolor: '#fef9c3', borderRadius: 2, border: '1px solid #fde68a' }}>
                                                        <Typography variant="body2" sx={{ color: '#92400e', fontWeight: 600 }}>
                                                            No risk assessment found. The broker may not have uploaded documents yet.
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                </Stack>
                            )}
                        </DialogContent>
                        <DialogActions sx={{ px: 4, pb: 4, borderTop: '1px solid #e2e8f0', pt: 3, bgcolor: '#f8fafc', flexDirection: 'column', alignItems: 'stretch', gap: 2 }}>
                            {(() => {
                                const isEscalatedPastUser = selectedCase.current_role_id && user.role_id > selectedCase.current_role_id;
                                // Enable actions for non-brokers, ignoring status for testing/demo per user request
                                const disableActions = isBroker;
                                
                                return (
                                    <>
                                        {isEscalatedPastUser && (
                                            <Box sx={{ width: '100%', p: 1.5, bgcolor: '#fef2f2', borderRadius: 2, border: '1px dashed #fca5a5' }}>
                                                <Typography variant="body2" sx={{ color: '#b91c1c', fontWeight: 700, textAlign: 'center' }}>
                                                    ⚠️ You did not review this case in time. It has been escalated to the next authority level.
                                                </Typography>
                                            </Box>
                                        )}
                                        <Stack direction="row" spacing={1} sx={{ width: '100%', flexWrap: 'wrap' }}>
                                            <Button onClick={() => setSelectedCase(null)} sx={{ color: '#64748b', fontWeight: 700, mr: 'auto' }}>Close</Button>
                                            {!disableActions && (
                                                <>
                                                    <Button variant="outlined" color="warning" disabled={decisionLoading} onClick={() => handleDecision('escalate')} sx={{ fontWeight: 700, px: 3, borderRadius: 2 }}>Refer</Button>
                                                    <Button variant="outlined" color="error" disabled={decisionLoading} onClick={() => handleDecision('reject')} sx={{ fontWeight: 700, px: 3, borderRadius: 2 }}>Reject</Button>
                                                    <Button variant="contained" color="success" disabled={decisionLoading} onClick={() => handleDecision('approve')} sx={{ fontWeight: 700, px: 3, borderRadius: 2 }}>Approve</Button>
                                                </>
                                            )}
                                        </Stack>
                                    </>
                                );
                            })()}
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Reject Modal */}
            <Dialog open={openRejectModal} onClose={() => setOpenRejectModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Reject Application</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Stack spacing={3}>

                        <Box>
                            <Typography variant="caption" sx={{ display: 'block', mb: 1, fontWeight: 700 }}>Rejection Reason</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                {["High Medical Risk", "Fraudulent Documents", "Non-disclosure of facts", "Outside Policy Limits"].map((reason) => (
                                    <Chip 
                                        key={reason} 
                                        label={reason} 
                                        onClick={() => setRejectCustomReason(reason)} 
                                        variant={rejectCustomReason === reason ? "filled" : "outlined"}
                                        color={rejectCustomReason === reason ? "primary" : "default"}
                                        sx={{ cursor: 'pointer', fontWeight: 600 }}
                                    />
                                ))}
                            </Box>
                            <TextField
                                fullWidth
                                label="Reason Details"
                                placeholder="Select a reason above or type a custom reason..."
                                variant="outlined"
                                value={rejectCustomReason}
                                onChange={e => setRejectCustomReason(e.target.value)}
                                required
                            />
                        </Box>
                        <Box sx={{ border: '1px dashed #cbd5e1', p: 2, borderRadius: 2 }}>
                            <Typography variant="caption" sx={{ display: 'block', mb: 1, fontWeight: 700 }}>Supporting Document *</Typography>
                            <Button variant="outlined" component="label" size="small">
                                Upload PDF
                                <input type="file" hidden accept=".pdf" onChange={(e) => setRejectDoc(e.target.files[0])} />
                            </Button>
                            {rejectDoc && <Typography variant="caption" sx={{ ml: 2 }}>{rejectDoc.name}</Typography>}
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenRejectModal(false)} color="inherit">Cancel</Button>
                    <Button onClick={handleRejectSubmit} variant="contained" color="error" disabled={decisionLoading || !rejectCustomReason || !rejectDoc}>
                        Confirm Reject
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Refer Modal */}
            <Dialog open={openReferModal} onClose={() => setOpenReferModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Refer Application</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Stack spacing={3}>
                        <TextField
                            fullWidth
                            label="Remarks (Optional)"
                            variant="outlined"
                            value={decisionRemarks}
                            onChange={e => setDecisionRemarks(e.target.value)}
                        />
                        <Box>
                            <Typography variant="caption" sx={{ display: 'block', mb: 1, fontWeight: 700 }}>Select User to Refer</Typography>
                            <select
                                value={selectedReferUser}
                                onChange={e => setSelectedReferUser(e.target.value)}
                                style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                            >
                                <option value="" disabled>Select user...</option>
                                {referralTargets.map(target => (
                                    <option key={target.id} value={target.id}>
                                        {target.full_name || target.name} ({target.role || `Role ${target.role_id}`})
                                    </option>
                                ))}
                            </select>
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenReferModal(false)} color="inherit">Cancel</Button>
                    <Button onClick={handleReferSubmit} variant="contained" color="warning" disabled={decisionLoading || !selectedReferUser}>
                        Confirm Refer
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Add Comment Dialog */}
            <Dialog open={openAddComment} onClose={() => setOpenAddComment(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 800, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>Add Comment</DialogTitle>
                <DialogContent sx={{ pt: 1 }}>
                    <TextField
                        autoFocus
                        fullWidth
                        multiline
                        rows={4}
                        label="Comment / Instructions"
                        variant="outlined"
                        value={commentText}
                        sx={{ mt: 2 }}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="e.g. Please provide a clear copy of the Aadhaar card..."
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setOpenAddComment(false)} color="inherit">Cancel</Button>
                    <Button onClick={handleSubmitComment} variant="contained" disabled={decisionLoading || !commentText.trim()}>
                        {decisionLoading ? <CircularProgress size={24} /> : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>

        <Dialog open={!!errorMsg} onClose={() => setErrorMsg('')} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' } }}>
            <DialogTitle sx={{ bgcolor: '#fef2f2', borderBottom: '1px solid #fecaca', p: 2, textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#991b1b' }}>Access Denied 🔒</Typography>
            </DialogTitle>
            <DialogContent sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" sx={{ color: '#334155', fontWeight: 600, lineHeight: 1.6 }}>
                    {errorMsg}
                </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2, justifyContent: 'center', bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                <Button onClick={() => setErrorMsg('')} variant="contained" color="error" sx={{ fontWeight: 800, borderRadius: 2, px: 4 }}>
                    Okay, Understood
                </Button>
            </DialogActions>
        </Dialog>

        {/* Notification Dialog */}
<Dialog
    open={openNotification}
    onClose={() => setOpenNotification(false)}
    maxWidth="sm"
    fullWidth
>
    <DialogTitle>Notifications</DialogTitle>

    <DialogContent>
        {notifications.length === 0 ? (
            <Typography>No notifications found.</Typography>
        ) : (
            <Stack spacing={1}>
                {notifications.map(n => (
                    <Alert key={n.id} severity="info">
                        <b>{n.case_number}</b><br />
                        {n.underwriter_remarks}
                    </Alert>
                ))}
            </Stack>
        )}
    </DialogContent>

    <DialogActions>
        <Button onClick={() => setOpenNotification(false)}>
            Close
        </Button>
    </DialogActions>
</Dialog>
        </Box>
    );
}
