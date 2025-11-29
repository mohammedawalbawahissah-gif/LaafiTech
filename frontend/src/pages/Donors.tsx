import React, { useState } from 'react';
import { Container, Grid, Card, CardContent, CardActions, Typography, Button, TextField, Box, Chip } from '@mui/material';

interface Donor {
  id: number;
  name: string;
  type: 'individual' | 'corporate' | 'ngo';
  totalContributed: number;
  campaignsSupported: number;
  location: string;
  interests: string[];
}

const Donors: React.FC = () => {
  const [donors] = useState<Donor[]>([
    {
      id: 1,
      name: 'Sarah Johnson',
      type: 'individual',
      totalContributed: 15000,
      campaignsSupported: 5,
      location: 'Nairobi, Kenya',
      interests: ['Education', 'Healthcare'],
    },
    {
      id: 2,
      name: 'TechCorp Solutions',
      type: 'corporate',
      totalContributed: 50000,
      campaignsSupported: 3,
      location: 'Nairobi, Kenya',
      interests: ['Distribution', 'Infrastructure'],
    },
    {
      id: 3,
      name: 'Global Women Foundation',
      type: 'ngo',
      totalContributed: 30000,
      campaignsSupported: 8,
      location: 'International',
      interests: ['Healthcare', 'Education', 'Awareness'],
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const getDonorTypeColor = (type: string) => {
    switch (type) {
      case 'individual':
        return 'info';
      case 'corporate':
        return 'success';
      case 'ngo':
        return 'warning';
      default:
        return 'default';
    }
  };

  const filteredDonors = donors.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Donors & Partners
      </Typography>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search donors by name or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          variant="outlined"
        />
      </Box>

      <Grid container spacing={3}>
        {filteredDonors.map((donor) => (
          <Grid item xs={12} sm={6} md={4} key={donor.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  {donor.name}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  {donor.location}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={donor.type.toUpperCase()}
                    color={getDonorTypeColor(donor.type) as any}
                    size="small"
                    variant="filled"
                  />
                </Box>

                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Total Contributed:</strong> ${donor.totalContributed.toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>Campaigns Supported:</strong> {donor.campaignsSupported}
                </Typography>

                <Typography variant="subtitle2" gutterBottom>
                  Interest Areas:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {donor.interests.map((interest) => (
                    <Chip key={interest} label={interest} size="small" variant="outlined" />
                  ))}
                </Box>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary">
                  View Profile
                </Button>
                <Button size="small" color="primary">
                  Contact
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredDonors.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="textSecondary">
            No donors found matching your search.
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Donors;
