import React, { useState } from 'react';
import { 
    Container, Typography, Box, TextField, FormControl, InputLabel, 
    MenuItem, Select, Button, CircularProgress, Paper, Card, 
    CardContent, Grid, Divider, List, ListItem, ListItemText
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { saveAs } from 'file-saver';

// Custom Theme
const theme = createTheme({
    palette: {
        primary: { main: '#532190' },
        secondary: { main: '#52379F' },
        background: { default: '#3498DB', paper: '#FFFFFF' },
        text: { primary: '#283590', secondary: '#000' }
    },
    typography: {
        fontFamily: 'Verdana',
        h4: { fontWeight: 700, letterSpacing: '-0.5px' }
    }
});

// 🔥 Backend URL (Vercel Compatible)
const API_URL = import.meta.env.VITE_API_URL;

function App() {
    const [activeTab, setActiveTab] = useState('generator');
    const [emailContent, setEmailContent] = useState('');
    const [instructions, setInstructions] = useState('');
    const [tone, setTone] = useState('');
    const [generatedReply, setGeneratedReply] = useState('');
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [promptHistory] = useState([
        { prompt: "Client project update", tone: "Professional", timestamp: new Date().toLocaleString() },
        { prompt: "Team collaboration", tone: "Friendly", timestamp: new Date().toLocaleString() },
        { prompt: "Sales pitch follow-up", tone: "Casual", timestamp: new Date().toLocaleString() }
    ]);
    const [stats, setStats] = useState({
        totalRepliesGenerated: 0,
        mostUsedTone: 'N/A',
        averageReplyLength: 0
    });

    async function handleSubmit() {
        setLoading(true);

        try {
            const response = await axios.post(`${API_URL}/api/email/generate`, {
                emailContent,
                instructions,
                tone
            });

            const newReply = response.data;
            setGeneratedReply(newReply);

            const newHistoryEntry = {
                originalEmail: emailContent,
                generatedReply: newReply,
                tone: tone || 'Unspecified',
                timestamp: new Date().toLocaleString()
            };

            setHistory(prev => [newHistoryEntry, ...prev].slice(0, 3));

            setStats(prev => ({
                totalRepliesGenerated: prev.totalRepliesGenerated + 1,
                mostUsedTone: tone || prev.mostUsedTone,
                averageReplyLength:
                    Math.round((prev.averageReplyLength * prev.totalRepliesGenerated + newReply.length) /
                    (prev.totalRepliesGenerated + 1))
            }));

            toast.success("Reply Generated Successfully");
        } catch (err) {
            toast.error("Generation Failed");
        } finally {
            setLoading(false);
        }
    }

    const handleDownload = () => {
        const blob = new Blob([generatedReply], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, "email_reply.txt");
        toast.success("Downloaded");
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedReply);
        toast.success("Copied to Clipboard");
    };

    return (
        <ThemeProvider theme={theme}>
            <Container maxWidth="lg" sx={{ py: 4, backgroundColor: theme.palette.background.default }}>
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>

                    <Typography variant="h4" align="center" gutterBottom>
                        Email Reply Generator
                    </Typography>

                    {/* Tabs */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                        <Button 
                            variant={activeTab === 'generator' ? 'contained' : 'outlined'}
                            onClick={() => setActiveTab('generator')}
                            sx={{ mr: 2 }}
                        >
                            Generator
                        </Button>
                        <Button
                            variant={activeTab === 'dashboard' ? 'contained' : 'outlined'}
                            onClick={() => setActiveTab('dashboard')}
                            sx={{ mr: 2 }}
                        >
                            Dashboard
                        </Button>
                        <Button
                            variant={activeTab === 'history' ? 'contained' : 'outlined'}
                            onClick={() => setActiveTab('history')}
                        >
                            History
                        </Button>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    {/* Generator */}
                    {activeTab === 'generator' && (
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6">Email Details</Typography>

                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={6}
                                            label="Original Email"
                                            value={emailContent}
                                            onChange={(e) => setEmailContent(e.target.value)}
                                            sx={{ mb: 2 }}
                                        />

                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={3}
                                            label="Instructions"
                                            value={instructions}
                                            onChange={(e) => setInstructions(e.target.value)}
                                            sx={{ mb: 2 }}
                                        />

                                        <FormControl fullWidth sx={{ mb: 2 }}>
                                            <InputLabel>Tone</InputLabel>
                                            <Select value={tone} label="Tone" onChange={(e) => setTone(e.target.value)}>
                                                <MenuItem value="Professional">Professional</MenuItem>
                                                <MenuItem value="Casual">Casual</MenuItem>
                                                <MenuItem value="Friendly">Friendly</MenuItem>
                                                <MenuItem value="Playful">Playful</MenuItem>
                                            </Select>
                                        </FormControl>

                                        <Button 
                                            fullWidth 
                                            variant="contained"
                                            onClick={handleSubmit}
                                            disabled={!emailContent || loading}
                                        >
                                            {loading ? <CircularProgress size={24} /> : "Generate Reply"}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                {generatedReply && (
                                    <Card>
                                        <CardContent>
                                            <Typography variant="h6">Generated Reply</Typography>

                                            <TextField
                                                fullWidth
                                                multiline
                                                rows={10}
                                                value={generatedReply}
                                                InputProps={{ readOnly: true }}
                                                sx={{ mb: 2 }}
                                            />

                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Button variant="contained" color="secondary" onClick={handleDownload}>
                                                    Download
                                                </Button>
                                                <Button variant="outlined" color="primary" onClick={handleCopy}>
                                                    Copy
                                                </Button>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                )}
                            </Grid>
                        </Grid>
                    )}

                </Paper>

                <ToastContainer position="bottom-right" autoClose={3000} theme="colored" />
            </Container>
        </ThemeProvider>
    );
}

export default App;
