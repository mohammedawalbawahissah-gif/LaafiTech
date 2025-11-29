import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Button, Container } from '@mui/material';
import './Navigation.css';

function Navigation() {
  return (
    <AppBar position="static" className="navigation">
      <Container>
        <Toolbar>
          <div className="logo">
            <Link to="/">
              <h1>LaafiTech</h1>
            </Link>
          </div>
          <nav className="nav-links">
            <Button color="inherit" component={Link} to="/">Dashboard</Button>
            <Button color="inherit" component={Link} to="/communities">Communities</Button>
            <Button color="inherit" component={Link} to="/campaigns">Campaigns</Button>
            <Button color="inherit" component={Link} to="/donors">Donors</Button>
            <Button color="inherit" component={Link} to="/analytics">Analytics</Button>
            <Button 
              color="success" 
              variant="contained" 
              component={Link} 
              to="/campaigns/create"
            >
              Create Campaign
            </Button>
          </nav>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navigation;
