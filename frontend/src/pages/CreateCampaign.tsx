import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextareaAutosize,
  Grid,
} from '@mui/material';

const CreateCampaign: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    community: '',
    description: '',
    goal: '',
    duration: '90',
    targetBeneficiaries: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target as HTMLInputElement;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle campaign creation
    console.log('Creating campaign:', formData);
    navigate('/campaigns');
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button onClick={() => navigate('/campaigns')} sx={{ mb: 2 }}>
        ← Back to Campaigns
      </Button>

      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Create New Campaign
      </Typography>

      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Campaign Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Period Products Distribution Drive"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Target Community</InputLabel>
                  <Select
                    name="community"
                    value={formData.community}
                    onChange={handleChange}
                    label="Target Community"
                  >
                    <MenuItem value="">Select a community</MenuItem>
                    <MenuItem value="nairobi-east">Nairobi East</MenuItem>
                    <MenuItem value="kisumu">Kisumu</MenuItem>
                    <MenuItem value="mombasa">Mombasa</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Funding Goal"
                  name="goal"
                  type="number"
                  value={formData.goal}
                  onChange={handleChange}
                  required
                  placeholder="50000"
                  InputProps={{
                    startAdornment: '$',
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Duration (days)"
                  name="duration"
                  type="number"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Target Beneficiaries"
                  name="targetBeneficiaries"
                  type="number"
                  value={formData.targetBeneficiaries}
                  onChange={handleChange}
                  required
                  placeholder="500"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Campaign Description
                </Typography>
                <TextareaAutosize
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  minRows={4}
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontFamily: 'Arial',
                    fontSize: '14px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                  }}
                  placeholder="Describe the campaign, its goals, and impact..."
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button onClick={() => navigate('/campaigns')} variant="outlined">
                    Cancel
                  </Button>
                  <Button type="submit" variant="contained" color="primary">
                    Create Campaign
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CreateCampaign;
