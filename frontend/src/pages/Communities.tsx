import React, { useState } from 'react';
import { Container, Grid, Card, CardContent, CardActions, Typography, Button, TextField, Box, Chip } from '@mui/material';

interface Community {
  id: number;
  name: string;
  region: string;
  population: number;
  needLevel: 'critical' | 'high' | 'moderate';
  programs: string[];
}

const Communities: React.FC = () => {
  const [communities] = useState<Community[]>([
    {
      id: 1,
      name: 'Nairobi East Community',
      region: 'Nairobi',
      population: 5200,
      needLevel: 'critical',
      programs: ['Education', 'Healthcare'],
    },
    {
      id: 2,
      name: 'Kisumu Women Group',
      region: 'Kisumu',
      population: 3800,
      needLevel: 'high',
      programs: ['Distribution', 'Awareness'],
    },
    {
      id: 3,
      name: 'Mombasa Rural Initiative',
      region: 'Mombasa',
      population: 2400,
      needLevel: 'high',
      programs: ['Healthcare', 'Education'],
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const getNeedColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'moderate':
        return 'success';
      default:
        return 'default';
    }
  };

  const filteredCommunities = communities.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Communities
      </Typography>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search communities by name or region..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          variant="outlined"
        />
      </Box>

      <Grid container spacing={3}>
        {filteredCommunities.map((community) => (
          <Grid item xs={12} sm={6} md={4} key={community.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  {community.name}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  {community.region}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Population: {community.population.toLocaleString()}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={`Need Level: ${community.needLevel.toUpperCase()}`}
                    color={getNeedColor(community.needLevel) as any}
                    variant="outlined"
                    size="small"
                  />
                </Box>
                <Typography variant="subtitle2" gutterBottom>
                  Active Programs:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {community.programs.map((program) => (
                    <Chip key={program} label={program} size="small" variant="filled" />
                  ))}
                </Box>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary">
                  View Details
                </Button>
                <Button size="small" color="primary">
                  Create Campaign
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredCommunities.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="textSecondary">
            No communities found matching your search.
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Communities;
