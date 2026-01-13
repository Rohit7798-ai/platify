
import React, { useState, useEffect } from 'react';
import HomeView from './components/HomeView';
import CameraView from './components/CameraView';
import AnalyzingView from './components/AnalyzingView';
import PlantResult from './components/PlantResult';
import PlantDetailView from './components/PlantDetailView';
import CollectionView from './components/CollectionView';
import ProfileView from './components/ProfileView';
import AssistantView from './components/AssistantView';
import ExploreView from './components/ExploreView';
import CommunityView from './components/CommunityView';
import BottomNav from './components/BottomNav';
import LoginView from './src/components/LoginView'; // Fixed import path
import { identifyPlant, diagnosePlant } from './services/geminiService';
import { IdentificationState, PlantData, PlantItem, UserProfile } from './types';
import { supabase } from './src/lib/supabase'; // Fixed import path
import { Session } from '@supabase/supabase-js';

const initialCollectionData: PlantItem[] = [
  {
    id: '1',
    name: 'Monstera Deliciosa',
    scientificName: 'Monstera deliciosa',
    date: 'Oct 26, 2023',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmeg_whRwh4FBWc9c9jQm6dcagCe55J9Xe77x58vlqk-Qwg6BhnC-JU5DCQH6jJFivQDcK9DkfUeP758RXXjybR8Il7Nvf4yfn8oB5y-0YxOs-0i3SL_AoEVf6F91-6r1R2GPeBhgeRQz5l6jLAFktn4CaLqo9RCxlSFyDRnp-DoVlvCE2s9dCsmjGAPwl8fa2laNuynouz6mWgQJk1QePp1ABfpkXnnXIkOn3pM8ko1CgCMSPtErAVLgGyKcdcBhmu5oOzqbH1MY',
    tags: ['Indoor', 'Low Light'],
    data: {
      commonName: 'Monstera Deliciosa',
      scientificName: 'Monstera deliciosa',
      description: "Monstera deliciosa, native to the tropical forests of southern Mexico, is a species of flowering plant cherished for its iconic, split leaves. As a houseplant, it's known for its easy-going nature and air-purifying qualities.",
      careInstructions: {
        light: "Bright, indirect",
        water: "Every 1-2 weeks",
        soil: "Peat-based",
        fertilizer: "Monthly"
      },
      funFact: "It is also known as the Swiss Cheese Plant.",
      isToxic: true,
      matchScore: 98,
      similarPlants: []
    },
    growthTimeline: [
      { date: 'Oct 26, 2023', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmeg_whRwh4FBWc9c9jQm6dcagCe55J9Xe77x58vlqk-Qwg6BhnC-JU5DCQH6jJFivQDcK9DkfUeP758RXXjybR8Il7Nvf4yfn8oB5y-0YxOs-0i3SL_AoEVf6F91-6r1R2GPeBhgeRQz5l6jLAFktn4CaLqo9RCxlSFyDRnp-DoVlvCE2s9dCsmjGAPwl8fa2laNuynouz6mWgQJk1QePp1ABfpkXnnXIkOn3pM8ko1CgCMSPtErAVLgGyKcdcBhmu5oOzqbH1MY', height: '12"' },
      { date: 'Nov 15, 2023', image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=1000&auto=format&fit=crop', height: '14"' }
    ],
    wateringHistory: [
      { date: 'Oct 26, 2023', amount: '300ml' },
      { date: 'Nov 02, 2023', amount: '300ml' }
    ]
  },
  {
    id: '4',
    name: 'Pothos',
    scientificName: 'Epipremnum aureum',
    date: 'Sep 05, 2023',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgANjQwMa8vEiR1yYK0U_WWpN83d2srzHanBpLhdgpg64XcQD5lbhHIDDjSsJfB_TYN8PNMnIm2ad2JAZNRvHVq1UYt5ydKpIcYkJmfuZbNH-VcZrGks0LOlUtk0UXahgovegVTg-oM3rxJNSKF1E50VC7AwqtDRutBIjvAs-4NdNLuGVGve3I8GceeJYmzYeJhYGxQJ8ThjD1HDAdVXCQe7J_0wAzHQMgy5npyi63HmJIahNRsbD_FL353VrYZ0PZn2B7JQZzoBs',
    tags: ['Indoor', 'Low Light'],
    data: {
      commonName: 'Pothos',
      scientificName: 'Epipremnum aureum',
      description: "Pothos, also known as Devil's Ivy, is a trailing vine with heart-shaped leaves that is popular for its hardiness and ability to thrive in low light.",
      careInstructions: {
        light: "Low to bright indirect",
        water: "Every 1-2 weeks",
        soil: "Well-draining potting mix",
        fertilizer: "Monthly during growing season"
      },
      funFact: "It can survive in very low light conditions, making it perfect for offices.",
      isToxic: true,
      matchScore: 99,
      similarPlants: []
    }
  }
];

// Utility to compress image before sending to API
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        // SPEED OPTIMIZATION: Reduced max width to 800px for faster upload
        const MAX_WIDTH = 800;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // SPEED OPTIMIZATION: Compress to JPEG at 70% quality
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        } else {
          reject(new Error("Canvas context failed"));
        }
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'explore' | 'community' | 'assistant' | 'profile'>('home');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<PlantItem | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [scanMode, setScanMode] = useState<'identify' | 'diagnose'>('identify');
  const [showCollectionView, setShowCollectionView] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecovering, setIsRecovering] = useState(false);

  const [identificationState, setIdentificationState] = useState<IdentificationState>({
    status: 'idle',
    image: null,
    data: null,
    error: null
  });

  const [collection, setCollection] = useState<PlantItem[]>([]);
  const [scanHistory, setScanHistory] = useState<PlantItem[]>([]);

  // Auth Listener
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event);
      setSession(session);
      setIsLoading(false); // Ensure loading is cleared on auth changes

      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovering(true);
      } else if (event === 'SIGNED_OUT') {
        setIsRecovering(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch Data from Supabase
  useEffect(() => {
    if (session?.user) {
      fetchUserCollection();
      fetchScanHistory();

      // Update User Profile from auth
      const user = session.user;
      setUserProfile({
        name: user.user_metadata.full_name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        image: user.user_metadata.avatar_url || null,
        joinedDate: new Date(user.created_at).toLocaleDateString(),
        level: 1
      });
    }
  }, [session]);

  const fetchUserCollection = async () => {
    const { data, error } = await supabase
      .from('collection')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setCollection(data.map(item => ({
        id: item.id,
        name: item.name,
        scientificName: item.scientific_name,
        date: new Date(item.created_at).toLocaleDateString(),
        image: item.image_url,
        tags: item.tags,
        data: item.data as PlantData
      })));
    }
  };

  const fetchScanHistory = async () => {
    const { data, error } = await supabase
      .from('scans')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setScanHistory(data.map(item => ({
        id: item.id,
        name: item.name,
        scientificName: item.scientific_name,
        date: new Date(item.created_at).toLocaleDateString(),
        image: item.image_url,
        tags: ['Scanned'],
        data: item.data as PlantData
      })));
    }
  };

  // Removed LocalStorage effects as we now use Supabase

  const addToHistory = async (data: PlantData, image: string) => {
    if (!session?.user) return;

    const { data: insertedData, error } = await supabase
      .from('scans')
      .insert({
        user_id: session.user.id,
        name: data.commonName,
        scientific_name: data.scientificName,
        image_url: image,
        data: data,
        type: scanMode
      })
      .select()
      .single();

    if (insertedData) {
      const historyItem: PlantItem = {
        id: insertedData.id,
        name: data.commonName,
        scientificName: data.scientificName,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        image: image,
        tags: ['Scanned'],
        data: data
      };
      setScanHistory(prev => [historyItem, ...prev]);
    }
  };

  // Apply dark mode class to html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleScanClick = () => {
    if (!navigator.onLine) {
      alert("Offline Mode: Camera identification is disabled without internet connection.");
      return;
    }
    setScanMode('identify');
    setIdentificationState({ status: 'camera', image: null, data: null, error: null });
    setSelectedPlant(null);
  };

  const handleDiagnoseClick = () => {
    if (!navigator.onLine) {
      alert("Offline Mode: Plant Doctor is disabled without internet connection.");
      return;
    }
    setScanMode('diagnose');
    setIdentificationState({ status: 'camera', image: null, data: null, error: null });
    setSelectedPlant(null);
  };

  const handleUpload = async (file: File) => {
    if (!navigator.onLine) {
      alert("Offline Mode: Identification requires internet connection.");
      return;
    }

    setIdentificationState({ status: 'analyzing', image: null, data: null, error: null });
    setSelectedPlant(null);

    try {
      const compressedBase64 = await compressImage(file);
      setIdentificationState(prev => ({ ...prev, image: compressedBase64 }));

      let data: PlantData;
      if (scanMode === 'diagnose') {
        data = await diagnosePlant(compressedBase64);
      } else {
        data = await identifyPlant(compressedBase64);
      }

      setIdentificationState(prev => ({ ...prev, status: 'success', data }));
      addToHistory(data, compressedBase64);
    } catch (error) {
      setIdentificationState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }));
    }
  };

  const handleCapture = async (imageSrc: string, mode?: 'identify' | 'diagnose') => {
    if (!navigator.onLine) {
      setIdentificationState({ status: 'error', image: null, data: null, error: "No Internet Connection" });
      return;
    }

    const effectiveMode = mode || scanMode;
    if (mode) setScanMode(mode);

    setIdentificationState({ status: 'analyzing', image: imageSrc, data: null, error: null });

    try {
      let data: PlantData;
      if (effectiveMode === 'diagnose') {
        data = await diagnosePlant(imageSrc);
      } else {
        data = await identifyPlant(imageSrc);
      }
      setIdentificationState(prev => ({ ...prev, status: 'success', data }));
      addToHistory(data, imageSrc);
    } catch (error) {
      setIdentificationState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }));
    }
  };

  const handleRetake = () => {
    setIdentificationState({ status: 'camera', image: null, data: null, error: null });
  };

  const handleBack = () => {
    setIdentificationState({ status: 'idle', image: null, data: null, error: null });
  };

  const handleSaveToCollection = async (data: PlantData) => {
    if (identificationState.image && session?.user) {
      const tags = data.healthAssessment && !data.healthAssessment.isHealthy ? ['Unhealthy', data.healthAssessment.diagnosis] : ['Indoor'];

      const { data: insertedData, error } = await supabase
        .from('collection')
        .insert({
          user_id: session.user.id,
          name: data.commonName,
          scientific_name: data.scientificName,
          image_url: identificationState.image,
          tags: tags,
          data: data
        })
        .select()
        .single();

      if (insertedData) {
        const newPlant: PlantItem = {
          id: insertedData.id,
          name: data.commonName,
          scientificName: data.scientificName,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          image: identificationState.image,
          tags: tags,
          data: data,
          growthTimeline: [{
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            image: identificationState.image,
            note: 'Identified'
          }],
          wateringHistory: []
        };
        setCollection(prev => [newPlant, ...prev]);
      }
    }
  };

  const handleDeleteFromCollection = async (id: string) => {
    await supabase.from('collection').delete().eq('id', id);
    setCollection(prev => prev.filter(plant => plant.id !== id));
  };

  const handleViewPlant = (plant: PlantItem) => {
    setSelectedPlant(plant);
  };

  const handleRecentPlantClick = (plantName: string) => {
    const plant = collection.find(p =>
      p.name.toLowerCase().includes(plantName.toLowerCase()) ||
      plantName.toLowerCase().includes(p.name.toLowerCase())
    );

    if (plant) {
      setSelectedPlant(plant);
    } else {
      // If offline and not in collection, we can't fetch it
      alert("This plant is not in your cached collection.");
    }
  };

  const handleCloseDetail = () => {
    setSelectedPlant(null);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
    } else {
      setSession(null);
      setUserProfile(null);
      setActiveTab('home');
    }
  };

  // Determine what to render based on state
  const renderContent = () => {
    // 1. Detailed Plant View (Highest priority overlay)
    if (selectedPlant) {
      return (
        <PlantDetailView
          plant={selectedPlant}
          onBack={handleCloseDetail}
        />
      );
    }

    // 2. Collection View (Secondary overlay from Profile or View All)
    if (showCollectionView) {
      return (
        <CollectionView
          collection={collection}
          onDelete={handleDeleteFromCollection}
          onPlantClick={handleViewPlant}
          onUploadClick={(file) => {
            setScanMode('identify');
            handleUpload(file);
          }}
          onBack={() => setShowCollectionView(false)}
        />
      );
    }

    // 3. Identification Flow
    if (identificationState.status === 'camera') {
      return (
        <CameraView
          onCapture={handleCapture}
          onClose={handleBack}
          onUpload={handleUpload}
          initialMode={scanMode}
        />
      );
    }

    if (identificationState.status === 'analyzing') {
      return <AnalyzingView imageUrl={identificationState.image} />;
    }

    if (identificationState.status === 'success' && identificationState.data && identificationState.image) {
      return (
        <PlantResult
          data={identificationState.data}
          imageUrl={identificationState.image}
          onBack={handleBack}
          onSave={handleSaveToCollection}
        />
      );
    }

    if (identificationState.status === 'error') {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-background-light dark:bg-background-dark text-text-primary dark:text-white">
          <span className="material-symbols-outlined text-5xl text-red-500 mb-4">error</span>
          <h2 className="text-xl font-bold mb-2">Process Failed</h2>
          <p className="mb-6 opacity-80">{identificationState.error}</p>
          <button
            onClick={handleRetake}
            className="px-6 py-3 bg-primary dark:bg-green-600 text-text-primary dark:text-white rounded-xl font-semibold"
          >
            Try Again
          </button>
          <button
            onClick={handleBack}
            className="mt-4 text-sm opacity-60 underline"
          >
            Go Home
          </button>
        </div>
      );
    }

    // 4. Main Tab Navigation
    switch (activeTab) {
      case 'home':
        return (
          <HomeView
            onScanClick={handleScanClick}
            onUploadClick={(file) => {
              setScanMode('identify');
              handleUpload(file);
            }}
            onDiagnoseClick={handleDiagnoseClick}
            onRecentPlantClick={handleViewPlant}
            onViewAllClick={() => setActiveTab('explore')}
            scanHistory={scanHistory}
          />
        );
      case 'explore':
        return <ExploreView scanHistory={scanHistory} onPlantClick={handleViewPlant} />;
      case 'community':
        return <CommunityView />;
      case 'assistant':
        return <AssistantView />;
      case 'profile':
        return (
          <ProfileView
            collectionCount={collection.length}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            onViewCollection={() => setShowCollectionView(true)}
            userProfile={userProfile}
            onUpdateProfile={setUserProfile}
            onLogout={handleLogout}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || isRecovering) {
    return <LoginView initialMode={isRecovering ? 'updatePassword' : 'signin'} onComplete={() => setIsRecovering(false)} />;
  }

  return (
    <>
      {renderContent()}

      {/* Show Bottom Nav only when in main tabs and NOT viewing a detail/overlay/camera */}
      {identificationState.status === 'idle' && !selectedPlant && !showCollectionView && (
        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onScanClick={handleScanClick}
        />
      )}
    </>
  );
};

export default App;
