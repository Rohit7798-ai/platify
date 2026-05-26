import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import HomeView from '../components/HomeView';
import CameraView from '../components/CameraView';
import PlantResult from '../components/PlantResult';
import PlantDetailView from '../components/PlantDetailView';
import CollectionView from '../components/CollectionView';
import ProfileView from '../components/ProfileView';
import AssistantView from '../components/AssistantView';
import ExploreView from '../components/ExploreView';
import CommunityView from '../components/CommunityView';
import HistoryView from '../components/HistoryView';
import BottomNav from '../components/BottomNav';
import LoginView from './components/LoginView';
import { useAuth } from './store/useAuthStore';
import AnalyzingView from '../components/AnalyzingView';

// Auth Guard Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121A15] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Main Layout with Bottom Nav
const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  
  const getActiveTab = () => {
    if (path.startsWith('/explore')) return 'explore';
    if (path.startsWith('/community')) return 'community';
    if (path.startsWith('/assistant')) return 'assistant';
    if (path.startsWith('/profile')) return 'profile';
    return 'home';
  };

  return (
    <>
      <div className="pb-20">
        {children}
      </div>
      <BottomNav 
        activeTab={getActiveTab()} 
        onTabChange={(tab) => {
          navigate(tab === 'home' ? '/' : `/${tab}`);
        }}
        onScanClick={() => {
          navigate('/scan');
        }}
      />
    </>
  );
};

export const AppRoutes: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" replace /> : <LoginView />
      } />
      
      {/* Main Tabs */}
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout>
            <HomeView 
              onScanClick={() => navigate('/scan')}
              onDiagnoseClick={() => navigate('/scan', { state: { initialMode: 'diagnose' } })}
              onUploadClick={(file) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                  navigate('/analyzing', { state: { imageUrl: e.target?.result as string, mode: 'identify' } });
                };
                reader.readAsDataURL(file);
              }}
              onRecentPlantClick={(plant) => navigate(`/plant/${plant.id}`)}
              onViewAllClick={() => navigate('/explore')}
            />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/explore" element={
        <ProtectedRoute>
          <MainLayout>
            <ExploreView 
              onPlantClick={(plant) => navigate(`/plant/${plant.id}`)} 
            />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/community" element={
        <ProtectedRoute>
          <MainLayout>
            <CommunityView />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/assistant" element={
        <ProtectedRoute>
          <MainLayout>
            <AssistantView />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <MainLayout>
            <ProfileView 
              isDarkMode={document.documentElement.classList.contains('dark')}
              onToggleDarkMode={() => {
                 document.documentElement.classList.toggle('dark');
              }}
              onViewCollection={() => navigate('/collection')}
              userProfile={user}
              onUpdateProfile={() => {}}
              onLogout={logout}
            />
          </MainLayout>
        </ProtectedRoute>
      } />

      {/* Full screen overlays */}
      <Route path="/scan" element={
        <ProtectedRoute>
          <CameraView 
             onCapture={(imageSrc, mode) => {
                navigate('/analyzing', { state: { imageUrl: imageSrc, mode } });
             }}
             onClose={() => navigate(-1)}
             onUpload={(file) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                  navigate('/analyzing', { state: { imageUrl: e.target?.result as string, mode: 'identify' } });
                };
                reader.readAsDataURL(file);
             }}
          />
        </ProtectedRoute>
      } />
      
      <Route path="/analyzing" element={
         <ProtectedRoute>
            <AnalyzingView />
         </ProtectedRoute>
      } />

      <Route path="/result" element={
         <ProtectedRoute>
            <PlantResult 
              onBack={() => navigate('/')} 
            />
         </ProtectedRoute>
      } />

      <Route path="/plant/:id" element={
        <ProtectedRoute>
          <PlantDetailView 
             onBack={() => navigate(-1)}
          />
        </ProtectedRoute>
      } />
      
      <Route path="/collection" element={
        <ProtectedRoute>
          <CollectionView 
            onPlantClick={(plant) => navigate(`/plant/${plant.id}`)}
            onUploadClick={() => navigate('/scan')}
            onBack={() => navigate(-1)}
          />
        </ProtectedRoute>
      } />

      <Route path="/history" element={
        <ProtectedRoute>
          <HistoryView />
        </ProtectedRoute>
      } />

    </Routes>
  );
};

export default AppRoutes;
