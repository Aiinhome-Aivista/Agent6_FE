import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Card, Stack, TextField, IconButton, Avatar, Chip
} from '@mui/material';
import { useOutletContext } from 'react-router-dom';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import SendIcon from '@mui/icons-material/Send';
import api from '../api';

const formatChatMessage = (text, role, darkMode, themeColors) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
        if (!line.trim()) return <Box key={i} sx={{ height: 12 }} />;
        const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
        const cleanLine = isBullet ? line.trim().substring(2) : line;
        const parts = cleanLine.split(/(\*\*.*?\*\*|\[Source Document:.*?\])/g);

        return (
            <Box key={i} sx={{ display: 'flex', mb: 0.5 }}>
                {isBullet && (
                    <Box component="span" sx={{ mr: 1, fontSize: '1.2rem', color: role === 'user' ? '#fff' : '#FF7A45', mt: '-4px' }}>•</Box>
                )}
                <Typography sx={{ fontSize: '0.95rem', fontWeight: role === 'user' ? 600 : 500, lineHeight: 1.6, color: role === 'user' ? '#ffffff' : themeColors.textPrimary, display: 'inline' }}>
                    {parts.map((part, j) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={j} style={{ fontWeight: 800 }}>{part.slice(2, -2)}</strong>;
                        }
                        if (part.startsWith('[Source Document:') && part.endsWith(']')) {
                            const fileName = part.slice(17, -1).trim();
                            return (
                                <Chip
                                    key={j}
                                    label={fileName}
                                    size="small"
                                    sx={{ ml: 0.5, mr: 0.5, height: 20, fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', bgcolor: darkMode ? '#334155' : '#e2e8f0', color: darkMode ? '#94a3b8' : '#475569' }}
                                    onClick={() => window.open(`http://122.163.121.176:3029/uploads/${fileName}`, '_blank')}
                                />
                            );
                        }
                        return <span key={j}>{part}</span>;
                    })}
                </Typography>
            </Box>
        );
    });
};

