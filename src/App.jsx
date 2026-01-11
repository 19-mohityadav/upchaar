import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Clarity } from '@/components/clarity';
import AppLayout from '@/layouts/AppLayout';
import LandingPage from '@/pages/Landing';
import DashboardPage from '@/pages/Dashboard';
import DoctorsPage from '@/pages/Doctors';
import DiagnosticsPage from '@/pages/Diagnostics';
import HospitalsPage from '@/pages/Hospitals';
import RecordsPage from '@/pages/Records';
import EmergencyPage from '@/pages/Emergency';

function App() {
  return (
    <Router>
      <Clarity />
      <Routes>
        <Route path="/" element={<LandingPage />} />

        {/* App Routes wrapped in AppLayout */}
        <Route element={<AppLayout><Outlet /></AppLayout>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/doctors" element={<DoctorsPage />} />
          <Route path="/diagnostics" element={<DiagnosticsPage />} />
          <Route path="/hospitals" element={<HospitalsPage />} />
          <Route path="/records" element={<RecordsPage />} />
          <Route path="/emergency" element={<EmergencyPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
