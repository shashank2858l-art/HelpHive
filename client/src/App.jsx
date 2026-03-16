import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import PageSkeleton from './components/loader/PageSkeleton';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RoleSelectionPage from './pages/RoleSelectionPage';

const AdminDashboardPage = lazy(() => import('./pages/DashboardPage'));
const VolunteerDashboardPage = lazy(() => import('./pages/VolunteerDashboardPage'));
const VolunteersPage = lazy(() => import('./pages/VolunteersPage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const ResourcesPage = lazy(() => import('./pages/ResourcesPage'));
const MapTrackingPage = lazy(() => import('./pages/MapTrackingPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const AIInsightsPage = lazy(() => import('./pages/AIInsightsPage'));
const HelpRequestsPage = lazy(() => import('./pages/HelpRequestsPage'));
const EmergencyModePage = lazy(() => import('./pages/EmergencyModePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const VolunteerDetailsPage = lazy(() => import('./pages/VolunteerDetailsPage'));
const ProfileCompletionPage = lazy(() => import('./pages/ProfileCompletionPage'));

const withSuspense = (Component) => (
  <Suspense fallback={<PageSkeleton />}>
    <Component />
  </Suspense>
);

const App = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/role-selection" element={<RoleSelectionPage />} />
    <Route path="/complete-profile" element={withSuspense(ProfileCompletionPage)} />
    
    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        <Route path="/home" element={<Navigate to="/role-selection" replace />} />
        
        {/* Admin only routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={withSuspense(AdminDashboardPage)} />
          <Route path="/dashboard" element={withSuspense(AdminDashboardPage)} />
          <Route path="/admin-dashboard" element={withSuspense(AdminDashboardPage)} />
          <Route path="/volunteers" element={withSuspense(VolunteersPage)} />
          <Route path="/volunteers/:id" element={withSuspense(VolunteerDetailsPage)} />
          <Route path="/resources" element={withSuspense(ResourcesPage)} />
          <Route path="/analytics" element={withSuspense(AnalyticsPage)} />
        </Route>

        {/* Volunteer only routes */}
        <Route element={<ProtectedRoute allowedRoles={['volunteer']} />}>
          <Route path="/volunteer" element={withSuspense(VolunteerDashboardPage)} />
          <Route path="/volunteer-dashboard" element={withSuspense(VolunteerDashboardPage)} />
          <Route path="/leaderboard" element={withSuspense(LeaderboardPage)} />
          <Route path="/profile" element={withSuspense(ProfilePage)} />
        </Route>

        {/* Shared routes */}
        <Route path="/events" element={withSuspense(EventsPage)} />
        <Route path="/map-tracking" element={withSuspense(MapTrackingPage)} />
        <Route path="/map" element={withSuspense(MapTrackingPage)} />
        <Route path="/ai" element={withSuspense(AIInsightsPage)} />
        <Route path="help-requests" element={withSuspense(HelpRequestsPage)} />
        <Route path="emergency" element={withSuspense(EmergencyModePage)} />
        <Route path="/settings" element={withSuspense(SettingsPage)} />
      </Route>
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
