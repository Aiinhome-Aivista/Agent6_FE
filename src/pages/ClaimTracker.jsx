import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Box, Typography, TextField, Button, CircularProgress, Paper, Grid, List, ListItem, ListItemIcon, ListItemText, Chip, Divider, Table, TableHead, TableRow, TableCell, TableBody, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Select, MenuItem, FormControl, InputLabel, Tooltip, Menu, Stack, Tabs, Tab, Card, TableContainer } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import api from '../api';
import { useAuth } from '../context/AuthContext';

// Helper to format currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
};

export default function ClaimTracker() {
  const { themeColors, darkMode } = useOutletContext();
  const { user } = useAuth();
  const isBroker = user?.role_id === 5;

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);
  const [claims, setClaims] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [aiSummary, setAiSummary] = useState('');


  const [allClaims, setAllClaims] = useState([]);
  const [fetchingAll, setFetchingAll] = useState(false);
  const [connectorAnchor, setConnectorAnchor] = useState(null);

  // CSV upload states
  const [openCsvDialog, setOpenCsvDialog] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvDragOver, setCsvDragOver] = useState(false);
  const [csvMessage, setCsvMessage] = useState(null);

  // Customer details dialog states
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [detailsTab, setDetailsTab] = useState(0);

  const fetchAllClaims = async () => {
    setFetchingAll(true);
    try {
      const resp = await api.get('/claim-tracker/all?limit=100');
      setAllClaims(resp.data);
    } catch (e) {
      console.error(e);
    } finally {
      setFetchingAll(false);
    }
  };

  useEffect(() => {
    if (!query.trim()) {
      fetchAllClaims();
    }
  }, [query]);

  const handleConnectorClick = (event) => {
    setConnectorAnchor(event.currentTarget);
  };

  const handleConnectorClose = () => {
    setConnectorAnchor(null);
  };


  const handleOpenCsvUploadOption = () => {
    handleConnectorClose();
    setOpenCsvDialog(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setCsvDragOver(true);
  };

  const handleDragLeave = () => {
    setCsvDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setCsvDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.csv')) {
        setCsvFile(file);
        setCsvMessage(null);
      } else {
        setCsvMessage({ type: 'error', text: 'Only CSV files (.csv) are supported!' });
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.name.endsWith('.csv')) {
        setCsvFile(file);
        setCsvMessage(null);
      } else {
        setCsvMessage({ type: 'error', text: 'Only CSV files (.csv) are supported!' });
      }
    }
  };

  const handleCsvUpload = async () => {
    if (!csvFile) return;
    setCsvLoading(true);
    setCsvMessage(null);
    const formData = new FormData();
    formData.append('file', csvFile);

    try {
      const res = await api.post('/claim-tracker/admin/upload-csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setCsvMessage({ type: 'success', text: `Successfully inserted ${res.data.records_inserted} claims!` });
      setCsvFile(null);
      fetchAllClaims();
    } catch (e) {
      console.error(e);
      setCsvMessage({
        type: 'error',
        text: 'Failed to upload CSV: ' + (e.response?.data?.detail || e.message)
      });
    } finally {
      setCsvLoading(false);
    }
  };

  const handleViewDetails = async (claim) => {
    const identifier = (claim.aadhaar && claim.aadhaar !== 'N/A') ? claim.aadhaar :
      (claim.pan && claim.pan !== 'N/A') ? claim.pan :
        claim.policy_no;
    if (!identifier) return;

    setDetailsLoading(true);
    setOpenDetailsDialog(true);
    setCustomerDetails(null);
    setDetailsTab(0);

    try {
      const resp = await api.get(`/claim-tracker/search?query=${encodeURIComponent(identifier)}`);
      setCustomerDetails(resp.data);
    } catch (e) {
      console.error(e);
      alert('Failed to load customer details.');
      setOpenDetailsDialog(false);
    } finally {
      setDetailsLoading(false);
    }
  };


  const handleSearch = async () => {
    if (!query.trim()) {
      fetchAllClaims();
      return;
    }
    setLoading(true);
    setError('');
    try {
      const resp = await api.get(`/claim-tracker/search?query=${encodeURIComponent(query)}`);
      const data = resp.data;
      setAllClaims(data.claims_history || []);
    } catch (e) {
      console.error(e);
      setError('Failed to fetch claim data. Please ensure the query is valid.');
    } finally {
      setLoading(false);
    }
  };

  const claimColumns = [
    { field: 'claim_id', headerName: 'Claim ID', flex: 1 },
    { field: 'company', headerName: 'Company', flex: 1 },
    { field: 'policy_no', headerName: 'Policy No.', flex: 1 },
    { field: 'claim_date', headerName: 'Date', flex: 1 },
    {
      field: 'amount',
      headerName: 'Amount',
      flex: 1,
      valueFormatter: (params) => formatCurrency(params.value)
    },
    { field: 'status', headerName: 'Status', flex: 1 },
    { field: 'risk_score', headerName: 'Risk', flex: 0.8 },
    { field: 'risk_flags', headerName: 'Flags', flex: 1.2 },
    { field: 'disease', headerName: 'Disease', flex: 1 },
    { field: 'hospital', headerName: 'Hospital', flex: 1 }
  ];

  const displayedClaims = allClaims.filter(c => {
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    return (
      (c.customer_name && String(c.customer_name).toLowerCase().includes(q)) ||
      (c.aadhaar && String(c.aadhaar).toLowerCase().includes(q)) ||
      (c.pan && String(c.pan).toLowerCase().includes(q)) ||
      (c.policy_no && String(c.policy_no).toLowerCase().includes(q)) ||
      (c.claim_id && String(c.claim_id).toLowerCase().includes(q)) ||
      (c.company && String(c.company).toLowerCase().includes(q)) ||
      (c.status && String(c.status).toLowerCase().includes(q)) ||
      (c.disease && String(c.disease).toLowerCase().includes(q)) ||
      (c.hospital && String(c.hospital).toLowerCase().includes(q))
    );
  });

  return (
    <Box sx={{ pb: 6 }}>
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: themeColors.border, bgcolor: themeColors.cardBg, color: themeColors.textPrimary, transition: 'all 0.2s ease' }}>
        <Box sx={{ p: 3, borderBottom: themeColors.border }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2} sx={{ width: '100%' }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: themeColors.textPrimary }}>
                Claim Tracker
              </Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap" sx={{ ml: 'auto' }}>
              <Tooltip title="Refresh Claims">
                <IconButton onClick={fetchAllClaims} disabled={fetchingAll || loading}
                  sx={{ color: '#FF5A14', bgcolor: '#FFF7F2', '&:hover': { bgcolor: 'rgba(255, 90, 20, 0.08)' }, width: 34, height: 34 }}>
                  <RefreshIcon sx={{ fontSize: 18, animation: fetchingAll ? 'spin 1s linear infinite' : 'none', '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }} />
                </IconButton>
              </Tooltip>

              {/* Search */}
              <TextField
                size="small"
                placeholder="Search by Aadhaar, PAN, Policy..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (!e.target.value) {
                    fetchAllClaims();
                  }
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                slotProps={{
                  input: {
                    startAdornment: <SearchIcon sx={{ mr: 0.5, color: themeColors.textSecondary, cursor: 'pointer' }} onClick={handleSearch} />
                  }
                }}
                sx={{
                  width: 280,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : '#f8fafc'
                  }
                }}
              />

              {!isBroker && (
                <Button
                  variant="contained"
                  endIcon={<ArrowDropDownIcon />}
                  onClick={handleConnectorClick}
                  sx={{
                    bgcolor: '#FF5A14',
                    color: '#fff',
                    fontWeight: 700,
                    borderRadius: 2,
                    height: 40,
                    px: 3,
                    '&:hover': { bgcolor: '#F56B2F' }
                  }}
                >
                  Connector
                </Button>
              )}
              <Menu
                anchorEl={connectorAnchor}
                open={Boolean(connectorAnchor)}
                onClose={handleConnectorClose}
                slotProps={{
                  paper: {
                    sx: {
                      bgcolor: themeColors.cardBg,
                      color: themeColors.textPrimary,
                      border: themeColors.border,
                      mt: 1,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                    }
                  }
                }}
              >
                <MenuItem onClick={handleOpenCsvUploadOption}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CloudUploadIcon fontSize="small" sx={{ color: themeColors.textSecondary }} />
                  </ListItemIcon>
                  <ListItemText primary="Upload .CSV" />
                </MenuItem>
              </Menu>
            </Stack>
          </Stack>
        </Box>

        {error && (
          <Box sx={{ p: 2, borderBottom: themeColors.border, bgcolor: '#fef2f2', color: '#ef4444' }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {error}
            </Typography>
          </Box>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: themeColors.tableHeadBg }}>
                {['Customer Name', 'Aadhaar', 'PAN', 'Previous Claims', 'Status', 'Assigned To'].map(h => (
                  <TableCell key={h} align="left" sx={{ fontWeight: 700, color: themeColors.tableHeadText, borderBottom: themeColors.tableCellBorder, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {fetchingAll || loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8, borderBottom: themeColors.tableCellBorder }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : displayedClaims.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8, color: themeColors.textSecondary, borderBottom: themeColors.tableCellBorder }}>
                    {query ? 'No claims match your search query.' : 'No claims found. Upload CSV claims to populate.'}
                  </TableCell>
                </TableRow>
              ) : (
                displayedClaims.map((c, idx) => (
                  <TableRow key={idx} hover sx={{ '&:hover': { bgcolor: `${themeColors.tableRowHover} !important` } }}>
                    <TableCell sx={{ fontWeight: 800, color: themeColors.textPrimary, borderBottom: themeColors.tableCellBorder }}>
                      {c.customer_name}
                    </TableCell>
                    <TableCell sx={{ color: themeColors.textSecondary, borderBottom: themeColors.tableCellBorder, fontFamily: 'monospace' }}>
                      {c.aadhaar || 'N/A'}
                    </TableCell>
                    <TableCell sx={{ color: themeColors.textSecondary, borderBottom: themeColors.tableCellBorder, fontFamily: 'monospace' }}>
                      {c.pan || 'N/A'}
                    </TableCell>
                    <TableCell sx={{ color: themeColors.textSecondary, borderBottom: themeColors.tableCellBorder }}>
                      {c.previous_claims && c.previous_claims !== 'None' ? 'Yes' : 'No'}
                    </TableCell>
                    <TableCell sx={{ borderBottom: themeColors.tableCellBorder }}>
                      {(() => {
                        const displayStatus = (c.status || 'Unknown').toUpperCase();
                        const chipColor = c.status === 'Approved' ? 'success' : c.status === 'Rejected' ? 'error' : (c.status === 'Pending' || c.status === 'On Hold' ? 'warning' : (c.status === 'Referred' ? 'secondary' : 'default'));
                        return (
                          <Chip
                            label={displayStatus} size="small"
                            color={chipColor}
                            sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                          />
                        );
                      })()}
                    </TableCell>
                    <TableCell sx={{ color: themeColors.textSecondary, borderBottom: themeColors.tableCellBorder, fontWeight: 500 }}>
                      {c.assigned_user || 'None'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Customer Details Dialog */}
      <Dialog
        open={openDetailsDialog}
        onClose={() => setOpenDetailsDialog(false)}
        maxWidth="lg"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              bgcolor: themeColors.cardBg,
              color: themeColors.textPrimary,
              borderRadius: 3,
              maxHeight: '90vh'
            }
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, borderBottom: themeColors.border, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Customer Overview & Risk Dossier
          <IconButton onClick={() => setOpenDetailsDialog(false)} sx={{ color: themeColors.textSecondary }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, overflowY: 'auto' }}>
          {detailsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
              <CircularProgress />
            </Box>
          ) : !customerDetails ? (
            <Typography>No customer details available.</Typography>
          ) : (() => {
            const allDocErrors = (customerDetails.claims_history || [])
              .filter(c => c.document_errors)
              .flatMap(c => {
                try {
                  const errs = typeof c.document_errors === 'string' ? JSON.parse(c.document_errors) : c.document_errors;
                  return Array.isArray(errs) ? errs.map(e => ({ claim_id: c.claim_id, error: e })) : [];
                } catch (err) {
                  return [];
                }
              });

            const allDecisions = (customerDetails.claims_history || [])
              .filter(c => c.decisions && c.decisions.length > 0)
              .flatMap(c => c.decisions.map(d => ({ ...d, claim_id: c.claim_id })))
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            return (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Tabs Selector */}
                <Tabs
                  value={detailsTab}
                  onChange={(e, val) => setDetailsTab(val)}
                  indicatorColor="primary"
                  textColor="primary"
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }}
                >
                  <Tab label="Overview" sx={{ fontWeight: 'bold', textTransform: 'none' }} />
                  <Tab label="ArangoDB (Aurango)" sx={{ fontWeight: 'bold', textTransform: 'none' }} />
                  <Tab label="OCR Extracted Text" sx={{ fontWeight: 'bold', textTransform: 'none' }} />
                  <Tab label="Vector DB (Chroma)" sx={{ fontWeight: 'bold', textTransform: 'none' }} />
                  <Tab label="Decisions & Audit Log" sx={{ fontWeight: 'bold', textTransform: 'none' }} />
                </Tabs>

                {/* TAB 0: OVERVIEW */}
                {detailsTab === 0 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Profile Card */}
                    <Paper
                      sx={{
                        p: 3,
                        bgcolor: themeColors.cardBg,
                        border: themeColors.border,
                        background: `linear-gradient(135deg, ${themeColors.cardBg} 0%, ${darkMode ? '#1e293b' : '#f3f4f6'} 100%)`
                      }}
                    >
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                        Customer Profile
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={4}>
                          <Chip label={`Name: ${customerDetails.customer_details.name}`} sx={{ bgcolor: themeColors.border, color: themeColors.textPrimary }} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <Chip label={`Aadhaar: ${customerDetails.customer_details.aadhaar}`} sx={{ bgcolor: themeColors.border, color: themeColors.textPrimary }} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <Chip label={`PAN: ${customerDetails.customer_details.pan}`} sx={{ bgcolor: themeColors.border, color: themeColors.textPrimary }} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <Chip label={`Policy: ${customerDetails.customer_details.policy_no}`} sx={{ bgcolor: themeColors.border, color: themeColors.textPrimary }} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <Chip label={`Risk Score: ${customerDetails.customer_details.risk_score}`} sx={{ bgcolor: '#fde68a', color: '#92400e' }} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <Chip label={`Fraud Probability: ${customerDetails.customer_details.fraud_probability}%`} sx={{ bgcolor: '#fecaca', color: '#7f1d1d' }} />
                        </Grid>
                      </Grid>
                    </Paper>

                    {/* Claims History */}
                    {customerDetails.claims_history && customerDetails.claims_history.length > 0 && (
                      <Box>
                        <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                          Claims History
                        </Typography>
                        <Paper sx={{ bgcolor: themeColors.cardBg, border: themeColors.border, p: 2 }}>
                          <Table size="small">
                            <TableHead sx={{ backgroundColor: themeColors.sidebarBg }}>
                              <TableRow>
                                {claimColumns.map(col => (
                                  <TableCell key={col.field} sx={{ color: themeColors.textPrimary, fontWeight: 600 }}>{col.headerName}</TableCell>
                                ))}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {customerDetails.claims_history.map((c, idx) => (
                                <TableRow key={idx} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                  {claimColumns.map(col => (
                                    <TableCell key={col.field} sx={{ color: themeColors.textSecondary }}>
                                      {col.field === 'amount' ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(c[col.field]) : c[col.field]}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Paper>
                      </Box>
                    )}

                    {/* AI Risk Analysis Summary */}
                    {customerDetails.ai_features && customerDetails.ai_features.risk_summary && (
                      <Box>
                        <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                          Underwriting AI Summary
                        </Typography>
                        <Paper sx={{ p: 3, bgcolor: themeColors.cardBg, border: themeColors.border, lineHeight: 1.7 }}>
                          <Typography>{customerDetails.ai_features.risk_summary}</Typography>
                        </Paper>
                      </Box>
                    )}

                    {/* Underwriting Cases Details */}
                    {customerDetails.claims_history && customerDetails.claims_history.some(c => c.claim_id.startsWith('CASE-')) && (
                      <Box>
                        <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                          Active Underwriting Case Details
                        </Typography>
                        <Paper sx={{ p: 2, bgcolor: themeColors.cardBg, border: themeColors.border }}>
                          <Stack spacing={2}>
                            {customerDetails.claims_history
                              .filter(c => c.claim_id.startsWith('CASE-'))
                              .map((c, idx) => (
                                <Box key={idx} sx={{ p: 2, bgcolor: themeColors.sidebarBg, borderRadius: 2 }}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#FF5A14' }}>
                                    Case: {c.claim_id}
                                  </Typography>
                                  <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6} md={3}>
                                      <Typography variant="caption" sx={{ color: themeColors.textSecondary, display: 'block' }}>Priority</Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{c.priority || 'Medium'}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                      <Typography variant="caption" sx={{ color: themeColors.textSecondary, display: 'block' }}>SLA Due Date</Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{c.sla_due_at || 'N/A'}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={6}>
                                      <Typography variant="caption" sx={{ color: themeColors.textSecondary, display: 'block' }}>Declared Existing Policies</Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{c.existing_policy_details || 'None'}</Typography>
                                    </Grid>
                                  </Grid>
                                </Box>
                              ))}
                          </Stack>
                        </Paper>
                      </Box>
                    )}
                  </Box>
                )}

                {/* TAB 1: ARANGODB (AURANGO) */}
                {detailsTab === 1 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Aurango Knowledge Graph Nodes & Relations
                    </Typography>

                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Extracted Graph Entities (Nodes)</Typography>
                        <Paper sx={{ p: 2, bgcolor: themeColors.cardBg, border: themeColors.border, maxHeight: 300, overflowY: 'auto' }}>
                          {customerDetails.arango_data && customerDetails.arango_data.nodes.length > 0 ? (
                            <List dense>
                              {customerDetails.arango_data.nodes.map((node, nIdx) => (
                                <ListItem key={nIdx} divider={nIdx !== customerDetails.arango_data.nodes.length - 1}>
                                  <ListItemText
                                    primary={node.id}
                                    secondary={`Type: ${node.label} | Properties: ${JSON.stringify(node.properties)}`}
                                    primaryTypographyProps={{ fontWeight: 'bold' }}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          ) : (
                            <Typography variant="body2" sx={{ color: themeColors.textSecondary, fontStyle: 'italic', p: 1 }}>No graph nodes found.</Typography>
                          )}
                        </Paper>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Extracted Graph Relations (Edges)</Typography>
                        <Paper sx={{ p: 2, bgcolor: themeColors.cardBg, border: themeColors.border, maxHeight: 300, overflowY: 'auto' }}>
                          {customerDetails.arango_data && customerDetails.arango_data.edges.length > 0 ? (
                            <List dense>
                              {customerDetails.arango_data.edges.map((edge, eIdx) => (
                                <ListItem key={eIdx} divider={eIdx !== customerDetails.arango_data.edges.length - 1}>
                                  <ListItemText
                                    primary={`${edge.from_id} ➔ [${edge.type}] ➔ ${edge.to_id}`}
                                    primaryTypographyProps={{ fontFamily: 'monospace', color: '#FF5A14', fontWeight: 'bold' }}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          ) : (
                            <Typography variant="body2" sx={{ color: themeColors.textSecondary, fontStyle: 'italic', p: 1 }}>No graph edges found.</Typography>
                          )}
                        </Paper>
                      </Grid>
                    </Grid>

                    {/* Vis.js Interactive HTML Graph rendering */}
                    {customerDetails.case_ids && customerDetails.case_ids.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, color: themeColors.textPrimary }}>
                          Interactive Graph Visualizer (Vis.js iframe)
                        </Typography>
                        {customerDetails.case_ids.map(caseId => (
                          <Box key={caseId} sx={{ mb: 4 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#FF5A14' }}>
                              Underwriting Graph for Case: CASE-{caseId}
                            </Typography>
                            <iframe
                              src={`http://127.0.0.1:8000/static_graphs/case_${caseId}_graph.html`}
                              style={{
                                width: '100%',
                                height: '450px',
                                border: '1px solid rgba(0,0,0,0.1)',
                                borderRadius: '12px',
                                backgroundColor: '#0f172a'
                              }}
                              title={`Graph Visualizer Case ${caseId}`}
                            />
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                )}

                {/* TAB 2: OCR EXTRACTED TEXT */}
                {detailsTab === 2 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      OCR Document Contents & Verification Status
                    </Typography>

                    {/* Supporting Documents */}
                    {customerDetails.documents && customerDetails.documents.length > 0 ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Paper sx={{ p: 2, bgcolor: themeColors.cardBg, border: themeColors.border }}>
                          <List dense>
                            {customerDetails.documents.map((doc, idx) => (
                              <ListItem key={idx} sx={{ borderBottom: idx !== customerDetails.documents.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}>
                                <ListItemIcon>
                                  <InsertDriveFileIcon sx={{ color: themeColors.textSecondary }} />
                                </ListItemIcon>
                                <ListItemText
                                  primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{doc.file_name}</Typography>
                                      <Chip
                                        label={doc.verification_status || 'Pending'}
                                        size="small"
                                        color={doc.verification_status === 'Verified' ? 'success' : doc.verification_status === 'Rejected' ? 'error' : 'warning'}
                                        sx={{ height: 18, fontSize: '0.65rem', fontWeight: 'bold' }}
                                      />
                                    </Box>
                                  }
                                  secondary={
                                    <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>
                                      Type: {doc.doc_type} | Source: {doc.file_path === 'INTERNAL_DB' ? 'Claims Ledger' : doc.file_path === 'CSV_RECORD' ? 'CSV Ingest' : 'External Partner Portal'}
                                    </Typography>
                                  }
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Paper>

                        {/* Document Validation Errors */}
                        {allDocErrors.length > 0 && (
                          <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: '#ef4444' }}>
                              Document Validation Checklist Errors
                            </Typography>
                            <Paper sx={{ p: 2, bgcolor: darkMode ? '#3b0712' : '#fef2f2', border: '1px solid #fca5a5', borderRadius: 2 }}>
                              {allDocErrors.map((err, idx) => (
                                <Typography key={idx} variant="body2" sx={{ color: '#b91c1c', mb: idx !== allDocErrors.length - 1 ? 1 : 0, fontWeight: 500 }}>
                                  • <strong>{err.claim_id}:</strong> {err.error}
                                </Typography>
                              ))}
                            </Paper>
                          </Box>
                        )}

                        {/* Document OCR Text View */}
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>OCR Text Contents</Typography>
                          <Stack spacing={2}>
                            {customerDetails.documents.map((doc, idx) => (
                              <Box key={idx}>
                                <Typography variant="caption" sx={{ fontWeight: 'bold', color: themeColors.textPrimary }}>
                                  File: {doc.file_name}
                                </Typography>
                                {doc.raw_text ? (
                                  <Paper sx={{ p: 2, mt: 0.5, bgcolor: darkMode ? '#1e293b' : '#f8fafc', border: themeColors.border, maxHeight: 250, overflowY: 'auto' }}>
                                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '0.8rem', fontFamily: 'monospace', color: themeColors.textSecondary }}>
                                      {doc.raw_text}
                                    </pre>
                                  </Paper>
                                ) : (
                                  <Typography variant="caption" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic', color: themeColors.textSecondary }}>
                                    (No OCR text extracted or indexed for this historical document)
                                  </Typography>
                                )}
                              </Box>
                            ))}
                          </Stack>
                        </Box>
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ color: themeColors.textSecondary }}>No documents uploaded.</Typography>
                    )}
                  </Box>
                )}

                {/* TAB 3: VECTOR DB (CHROMA) */}
                {detailsTab === 3 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Vector DB (ChromaDB) Retained Document Chunks
                    </Typography>

                    {customerDetails.chroma_data && customerDetails.chroma_data.length > 0 ? (
                      <Stack spacing={2}>
                        {customerDetails.chroma_data.map((chunk, idx) => (
                          <Paper key={idx} sx={{ p: 2, bgcolor: themeColors.cardBg, border: themeColors.border }}>
                            <Typography variant="caption" sx={{ color: '#FF5A14', fontWeight: 'bold', display: 'block', mb: 1 }}>
                              Chunk ID: {chunk.id} | Metadata: {JSON.stringify(chunk.metadata)}
                            </Typography>
                            <Typography variant="body2" sx={{ color: themeColors.textSecondary, fontFamily: 'monospace', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                              "{chunk.text}"
                            </Typography>
                          </Paper>
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="body2" sx={{ color: themeColors.textSecondary, fontStyle: 'italic' }}>
                        No document chunks found in ChromaDB vector store.
                      </Typography>
                    )}
                  </Box>
                )}

                {/* TAB 4: DECISIONS & AUDIT LOG */}
                {detailsTab === 4 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Underwriting Decisions Timeline & Audit Log
                    </Typography>

                    {allDecisions.length > 0 ? (
                      <Paper sx={{ p: 2, bgcolor: themeColors.cardBg, border: themeColors.border }}>
                        <Stack spacing={2}>
                          {allDecisions.map((dec, idx) => (
                            <Box key={idx} sx={{ p: 2, bgcolor: themeColors.sidebarBg, borderRadius: 2, borderLeft: '4px solid', borderLeftColor: dec.decision.toLowerCase() === 'approve' ? '#10b981' : dec.decision.toLowerCase() === 'reject' ? '#ef4444' : '#f59e0b' }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                  {dec.claim_id} — {dec.decision.toUpperCase()}
                                </Typography>
                                <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>
                                  {dec.created_at}
                                </Typography>
                              </Box>
                              <Typography variant="body2" sx={{ color: themeColors.textSecondary, mb: 1 }}>
                                Remarks: "{dec.remarks}"
                              </Typography>
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                Logged by: Underwriter ({dec.username})
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      </Paper>
                    ) : (
                      <Typography variant="body2" sx={{ color: themeColors.textSecondary, fontStyle: 'italic' }}>
                        No underwriting decisions logged yet.
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            );
          })()}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: themeColors.border }}>
          <Button onClick={() => setOpenDetailsDialog(false)} variant="contained" sx={{ bgcolor: '#FF5A14', color: '#fff', '&:hover': { bgcolor: '#F56B2F' } }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>


      {/* CSV Upload Dialog */}
      <Dialog
        open={openCsvDialog}
        onClose={() => { setOpenCsvDialog(false); setCsvFile(null); setCsvMessage(null); }}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              bgcolor: themeColors.cardBg,
              color: themeColors.textPrimary,
              borderRadius: 3
            }
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, borderBottom: themeColors.border, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Upload Historical Claims CSV
          <IconButton onClick={() => { setOpenCsvDialog(false); setCsvFile(null); setCsvMessage(null); }} sx={{ color: themeColors.textSecondary }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              sx={{
                border: '2px dashed',
                borderColor: csvDragOver ? '#FF5A14' : themeColors.textSecondary,
                borderRadius: 3,
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: csvDragOver ? 'rgba(37, 99, 235, 0.05)' : 'transparent',
                transition: 'all 0.2s ease'
              }}
              onClick={() => document.getElementById('csv-file-input').click()}
            >
              <input
                type="file"
                id="csv-file-input"
                accept=".csv"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <CloudUploadIcon sx={{ fontSize: 48, color: '#FF5A14', mb: 2 }} />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {csvFile ? csvFile.name : 'Drag & Drop CSV File here or Click to Browse'}
              </Typography>
              <Typography variant="caption" sx={{ color: themeColors.textSecondary, display: 'block', mt: 1 }}>
                Supports only standard .csv files
              </Typography>
            </Box>

            {csvMessage && (
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: csvMessage.type === 'success' ? (darkMode ? '#14532d' : '#dcfce7') : (darkMode ? '#7f1d1d' : '#fee2e2'),
                  color: csvMessage.type === 'success' ? (darkMode ? '#4ade80' : '#15803d') : (darkMode ? '#f87171' : '#b91c1c'),
                  fontWeight: 500,
                  fontSize: '0.875rem'
                }}
              >
                {csvMessage.text}
              </Box>
            )}

            {csvFile && (
              <Button
                variant="contained"
                onClick={handleCsvUpload}
                disabled={csvLoading}
                sx={{
                  bgcolor: '#FF5A14',
                  color: '#fff',
                  fontWeight: 600,
                  borderRadius: 2,
                  py: 1,
                  '&:hover': { bgcolor: '#F56B2F' }
                }}
              >
                {csvLoading ? <CircularProgress size={24} color="inherit" /> : 'Ingest Claims CSV'}
              </Button>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: themeColors.border }}>
          <Button onClick={() => { setOpenCsvDialog(false); setCsvFile(null); setCsvMessage(null); }} variant="outlined" sx={{ borderRadius: 2 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
