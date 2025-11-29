import React, { useState } from 'react';
import { Container, Grid, Card, CardContent, CardActions, Typography, Button, Box, LinearProgress, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface Campaign {
  id: number;
  title: string;
  community: string;
  goal: number;
  raised: number;
  status: 'active' | 'completed' | 'upcoming';
  description: string;
  targetBeneficiaries: number;
}

const Campaigns: React.FC = () => {
  const navigate = useNavigate();
  const [campaigns] = useState<Campaign[]>([
    {
      id: 1,
      title: 'Period Products Distribution Drive',
      community: 'Nairobi East',
      goal: 50000,
      raised: 35000,
      status: 'active',
      description: 'Providing menstrual pads to 500 girls in underserved areas',
      targetBeneficiaries: 500,
    },
    {
      id: 2,
      title: 'Healthcare Awareness Program',
      community: 'Kisumu',
      goal: 30000,
      raised: 30000,
      status: 'completed',
      description: 'Training health workers on menstrual health management',
      targetBeneficiaries: 200,
    },
    {
      id: 3,
      title: 'School Infrastructure Support',
      community: 'Mombasa',
      goal: 75000,
      raised: 0,
      status: 'upcoming',
      description: 'Building sanitation facilities in schools',
      targetBeneficiaries: 1000,
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'completed':
        return 'info';
      case 'upcoming':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleViewCampaign = (id: number) => {
    navigate(`/campaigns/${id}`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Campaigns
        </Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/create-campaign')}>
          Create Campaign
        </Button>
      </Box>

      <Grid container spacing={3}>
        {campaigns.map((campaign) => {
          const percentage = (campaign.raised / campaign.goal) * 100;
          return (
            <Grid item xs={12} md={6} key={campaign.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {campaign.title}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    {campaign.community}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {campaign.description}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">
                        ${campaign.raised.toLocaleString()} / ${campaign.goal.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="primary">
                        {percentage.toFixed(0)}%
                      </Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={percentage} />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    <Chip
                      label={campaign.status.toUpperCase()}
                      color={getStatusColor(campaign.status) as any}
                      size="small"
                      variant="filled"
                    />
                    <Chip
                      label={`${campaign.targetBeneficiaries} beneficiaries`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => handleViewCampaign(campaign.id)}
                  >
                    View Details
                  </Button>
                  {campaign.status === 'active' && (
                    <Button size="small" color="primary">
                      Donate
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
};

export default Campaigns;
