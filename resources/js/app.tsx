import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

import { AppLayout } from './components/layout/AppLayout';
import AppDashboard from './pages/app/index';
import Login from './pages/login';
import Register from './pages/register';
import PendingApproval from './pages/pending-approval';
import RegistrationRejected from './pages/registration-rejected';
import ProfilePage from './pages/app/profile';
import EditProfile from './pages/app/edit-profile';
import Marketplace from './pages/app/marketplace';
import NewListing from './pages/app/marketplace-new';
import Exchange from './pages/app/exchange';
import NewExchange from './pages/app/exchange-new';
import BloodNetwork from './pages/app/blood';
import ResourceHub from './pages/app/resources';
import AnnouncementsPage from './pages/app/announcements';
import LostAndFound from './pages/app/lost-found';
import RoommateFinder from './pages/app/roommates';
import { AdminLayout } from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/index';
import RegistrationsQueue from './pages/admin/registrations';
import AdminReports from './pages/admin/reports';
import AdminAnnouncements from './pages/admin/announcements';
import UsersManagement from './pages/admin/users';
import NotificationsPage from './pages/app/notifications';

import { ErrorBoundary } from './components/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
            {/* Public Auth Routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* General App Routes */}
            <Route path="/pending-approval" element={<PendingApproval />} />
            <Route path="/registration-rejected" element={<RegistrationRejected />} />
            <Route path="/app" element={<ProtectedRoute requireRole="student" />}>
              <Route element={<AppLayout />}>
                <Route index element={<AppDashboard />} />
                <Route path="marketplace" element={<Marketplace />} />
                <Route path="marketplace/new" element={<NewListing />} />
                <Route path="exchange" element={<Exchange />} />
                <Route path="exchange/new" element={<NewExchange />} />
                <Route path="blood" element={<BloodNetwork />} />
                <Route path="resources" element={<ResourceHub />} />
                <Route path="roommates" element={<RoommateFinder />} />
                <Route path="lost-found" element={<LostAndFound />} />
                <Route path="announcements" element={<AnnouncementsPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="profile/edit" element={<EditProfile />} />
                <Route path="profile/:id" element={<ProfilePage />} />
              </Route>
            </Route>
            
            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute requireRole="admin" />}>
              <Route element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="registrations" element={<RegistrationsQueue />} />
                <Route path="users" element={<UsersManagement />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="announcements" element={<AdminAnnouncements />} />
              </Route>
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<div className="p-8 text-center">Page not found</div>} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