export default function RagChat() {
    const { themeColors, darkMode } = useOutletContext();
    const [cases, setCases] = useState([]);
    const [selectedCase, setSelectedCase] = useState(null);
    const [chatMessages, setChatMessages] = useState([
        { role: 'assistant', content: 'Hello! I am your AI Underwriting Assistant. Ask me anything about the uploaded patient files.' }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [chatSending, setChatSending] = useState(false);

    useEffect(() => {
        const fetchCases = async () => {
            try {
                const r = await api.get('/cases/');
                setCases(r.data);
            } catch (e) {
                console.error(e);
            }
        };
        fetchCases();
    }, []);

    useEffect(() => {
        if (selectedCase) {
            setChatMessages([
                { role: 'assistant', content: `Hello! I am your AI Underwriting Assistant. Ask me anything about the uploaded patient files for ${selectedCase.applicant_name}.` }
            ]);
            setChatInput('');
        }
    }, [selectedCase]);

    const handleSendChatMessage = async (msgText = null) => {
        const textToSend = msgText || chatInput;
        if (!textToSend.trim() || !selectedCase || chatSending) return;

        const newMsg = { role: 'user', content: textToSend };
        setChatMessages(prev => [...prev, newMsg]);
        if (!msgText) setChatInput('');
        setChatSending(true);

        try {
            const res = await api.post(`/cases/${selectedCase.id}/chat`, {
                message: textToSend,
                history: chatMessages
            });
            setChatMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
        } catch (err) {
            console.error(err);
            setChatMessages(prev => [...prev, { role: 'assistant', content: 'Failed to get a response from the AI. Please verify the API status.' }]);
        } finally {
            setChatSending(false);
        }
    };

    return (
        <Card sx={{ borderRadius: 4, border: themeColors.border, bgcolor: themeColors.cardBg, color: themeColors.textPrimary, minHeight: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 3, borderBottom: themeColors.border, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: themeColors.textPrimary, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PsychologyIcon sx={{ color: '#FF7A45' }} />
                        AI RAG Document Chat
                    </Typography>
                    <Typography variant="caption" sx={{ color: themeColors.textSecondary, fontWeight: 600 }}>
                        Select an underwriting case below to chat with its specific medical documents.
                    </Typography>
                </Box>
                <select
                    value={selectedCase?.id || ''}
                    onChange={(e) => {
                        const caseObj = cases.find(c => c.id === parseInt(e.target.value));
                        setSelectedCase(caseObj || null);
                    }}
                    style={{
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                        background: darkMode ? '#1f2937' : '#ffffff',
                        color: darkMode ? '#f8fafc' : '#1e293b',
                        fontWeight: 700,
                        minWidth: '300px',
                        outline: 'none',
                        cursor: 'pointer'
                    }}
                >
                    <option value="">-- Select an Active Case --</option>
                    {cases.map(c => (
                        <option key={c.id} value={c.id}>{c.case_number} - {c.applicant_name}</option>
                    ))}
                </select>
            </Box>

            {selectedCase ? (
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 4, bgcolor: darkMode ? '#111827' : '#f8fafc' }}>
                    <Box sx={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3, mb: 3, pr: 2 }}>
                        {chatMessages.map((msg, idx) => (
                            <Box key={idx} sx={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 2 }}>
                                {msg.role !== 'user' && (
                                    <Avatar sx={{ bgcolor: '#FF7A45', width: 40, height: 40, boxShadow: '0 4px 10px rgba(124,58,237,0.3)' }}>
                                        <SmartToyIcon fontSize="small" />
                                    </Avatar>
                                )}
                                <Box sx={{
                                    maxWidth: '75%', p: 2.5,
                                    borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                    bgcolor: msg.role === 'user' ? '#FF5A14' : (darkMode ? '#1f2937' : '#ffffff'),
                                    color: msg.role === 'user' ? '#ffffff' : themeColors.textPrimary,
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: msg.role === 'user' ? 'none' : themeColors.border
                                }}>
                                    <Box>
                                        {formatChatMessage(msg.content, msg.role, darkMode, themeColors)}
                                    </Box>
                                </Box>
                                {msg.role === 'user' && (
                                    <Avatar sx={{ bgcolor: '#FF5A14', width: 40, height: 40, boxShadow: '0 4px 10px rgba(37,99,235,0.3)' }}>
                                        <PersonIcon fontSize="small" />
                                    </Avatar>
                                )}
                            </Box>
                        ))}
                        {chatSending && (
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                <Avatar sx={{ bgcolor: '#FF7A45', width: 40, height: 40, boxShadow: '0 4px 10px rgba(124,58,237,0.3)' }}>
                                    <SmartToyIcon fontSize="small" />
                                </Avatar>
                                <Box sx={{ p: 2, borderRadius: '20px 20px 20px 4px', bgcolor: darkMode ? '#1f2937' : '#ffffff', border: themeColors.border, minWidth: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                        {[0, 1, 2].map((i) => (
                                            <Box
                                                key={i}
                                                sx={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: '50%',
                                                    bgcolor: '#FF7A45',
                                                    animation: 'chatBounce 1.4s infinite ease-in-out both',
                                                    animationDelay: `${i * 0.16}s`,
                                                    '@keyframes chatBounce': {
                                                        '0%, 80%, 100%': { transform: 'scale(0)', opacity: 0.5 },
                                                        '40%': { transform: 'scale(1)', opacity: 1 }
                                                    }
                                                }}
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            </Box>
                        )}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                        <Chip label="Summarize Medical History" onClick={() => handleSendChatMessage("Summarize the patient's medical history and current conditions.")} disabled={chatSending} clickable sx={{ bgcolor: darkMode ? '#1f2937' : '#ffffff', color: themeColors.textPrimary, border: themeColors.border, fontWeight: 700, '&:hover': { bgcolor: '#f1f5f9' } }} />
                        <Chip label="Any Critical Findings?" onClick={() => handleSendChatMessage("Are there any critical risk factors or anomalies in these documents?")} disabled={chatSending} clickable sx={{ bgcolor: darkMode ? '#1f2937' : '#ffffff', color: themeColors.textPrimary, border: themeColors.border, fontWeight: 700, '&:hover': { bgcolor: '#f1f5f9' } }} />
                        <Chip label="Check Blood Pressure & BMI" onClick={() => handleSendChatMessage("What are the blood pressure and BMI readings?")} disabled={chatSending} clickable sx={{ bgcolor: darkMode ? '#1f2937' : '#ffffff', color: themeColors.textPrimary, border: themeColors.border, fontWeight: 700, '&:hover': { bgcolor: '#f1f5f9' } }} />
                    </Box>

                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <TextField
                            fullWidth placeholder={`Message AI Assistant about ${selectedCase.applicant_name}...`} value={chatInput}
                            onChange={e => setChatInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && chatInput.trim() && !chatSending) handleSendChatMessage(); }} disabled={chatSending}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 8,
                                    bgcolor: darkMode ? '#1f2937' : '#ffffff',
                                    color: themeColors.textPrimary,
                                    py: 0.5,
                                    px: 1,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                    '& fieldset': { borderColor: darkMode ? '#334155' : '#e2e8f0', borderWidth: 2 }
                                }
                            }}
                        />
                        <IconButton
                            onClick={() => handleSendChatMessage()}
                            disabled={!chatInput.trim() || chatSending}
                            sx={{
                                bgcolor: '#FF7A45',
                                color: '#ffffff',
                                width: 56,
                                height: 56,
                                borderRadius: 4,
                                boxShadow: '0 4px 12px rgba(124,58,237,0.4)',
                                '&:hover': { bgcolor: '#6d28d9' },
                                '&.Mui-disabled': { bgcolor: darkMode ? '#334155' : '#e2e8f0', color: darkMode ? '#64748b' : '#94a3b8' }
                            }}
                        >
                            <SendIcon sx={{ fontSize: 26, ml: 0.5 }} />
                        </IconButton>
                    </Stack>
                </Box>
            ) : (
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', p: 10, textAlign: 'center', bgcolor: darkMode ? '#111827' : '#f8fafc' }}>
                    <PsychologyIcon sx={{ fontSize: 100, color: darkMode ? '#334155' : '#cbd5e1', mb: 3 }} />
                    <Typography variant="h5" sx={{ color: themeColors.textPrimary, fontWeight: 800 }}>Select a Case to Start Chatting</Typography>
                    <Typography variant="body1" sx={{ color: themeColors.textSecondary, mt: 1.5, maxWidth: 500, lineHeight: 1.6 }}>
                        The AI RAG (Retrieval-Augmented Generation) system allows you to ask natural language questions directly against the applicant's raw medical documents, clinical notes, and policy rulebooks.
                    </Typography>
                </Box>
            )}
        </Card>
    );
}
