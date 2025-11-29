import React from 'react';
import { Box, Container, Grid, Paper, Typography, Card, CardContent, Button } from '@mui/material';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard: React.FC = () => {
  // Sample data for charts
  const campaignData = [
    { month: 'Jan', campaigns: 5, funding: 15000 },
    { month: 'Feb', campaigns: 8, funding: 22000 },
    { month: 'Mar', campaigns: 12, funding: 35000 },
    { month: 'Apr', campaigns: 15, funding: 48000 },
    { month: 'May', campaigns: 20, funding: 62000 },
  ];

  const communityData = [
    { name: 'Healthcare Access', value: 35 },
    { name: 'Education Support', value: 25 },
    { name: 'Product Distribution', value: 40 },
  ];

  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1'];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Campaigns
              </Typography>
              <Typography variant="h5">42</Typography>
              <Typography color="primary" sx={{ mt: 1 }}>
                +8% this month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Communities Reached
              </Typography>
              <Typography variant="h5">127</Typography>
              <Typography color="primary" sx={{ mt: 1 }}>
                +12% growth
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Funding
              </Typography>
              <Typography variant="h5">$182K</Typography>
              <Typography color="primary" sx={{ mt: 1 }}>
                +15% increase
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Donors Engaged
              </Typography>
              <Typography variant="h5">356</Typography>
              <Typography color="primary" sx={{ mt: 1 }}>
                +20 new donors
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Campaign Growth Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={campaignData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="funding" stroke="#8884d8" name="Funding ($)" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Impact Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={communityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {communityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Button variant="contained" color="primary" sx={{ mr: 2 }}>
          View Full Reports
        </Button>
        <Button variant="outlined" color="primary">
          Export Data
        </Button>
      </Box>
    </Container>
  );
};

export default Dashboard;
