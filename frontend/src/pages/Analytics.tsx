import React from 'react';
import { Container, Typography, Box, Grid, Paper, Card, CardContent } from '@mui/material';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';

const Analytics: React.FC = () => {
  // Sample analytics data
  const communityData = [
    { community: 'Nairobi East', beneficiaries: 500, completed: 450, dropout: 50 },
    { community: 'Kisumu', beneficiaries: 300, completed: 280, dropout: 20 },
    { community: 'Mombasa', beneficiaries: 400, completed: 350, dropout: 50 },
    { community: 'Eldoret', beneficiaries: 250, completed: 200, dropout: 50 },
  ];

  const fundingTrend = [
    { month: 'Jan', funding: 25000, donors: 15 },
    { month: 'Feb', funding: 45000, donors: 28 },
    { month: 'Mar', funding: 65000, donors: 42 },
    { month: 'Apr', funding: 85000, donors: 58 },
    { month: 'May', funding: 120000, donors: 75 },
  ];

  const predictionData = [
    { month: 'Jun', predicted: 150000, lower: 120000, upper: 180000 },
    { month: 'Jul', predicted: 185000, lower: 140000, upper: 230000 },
    { month: 'Aug', predicted: 220000, lower: 160000, upper: 280000 },
  ];

  const impactMetrics = [
    { label: 'Total Beneficiaries', value: '1,450', change: '+12%' },
    { label: 'Average Retention Rate', value: '88%', change: '+5%' },
    { label: 'Donor Engagement Score', value: '92/100', change: '+8%' },
    { label: 'Campaign Success Rate', value: '87%', change: '+3%' },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
        Analytics & Insights
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {impactMetrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  {metric.label}
                </Typography>
                <Typography variant="h5" sx={{ mb: 1 }}>
                  {metric.value}
                </Typography>
                <Typography color="success.main" variant="body2">
                  {metric.change} this quarter
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Community Beneficiary Completion Rate
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={communityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="community" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#4ECDC4" name="Completed" />
                <Bar dataKey="dropout" fill="#FF6B6B" name="Dropout" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Funding Trend Analysis
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={fundingTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="funding" stroke="#8884d8" name="Funding ($)" />
                <Line yAxisId="right" type="monotone" dataKey="donors" stroke="#82ca9d" name="# Donors" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              AI-Powered Funding Predictions (Next 3 Months)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={predictionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="predicted" stroke="#FF9800" name="Predicted Funding" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
            <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
              Predictions based on historical trends and machine learning analysis of donor patterns and campaign performance.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          Key Insights
        </Typography>
        <ul>
          <li>
            <Typography variant="body2">
              <strong>Strong Growth Momentum:</strong> Funding has increased by 380% over the past 5 months, indicating growing donor confidence.
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>High Retention:</strong> Average program completion rate is 88%, suggesting strong community engagement and program effectiveness.
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Donor Diversification:</strong> Healthy mix of individual, corporate, and NGO donors provides stable funding base.
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Community Performance:</strong> Nairobi East shows highest completion rate (90%), which can be replicated in other communities.
            </Typography>
          </li>
        </ul>
      </Box>
    </Container>
  );
};

export default Analytics;
