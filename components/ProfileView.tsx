
import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';

interface ProfileViewProps {
  collectionCount: number;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onViewCollection?: () => void;
  userProfile: UserProfile | null;
  onUpdateProfile: (profile: UserProfile) => void;
  onLogout: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({
  collectionCount,
  isDarkMode,
  onToggleDarkMode,
  onViewCollection,
  userProfile,
  onUpdateProfile,
  onLogout
}) => {
  const [isEditing, setIsEditing] = useState(!userProfile);
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    email: userProfile?.email || '',
    image: userProfile?.image || null as string | null
  });
  const [errors, setErrors] = useState({ name: '', email: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    let isValid = true;
    const newErrors = { name: '', email: '' };

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const newProfile: UserProfile = {
        name: formData.name,
        email: formData.email,
        image: formData.image,
        joinedDate: userProfile?.joinedDate || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        level: userProfile?.level || 1
      };

      onUpdateProfile(newProfile);
      setIsEditing(false);
      alert("Registration Successful!");
    }
  };

  if (isEditing) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark pb-28">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center bg-background-light/80 dark:bg-background-dark/80 px-4 py-3 justify-between backdrop-blur-md border-b border-black/5 dark:border-white/5">
          <h2 className="text-xl font-semibold leading-tight flex-1 text-center font-display text-text-primary dark:text-white">
            {userProfile ? 'Edit Profile' : 'Register'}
          </h2>
        </div>

        <main className="flex-grow px-6 pt-8 flex flex-col gap-6 animate-spring-in">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-forest dark:text-sage mb-2">Welcome to FloraFind</h1>
            <p className="text-text-secondary dark:text-gray-400 text-sm">Create your profile to start tracking your plant collection.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">

            {/* Image Upload */}
            <div className="flex flex-col items-center gap-3">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative size-32 rounded-full bg-gray-100 dark:bg-white/5 border-4 border-white dark:border-zinc-800 shadow-xl cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center group overflow-hidden"
              >
                {formData.image ? (
                  <img src={formData.image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-4xl text-gray-400">person</span>
                )}

                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="material-symbols-outlined text-white">photo_camera</span>
                </div>
              </div>
              <p className="text-xs text-forest dark:text-sage font-medium cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                {formData.image ? 'Change Photo' : 'Upload Photo'}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-text-primary dark:text-white ml-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Jane Doe"
                  className={`w-full rounded-xl border ${errors.name ? 'border-red-500' : 'border-gray-200 dark:border-zinc-700'} bg-white dark:bg-zinc-800 p-4 text-text-primary dark:text-white focus:ring-2 focus:ring-forest dark:focus:ring-sage outline-none transition-all`}
                />
                {errors.name && <p className="text-red-500 text-xs ml-1">{errors.name}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-text-primary dark:text-white ml-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="jane@example.com"
                  className={`w-full rounded-xl border ${errors.email ? 'border-red-500' : 'border-gray-200 dark:border-zinc-700'} bg-white dark:bg-zinc-800 p-4 text-text-primary dark:text-white focus:ring-2 focus:ring-forest dark:focus:ring-sage outline-none transition-all`}
                />
                {errors.email && <p className="text-red-500 text-xs ml-1">{errors.email}</p>}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="mt-4 w-full h-14 rounded-full bg-forest dark:bg-green-600 text-white font-bold shadow-lg shadow-forest/30 flex items-center justify-center gap-2 hover:translate-y-[-2px] hover:shadow-xl active:scale-95 transition-all duration-300"
            >
              <span className="material-symbols-outlined">save</span>
              Save & Register
            </button>

            {userProfile && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="w-full py-3 text-text-secondary dark:text-gray-400 font-medium hover:underline"
              >
                Cancel
              </button>
            )}
          </form>
        </main>
      </div>
    );
  }

  // View Mode (Original UI with slight mods)
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark pb-28">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center bg-background-light/80 dark:bg-background-dark/80 px-4 py-3 justify-between backdrop-blur-md border-b border-black/5 dark:border-white/5">
        <div className="w-10"></div>
        <h2 className="text-xl font-semibold leading-tight flex-1 text-center font-display text-text-primary dark:text-white">Profile</h2>
        <div className="flex w-10 items-center justify-end">
          <button className="flex items-center justify-center size-10 rounded-full text-text-primary dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>
      </div>

      <main className="flex-grow px-5 pt-6 flex flex-col gap-6">
        {/* User Card */}
        <div className="flex flex-col items-center gap-3 animate-spring-in">
          <div className="relative">
            <div className="size-28 rounded-full bg-gray-200 overflow-hidden border-4 border-white dark:border-zinc-800 shadow-xl">
              <img
                src={userProfile?.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=PlantLover&backgroundColor=b6e3f4"}
                alt="User Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div
              onClick={() => setIsEditing(true)}
              className="absolute bottom-1 right-1 bg-green-500 text-white p-1.5 rounded-full border-4 border-white dark:border-zinc-800 shadow-sm cursor-pointer hover:bg-green-600 transition-colors"
            >
              <span className="material-symbols-outlined text-sm font-bold block">edit</span>
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-text-primary dark:text-white font-display">{userProfile?.name}</h3>
            <p className="text-sm text-text-secondary dark:text-gray-400">Joined {userProfile?.joinedDate}</p>
          </div>
        </div>

        {/* Quick Actions (Specifically Collection since it's hidden in nav) */}
        {onViewCollection && (
          <div
            onClick={onViewCollection}
            className="bg-forest dark:bg-green-900/30 p-4 rounded-2xl shadow-lg shadow-forest/20 flex items-center justify-between cursor-pointer active:scale-95 transition-transform"
          >
            <div className="flex items-center gap-4 text-white">
              <div className="size-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined">local_florist</span>
              </div>
              <div>
                <h4 className="font-bold">My Collection</h4>
                <p className="text-xs text-white/80">{collectionCount} plants saved</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-white">arrow_forward</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-white/5 p-5 rounded-2xl shadow-subtle dark:shadow-subtle-dark flex flex-col items-center justify-center gap-1 group transition-transform active:scale-95">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-1 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">local_florist</span>
            </div>
            <span className="text-2xl font-bold text-text-primary dark:text-white">{collectionCount}</span>
            <span className="text-xs font-medium text-text-secondary dark:text-gray-400">Plants Saved</span>
          </div>
          <div className="bg-white dark:bg-white/5 p-5 rounded-2xl shadow-subtle dark:shadow-subtle-dark flex flex-col items-center justify-center gap-1 group transition-transform active:scale-95">
            <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 mb-1 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">military_tech</span>
            </div>
            <span className="text-2xl font-bold text-text-primary dark:text-white">Level {userProfile?.level || 1}</span>
            <span className="text-xs font-medium text-text-secondary dark:text-gray-400">Green Thumb</span>
          </div>
        </div>

        {/* Settings List */}
        <div className="bg-white dark:bg-white/5 rounded-2xl shadow-subtle dark:shadow-subtle-dark overflow-hidden divide-y divide-gray-100 dark:divide-white/5">
          <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors" onClick={onToggleDarkMode}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                <span className="material-symbols-outlined">dark_mode</span>
              </div>
              <span className="font-medium text-text-primary dark:text-white">Dark Mode</span>
            </div>
            <div className={`relative w-12 h-7 rounded-full p-1 transition-colors duration-300 ${isDarkMode ? 'bg-green-500' : 'bg-gray-200 dark:bg-zinc-700'}`}>
              <div className={`absolute top-1 left-1 bg-white size-5 rounded-full shadow-sm transition-transform duration-300 ${isDarkMode ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </div>
          </div>

          <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                <span className="material-symbols-outlined">notifications</span>
              </div>
              <span className="font-medium text-text-primary dark:text-white">Notifications</span>
            </div>
            <span className="material-symbols-outlined text-gray-400">chevron_right</span>
          </div>

          <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400">
                <span className="material-symbols-outlined">help</span>
              </div>
              <span className="font-medium text-text-primary dark:text-white">Help & Support</span>
            </div>
            <span className="material-symbols-outlined text-gray-400">chevron_right</span>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => setIsEditing(true)}
          className="w-full py-4 text-text-primary dark:text-white font-semibold bg-white dark:bg-white/5 rounded-full shadow-subtle dark:shadow-subtle-dark hover:bg-black/5 dark:hover:bg-white/10 hover:translate-y-[-1px] transition-all mb-4"
        >
          Edit Profile
        </button>

        <button
          onClick={onLogout}
          className="w-full py-4 text-red-500 font-bold bg-red-50 dark:bg-red-900/10 rounded-full shadow-subtle dark:shadow-subtle-dark border border-red-100 dark:border-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/20 hover:translate-y-[-1px] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mb-6"
        >
          <span className="material-symbols-outlined">logout</span>
          Sign Out
        </button>

        <p className="text-center text-xs text-text-secondary dark:text-gray-500 pb-4">Version 2.4.0</p>

      </main>
    </div>
  );
};

export default ProfileView;
