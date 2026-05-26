
import React, { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { usePlantDetail } from '../src/hooks/usePlantify';
import { PlantItem } from '../types';

interface PlantDetailViewProps {
  onBack: () => void;
}

const PlantDetailView: React.FC<PlantDetailViewProps> = ({ onBack }) => {
  const { id } = useParams<{ id: string }>();
  const { data: plantData, isLoading, error } = usePlantDetail(id || '');
  
  const [activeTab, setActiveTab] = useState<'overview' | 'care' | 'history' | 'timeline'>('overview');
  const [reminders, setReminders] = useState<Record<string, boolean>>({});
  const [showToast, setShowToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-forest mb-4"></div>
        <p className="text-text-secondary">Loading plant details...</p>
      </div>
    );
  }

  if (error || !plantData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-background-dark p-6 text-center">
        <span className="material-symbols-outlined text-red-500 text-6xl mb-4">error</span>
        <h2 className="text-xl font-bold mb-2">Plant not found</h2>
        <p className="text-text-secondary mb-6">The plant you're looking for doesn't exist or there was an error.</p>
        <button onClick={onBack} className="px-6 py-2 bg-forest text-white rounded-full font-bold">Go Back</button>
      </div>
    );
  }

  const plant = plantData as unknown as PlantItem;
  const { data, image, date, growthTimeline, wateringHistory } = plant;

  // Dummy placeholders for similar plants since API only gives text
  const placeholders = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBTBxtFcp1dJP6NgIutzYmgzyREGcZb5TZKkjo7yIVgzmFYsAwG_4rlx1GfjxuNpS-UbMopw8lwDFUzcBRO9cTwgoIzvJkiV4QaJA66-z2sz9RE26qRuBa1b7ZMGlcNDRGrU-yZ56ijrUsc-xiCaLpL_Co0J8au4_jbySfySkD7d3py-wxStOoUwpdPritEjE8GMcl5VlHKlLAn9mOYBNjoF4D3RIii5YovqBLjHYvG2sX01lxsHsvVH65WS5LBRcPLBNVudgi0ZOc",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBIpJKMQAnhp99AufyQ_JE3A7a-cVA368bu6bbKObm4LSubXzJDDQ0g9xDgEkZ-lxYx9QNvgG4gXPx18y5a54QXUGxmOAbkcqzH_hft9oWy5PBPbFottGv9EUlkC60JuG_eHL25GNJovo_O-xCJb-7BuYSXZ-3cPt29z3Rcmnpp590FYRxA4lrqgQpPJU61qeH5QaHD1HMR4MBpjCwwJ7Keb-Ty0Xj6bNH1WntzTe0cYI-rXZ8m-8ApbiRKrZGfgweimfooU4VQEjw",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCSZiRD5ZJXa8eKZFp63tpDyNRC85nWPgd1Rpia6f7wQd8CB-sByDN1t2vMnT8FhgbODIBSf00OaWeJE3-tDz4zzLL3hHSQFDwBft_KQPK3PKO83n1ZQ62FRNn4wgFMdJHujWYjEVMVkfvKs8oAxhcQqXLYJPLz9ENDJRlywtQ1cp1nvdGlJqxxXsu4Ds4tm0iSGYhsUoZtZ_ebowJWiigHt4c5aXVkIascIYNIJz67479BsnQPkcFDc8OPnbzsWj0DSDElEQsSbIw"
  ];

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) return false;

    if (Notification.permission === "granted") return true;

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    return false;
  };

  const toggleReminder = async (type: string, label: string, frequency: string) => {
    const isTurningOn = !reminders[type];

    setReminders(prev => ({
      ...prev,
      [type]: isTurningOn
    }));

    if (isTurningOn) {
      // Try to enable system notifications
      const granted = await requestNotificationPermission();
      if (granted) {
        new Notification(`Reminder Set: ${data.commonName}`, {
          body: `We'll remind you about ${label.toLowerCase()} ${frequency}.`,
          icon: '/icon.png'
        });
      }
      setShowToast(`${label} reminder set for ${frequency}`);
    } else {
      setShowToast(`${label} reminder disabled`);
    }

    setTimeout(() => setShowToast(null), 3000);
  };

  const handleSimilarPlantClick = (plantName: string) => {
    alert(`This would navigate to details for ${plantName}. (Feature coming soon)`);
  };

  const handleAddTimelinePhoto = () => {
    fileInputRef.current?.click();
  };

  const copyToClipboard = () => {
    const text = `
Plant: ${data?.commonName} (${data?.scientificName})
Description: ${data?.description}
Care:
- Light: ${data?.careInstructions?.light || 'N/A'}
- Water: ${data?.careInstructions?.water || 'N/A'}
- Soil: ${data?.careInstructions?.soil || 'N/A'}
- Fertilizer: ${data?.careInstructions?.fertilizer || 'N/A'}
Fun Fact: ${data?.funFact}
${data.healthAssessment ? `
Health Diagnosis: ${data.healthAssessment.diagnosis}
Symptoms: ${data.healthAssessment.symptoms.join(', ')}
Treatment: ${data.healthAssessment.treatment.join(', ')}
` : ''}
    `.trim();

    navigator.clipboard.writeText(text);
    setShowToast("Content copied to clipboard!");
    setTimeout(() => setShowToast(null), 3000);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display text-text-primary dark:text-white overflow-x-hidden">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 flex items-center bg-background-light/90 dark:bg-background-dark/90 px-4 py-3 justify-between backdrop-blur-md border-b border-black/5 dark:border-white/5">
        <button
          onClick={onBack}
          className="flex items-center justify-center size-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-lg font-semibold leading-tight text-center opacity-0 animate-fade-in transition-opacity duration-300" style={{ opacity: 1 }}>
          {plant.name}
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={copyToClipboard}
            className="flex items-center justify-center size-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title="Copy information"
          >
            <span className="material-symbols-outlined">content_copy</span>
          </button>
          <button className="flex items-center justify-center size-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined">more_vert</span>
          </button>
        </div>
      </header>

      <main className="flex-grow pb-10">
        {/* Hero Image */}
        <div className="relative w-full aspect-square md:aspect-video bg-gray-100 dark:bg-zinc-800">
          <img
            src={image}
            alt={plant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background-light dark:from-background-dark to-transparent opacity-90"></div>

          {/* Status Badge */}
          <div className="absolute top-4 right-4 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-white/20 flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span className="text-xs font-bold text-forest dark:text-sage">Healthy</span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-bold leading-tight mb-1">{data?.commonName || plant.name}</h1>
                <p className="text-lg italic text-text-secondary dark:text-gray-400 opacity-90">{data?.scientificName || plant.scientificName}</p>
              </div>
              {data.isToxic && (
                <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
                  <span className="material-symbols-outlined !text-sm">warning</span>
                  Toxic
                </div>
              )}
            </div>
            <p className="text-xs text-text-secondary dark:text-gray-500 mt-2">Added on {date}</p>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="px-6 mt-4">
          <div className="flex border-b border-gray-200 dark:border-white/10 mb-6 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 min-w-[80px] pb-3 text-sm font-semibold transition-colors relative whitespace-nowrap ${activeTab === 'overview' ? 'text-primary-dark dark:text-green-400' : 'text-text-secondary dark:text-gray-500'}`}
            >
              Overview
              {activeTab === 'overview' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-dark dark:bg-green-400 rounded-t-full"></div>}
            </button>
            <button
              onClick={() => setActiveTab('care')}
              className={`flex-1 min-w-[80px] pb-3 text-sm font-semibold transition-colors relative whitespace-nowrap ${activeTab === 'care' ? 'text-primary-dark dark:text-green-400' : 'text-text-secondary dark:text-gray-500'}`}
            >
              Care
              {activeTab === 'care' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-dark dark:bg-green-400 rounded-t-full"></div>}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 min-w-[80px] pb-3 text-sm font-semibold transition-colors relative whitespace-nowrap ${activeTab === 'history' ? 'text-primary-dark dark:text-green-400' : 'text-text-secondary dark:text-gray-500'}`}
            >
              Tracker
              {activeTab === 'history' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-dark dark:bg-green-400 rounded-t-full"></div>}
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex-1 min-w-[80px] pb-3 text-sm font-semibold transition-colors relative whitespace-nowrap ${activeTab === 'timeline' ? 'text-primary-dark dark:text-green-400' : 'text-text-secondary dark:text-gray-500'}`}
            >
              Journal
              {activeTab === 'timeline' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-dark dark:bg-green-400 rounded-t-full"></div>}
            </button>
          </div>

          {activeTab === 'overview' && (
            <div className="flex flex-col gap-6 animate-spring-in">
              <div className="bg-white dark:bg-white/5 p-5 rounded-2xl shadow-subtle dark:shadow-subtle-dark">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-500">description</span>
                  Description
                </h3>
                <p className="text-sm text-text-secondary dark:text-gray-300 leading-relaxed">
                  {data.description}
                </p>
              </div>

              {data.healthAssessment && (
                <div className={`p-5 rounded-2xl shadow-subtle dark:shadow-subtle-dark border ${data.healthAssessment.isHealthy ? 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/20' : 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20'}`}>
                  <h3 className={`font-semibold mb-3 flex items-center gap-2 ${data.healthAssessment.isHealthy ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                    <span className="material-symbols-outlined">{data.healthAssessment.isHealthy ? 'check_circle' : 'warning'}</span>
                    Health Assessment: {data.healthAssessment.diagnosis}
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-xs font-bold uppercase opacity-60 mb-1">Symptoms</h4>
                      <div className="flex flex-wrap gap-2">
                        {data.healthAssessment.symptoms.map((s, i) => (
                          <span key={i} className="text-xs bg-white/50 dark:bg-black/20 px-2 py-1 rounded-md">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase opacity-60 mb-1">Causes</h4>
                      <p className="text-sm opacity-80">{data.healthAssessment.causes.join(', ')}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase opacity-60 mb-1">Treatment</h4>
                      <ul className="text-sm list-disc pl-4 space-y-1">
                        {data.healthAssessment.treatment.map((t, i) => (
                          <li key={i} className="opacity-80">{t}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {data.funFact && (
                <div className="bg-amber-50 dark:bg-amber-900/10 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/20">
                  <h3 className="font-semibold mb-2 text-amber-700 dark:text-amber-400 flex items-center gap-2">
                    <span className="material-symbols-outlined">lightbulb</span>
                    Did you know?
                  </h3>
                  <p className="text-sm text-amber-900/80 dark:text-amber-200/80 italic">
                    "{data.funFact}"
                  </p>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-4">Similar Plants</h3>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
                  {data.similarPlants && data.similarPlants.length > 0 ? (
                    data.similarPlants.map((plant, index) => (
                      <div
                        key={index}
                        className="flex flex-col items-center shrink-0 w-32 group cursor-pointer"
                        onClick={() => handleSimilarPlantClick(plant.name)}
                      >
                        <div className="size-28 rounded-xl overflow-hidden mb-2 shadow-sm">
                          <img
                            src={placeholders[index % placeholders.length]}
                            alt={plant.imageAlt}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        </div>
                        <p className="text-xs font-medium text-center line-clamp-2">{plant.name}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-text-secondary dark:text-gray-500 pl-6">No similar species listed.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'care' && (
            <div className="grid grid-cols-1 gap-4 animate-spring-in">
              {[
                { type: 'water', label: 'Watering', icon: 'water_drop', color: 'blue', value: data?.careInstructions?.water },
                { type: 'light', label: 'Light', icon: 'light_mode', color: 'yellow', value: data?.careInstructions?.light },
                { type: 'soil', label: 'Soil', icon: 'grass', color: 'orange', value: data?.careInstructions?.soil },
                { type: 'fertilizer', label: 'Fertilizer', icon: 'eco', color: 'purple', value: data?.careInstructions?.fertilizer },
              ].map((item) => (
                <div
                  key={item.type}
                  onClick={() => toggleReminder(item.type, item.label, item.value)}
                  className={`bg-white dark:bg-white/5 p-4 rounded-xl shadow-subtle dark:shadow-subtle-dark flex items-start gap-4 cursor-pointer border transition-all duration-300 ${reminders[item.type] ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-transparent hover:border-gray-200 dark:hover:border-white/10'}`}
                >
                  <div className={`size-12 rounded-full flex items-center justify-center shrink-0 ${reminders[item.type] ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : `bg-${item.color}-100 dark:bg-${item.color}-900/20 text-${item.color}-600 dark:text-${item.color}-400`}`}>
                    <span className="material-symbols-outlined">{reminders[item.type] ? 'notifications_active' : item.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-sm">{item.label}</h4>
                      {reminders[item.type] && <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wide">Reminder On</span>}
                    </div>
                    <p className="text-sm text-text-secondary dark:text-gray-400 mt-1">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="flex flex-col gap-6 animate-spring-in">
              <div className="bg-white dark:bg-white/5 p-6 rounded-2xl shadow-subtle dark:shadow-subtle-dark text-center">
                <span className="material-symbols-outlined text-4xl text-blue-500 mb-2">calendar_month</span>
                <h3 className="font-semibold text-lg mb-1">Watering Log</h3>
                <p className="text-xs text-text-secondary dark:text-gray-400 mb-4">Track when you last watered {plant.name}</p>
                <button className="px-6 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-bold hover:bg-blue-200 transition-colors">
                  + Log Today
                </button>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-sm uppercase tracking-wide opacity-60 ml-2">History</h4>
                {wateringHistory && wateringHistory.length > 0 ? (
                  wateringHistory.map((log, i) => (
                    <div key={i} className="flex items-center gap-4 bg-white dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                      <div className="size-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
                        <span className="material-symbols-outlined text-lg">water_drop</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{log.date}</p>
                        <p className="text-xs text-text-secondary dark:text-gray-400">Watered {log.amount || 'standard amount'}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm opacity-50 py-4">No records yet.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="flex flex-col gap-8 animate-spring-in">
              <div className="flex justify-between items-center px-1">
                <h4 className="font-semibold text-sm uppercase tracking-wide opacity-60">Scan Journal</h4>
                <div className="flex gap-2">
                   <button
                    onClick={handleAddTimelinePhoto}
                    className="text-xs font-bold text-forest dark:text-sage flex items-center gap-1 bg-green-100 dark:bg-green-900/30 px-3 py-1.5 rounded-full"
                  >
                    <span className="material-symbols-outlined text-sm">add_a_photo</span> Add Photo
                  </button>
                  <input ref={fileInputRef} type="file" className="hidden" accept="image/*" />
                </div>
              </div>

              <div className="relative pl-8 space-y-8 before:content-[''] before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 dark:before:bg-white/10">
                {data.analysis_history && data.analysis_history.length > 0 ? (
                  data.analysis_history.map((entry: any, i: number) => (
                    <div key={i} className="relative">
                      {/* Timeline Dot */}
                      <div className="absolute -left-[26px] top-1.5 size-4 rounded-full bg-forest dark:bg-green-500 border-4 border-background-light dark:border-background-dark z-10 shadow-sm"></div>
                      
                      <div className="bg-white dark:bg-white/5 rounded-2xl overflow-hidden shadow-subtle dark:shadow-subtle-dark border border-black/5 dark:border-white/5">
                        <div className="flex gap-4 p-4">
                          <div className="size-20 rounded-xl overflow-hidden shrink-0 shadow-sm">
                            <img src={entry.image} className="w-full h-full object-cover" alt="Scan" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                              <p className="text-xs font-bold text-text-secondary dark:text-gray-500">
                                {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                              {entry.healthAssessment && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${entry.healthAssessment.isHealthy ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                  {entry.healthAssessment.isHealthy ? 'Healthy' : 'Issues Detected'}
                                </span>
                              )}
                            </div>
                            <h4 className="font-bold text-sm mb-1">{entry.healthAssessment?.diagnosis || entry.commonName || "Scan Result"}</h4>
                            <p className="text-xs text-text-secondary dark:text-gray-400 line-clamp-2 leading-relaxed">
                              {entry.healthAssessment ? entry.healthAssessment.treatment.join(', ') : entry.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="relative">
                    <div className="absolute -left-[26px] top-1.5 size-4 rounded-full bg-gray-300 dark:bg-gray-600 border-4 border-background-light dark:border-background-dark z-10 shadow-sm"></div>
                    <div className="p-10 text-center opacity-50 border-2 border-dashed border-gray-200 dark:border-zinc-700 rounded-2xl">
                      <span className="material-symbols-outlined text-4xl mb-2">history</span>
                      <p className="text-sm">No scans in your journal yet.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50 animate-spring-in">
          <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-full shadow-xl flex items-center gap-3">
            <span className="material-symbols-outlined text-green-400 dark:text-green-600">check_circle</span>
            <p className="text-sm font-medium">{showToast}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlantDetailView;
