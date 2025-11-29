import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';

const CampaignDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Mock campaign data
  const campaign = {
    id,
    title: 'Period Products Distribution Drive',
    community: 'Nairobi East Community',
    goal: 50000,
    raised: 35000,
    status: 'active',
    description: 'This campaign aims to provide menstrual pads to 500 girls in underserved areas of Nairobi East.',
    longDescription:
      'Many girls in Nairobi East miss school during their menstrual cycle due to lack of access to menstrual products. This campaign aims to distribute quality period pads to 500 girls and provide health education about menstrual hygiene.',
    targetBeneficiaries: 500,
    duration: '90 days',
    startDate: '2025-01-15',
    endDate: '2025-04-15',
    updates: [
      { date: '2025-01-20', title: 'Campaign Launch', description: 'Successfully launched the campaign' },
      { date: '2025-01-25', title: 'First Donation', description: '$5,000 donated by Corporate Partner XYZ' },
    ],
  };

  const percentage = (campaign.raised / campaign.goal) * 100;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button onClick={() => navigate('/campaigns')} sx={{ mb: 2 }}>
        ← Back to Campaigns
      </Button>

      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
        {campaign.title}
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Chip label={campaign.status.toUpperCase()} color="success" />
        <Chip label={`${campaign.targetBeneficiaries} Beneficiaries`} variant="outlined" />
        <Chip label={campaign.duration} variant="outlined" />
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Campaign Overview
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {campaign.community}
              </Typography>
              <Typography variant="body1" paragraph>
                {campaign.longDescription}
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Funding Progress
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">
                    Raised: ${campaign.raised.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="primary">
                    {percentage.toFixed(0)}%
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={percentage} />
              </Box>
              <Typography variant="body2" color="textSecondary">
                Goal: ${campaign.goal.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Campaign Updates
              </Typography>
              <List>
                {campaign.updates.map((update, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemText
                        primary={update.title}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="textPrimary">
                              {update.date}
                            </Typography>
                            {' — '}
                            {update.description}
                          </>
                        }
                      />
                    </ListItem>
                    {index < campaign.updates.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Campaign Details
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Start Date
                </Typography>
                <Typography variant="body1">{campaign.startDate}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  End Date
                </Typography>
                <Typography variant="body1">{campaign.endDate}</Typography>
              </Box>
              <Button fullWidth variant="contained" color="primary" sx={{ mb: 1 }}>
                Donate Now
              </Button>
              <Button fullWidth variant="outlined" color="primary">
                Share Campaign
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CampaignDetail;
