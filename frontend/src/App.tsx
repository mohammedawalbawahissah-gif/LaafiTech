import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Communities from './pages/Communities';
import Campaigns from './pages/Campaigns';
import CampaignDetail from './pages/CampaignDetail';
import CreateCampaign from './pages/CreateCampaign';
import Donors from './pages/Donors';
import Analytics from './pages/Analytics';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Navigation />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/communities" element={<Communities />} />
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/campaigns/create" element={<CreateCampaign />} />
              <Route path="/campaigns/:id" element={<CampaignDetail />} />
              <Route path="/donors" element={<Donors />} />
              <Route path="/analytics" element={<Analytics />} />
            </Routes>
          </main>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
