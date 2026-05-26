
import React, { useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { PlantData } from '../types';
import { useAddToCollection } from '../src/hooks/usePlantify';

interface PlantResultProps {
  data?: PlantData;
  imageUrl?: string;
  onBack: () => void;
  initialIsSaved?: boolean;
}

const PlantResult: React.FC<PlantResultProps> = ({ data: propData, imageUrl: propImageUrl, onBack, initialIsSaved = false }) => {
  const location = useLocation();
  const state = location.state as { data?: PlantData, imageUrl?: string } || {};
  
  const data = propData || state.data;
  const imageUrl = propImageUrl || state.imageUrl;

  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { mutateAsync: addToCollection } = useAddToCollection();

  if (!data || !imageUrl) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-background-dark p-6 text-center">
        <h2 className="text-xl font-bold mb-4">No Result Data</h2>
        <button onClick={onBack} className="px-6 py-2 bg-forest text-white rounded-full">Go Back</button>
      </div>
    );
  }

  // Tabs: 'overview' | 'care' | 'similar' | 'health'
  // If we have healthAssessment data, default to 'health' tab
  const [activeTab, setActiveTab] = useState(data.healthAssessment ? 'health' : 'overview');

  const overviewRef = useRef<HTMLDivElement>(null);
  const careRef = useRef<HTMLDivElement>(null);
  const similarRef = useRef<HTMLDivElement>(null);
  
  // States
  const [isReporting, setIsReporting] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Incorrect Identification');
  const [reportDetails, setReportDetails] = useState('');

  const handleSave = async (triggerSource?: string) => {
    if (isSaving) return;
    
    // If it's already saved and we're just liking, we still want to hit the backend 
    // to update the "liked" status or history, but for simplicity let's just 
    // allow the backend to handle the deduplication.
    
    try {
      setIsSaving(true);
      await addToCollection({
        name: data.commonName || data.plantName || 'Unknown Plant',
        scientificName: data.scientificName || '',
        image: imageUrl,
        tags: ['Scanned', ...(data.healthAssessment ? ['Diagnosis'] : [])],
        data: {
          ...data,
          is_liked: triggerSource === 'like' || isLiked
        } as unknown as Record<string, unknown>
      });
      
      setIsSaved(true);
      if (triggerSource === 'like') {
        setIsLiked(true);
        setShowToast("Added to favorites!");
      } else {
        setShowToast("Saved to your database!");
      }
    } catch (error) {
      console.error('Failed to save plant:', error);
      setShowToast("Failed to save plant. Please try again.");
    } finally {
      setIsSaving(false);
      setTimeout(() => setShowToast(null), 3000);
    }
  };

  const handleLike = async () => {
    if (isLiked) {
      // Toggle off logic could be added here, but for now we just like
      return;
    }
    await handleSave('like');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: data.commonName,
          text: `Check out this ${data.commonName} I identified!`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      alert("Sharing is not supported on this browser.");
    }
  };

  const handleReportSubmit = () => {
    setIsReporting(true);
    // Simulate API call
    setTimeout(() => {
      console.log('Report Submitted:', {
        plant: data.commonName,
        reason: reportReason,
        details: reportDetails
      });
      setIsReporting(false);
      setShowReportModal(false);
      setReportDetails('');
      setReportReason('Incorrect Identification');
      alert('Thank you for your feedback. We will review this issue.');
    }, 1000);
  };

  const scrollToSection = (section: string) => {
    setActiveTab(section);
  };

  // Dummy placeholders
  const placeholders = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBTBxtFcp1dJP6NgIutzYmgzyREGcZb5TZKkjo7yIVgzmFYsAwG_4rlx1GfjxuNpS-UbMopw8lwDFUzcBRO9cTwgoIzvJkiV4QaJA66-z2sz9RE26qRuBa1b7ZMGlcNDRGrU-yZ56ijrUsc-xiCaLpL_Co0J8au4_jbySfySkD7d3py-wxStOoUwpdPritEjE8GMcl5VlHKlLAn9mOYBNjoF4D3RIii5YovqBLjHYvG2sX01lxsHsvVH65WS5LBRcPLBNVudgi0ZOc",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBIpJKMQAnhp99AufyQ_JE3A7a-cVA368bu6bbKObm4LSubXzJDDQ0g9xDgEkZ-lxYx9QNvgG4gXPx18y5a54QXUGxmOAbkcqzH_hft9oWy5PBPbFottGv9EUlkC60JuG_eHL25GNJovo_O-xCJb-7BuYSXZ-3cPt29z3Rcmnpp590FYRxA4lrqgQpPJU61qeH5QaHD1HMR4MBpjCwwJ7Keb-Ty0Xj6bNH1WntzTe0cYI-rXZ8m-8ApbiRKrZGfgweimfooU4VQEjw",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCSZiRD5ZJXa8eKZFp63tpDyNRC85nWPgd1Rpia6f7wQd8CB-sByDN1t2vMnT8FhgbODIBSf00OaWeJE3-tDz4zzLL3hHSQFDwBft_KQPK3PKO83n1ZQ62FRNn4wgFMdJHujWYjEVMVkfvKs8oAxhcQqXLYJPLz9ENDJRlywtQ1cp1nvdGlJqxxXsu4Ds4tm0iSGYhsUoZtZ_ebowJWiigHt4c5aXVkIascIYNIJz67479BsnQPkcFDc8OPnbzsWj0DSDElEQsSbIw"
  ];

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-custom-charcoal dark:text-gray-200 animate-spring-in">
      <header className="flex items-center bg-background-light dark:bg-background-dark px-4 py-3 justify-between sticky top-0 z-30 border-b border-black/5 dark:border-white/5 backdrop-blur-md">
        <button 
          onClick={onBack}
          className="size-10 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <span className="material-symbols-outlined text-custom-charcoal dark:text-gray-200">arrow_back</span>
        </button>
        
        <h2 className="text-custom-charcoal dark:text-gray-200 text-lg font-poppins font-semibold leading-tight tracking-tight">Result</h2>
        
        <div className="flex items-center gap-1">
          <button 
            onClick={handleLike}
            className={`size-10 rounded-full flex items-center justify-center transition-all active:scale-90 ${
              isLiked ? 'text-red-500' : 'text-custom-charcoal dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            <span className={`material-symbols-outlined ${isLiked ? 'fill-1' : ''}`}>
              favorite
            </span>
          </button>
          <button className="flex items-center justify-center size-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
            <span className="material-symbols-outlined text-custom-charcoal dark:text-gray-200">more_horiz</span>
          </button>
        </div>
      </header>
      <main className="flex-1">
        <div className="p-4">
          <div className="relative w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden rounded-xl min-h-[350px] shadow-subtle dark:shadow-none"
            style={{ backgroundImage: `url("${imageUrl}")` }}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

            {/* Diagnosis Badge if present */}
            {data.healthAssessment && (
              <div className={`absolute top-4 right-4 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/20 flex items-center gap-2 ${data.healthAssessment.isHealthy ? 'bg-green-500/90 text-white' : 'bg-amber-500/90 text-white'}`}>
                <span className="material-symbols-outlined text-lg">{data.healthAssessment.isHealthy ? 'check_circle' : 'medical_services'}</span>
                <span className="text-sm font-bold tracking-wide">{data.healthAssessment.isHealthy ? 'Healthy' : 'Diagnosis'}</span>
              </div>
            )}

            {/* Low Confidence Warning Badge */}
            {!data.healthAssessment && (data.confidenceScore ?? data.matchScore ?? 100) < 65 && (
              <div className="absolute top-4 right-4 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/20 flex items-center gap-2 bg-amber-500/95 text-white animate-pulse">
                <span className="material-symbols-outlined text-lg">warning</span>
                <span className="text-sm font-bold tracking-wide">Low Confidence Match</span>
              </div>
            )}

            <div className="relative flex items-end justify-between p-5 text-white">
              <div>
                <h1 className="text-white text-3xl font-poppins font-bold leading-tight drop-shadow-md">
                  {data.healthAssessment && !data.healthAssessment.isHealthy ? data.healthAssessment.diagnosis : data.commonName}
                </h1>
                <p className="text-gray-200 text-base font-normal leading-normal italic pt-1 drop-shadow-md">{data.scientificName}</p>
              </div>

              {!data.healthAssessment && (
                <div className="relative flex size-16 items-center justify-center">
                  <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 36 36">
                    <circle className="stroke-current text-white/20" cx="18" cy="18" fill="none" r="16" strokeWidth="3"></circle>
                    <circle className="stroke-current text-white drop-shadow-md" cx="18" cy="18" fill="none" r="16" strokeDasharray={`${data?.confidenceScore ?? data?.matchScore ?? 90}, 100`} strokeDashoffset="0" strokeLinecap="round" strokeWidth="3"></circle>
                  </svg>
                  <span className="relative text-white font-poppins font-semibold text-lg drop-shadow-md">{data?.confidenceScore ?? data?.matchScore ?? 90}%</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-center gap-4 px-6 pt-4 pb-4">
          <button
            onClick={() => handleSave()}
            disabled={isSaving || isSaved}
            className={`flex h-14 flex-1 flex-col items-center justify-center gap-1.5 rounded-xl transition-all duration-300 shadow-subtle dark:shadow-subtle-dark
              ${isSaved
                ? 'bg-custom-green text-white'
                : 'bg-white dark:bg-white/10 text-custom-charcoal dark:text-gray-200'}`}
          >
            <span className={`material-symbols-outlined !text-[22px] transition-transform ${isSaved ? 'scale-110' : 'text-custom-green dark:text-custom-green'}`}>
              {isSaving ? 'sync' : isSaved ? 'bookmark_added' : 'bookmark_add'}
            </span>
            <span className="text-xs font-medium">{isSaving ? 'Saving...' : isSaved ? 'Saved' : 'Save'}</span>
          </button>

          <button onClick={handleShare} className="flex h-14 flex-1 flex-col items-center justify-center gap-1.5 rounded-xl bg-white dark:bg-white/10 text-custom-charcoal dark:text-gray-200 shadow-subtle dark:shadow-subtle-dark">
            <span className="material-symbols-outlined !text-[22px] text-custom-green dark:text-custom-green">ios_share</span>
            <span className="text-xs font-medium">Share</span>
          </button>
          <button
            onClick={() => setShowReportModal(true)}
            className="flex h-14 flex-1 flex-col items-center justify-center gap-1.5 rounded-xl bg-white dark:bg-white/10 text-custom-charcoal dark:text-gray-200 shadow-subtle dark:shadow-subtle-dark"
          >
            <span className="material-symbols-outlined !text-[22px] text-custom-green dark:text-custom-green">flag</span>
            <span className="text-xs font-medium">Report</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-4 pb-2">
          <div className="relative flex border-b border-custom-gray-border/70 dark:border-white/10 overflow-x-auto scrollbar-hide">
            {data.healthAssessment ? (
              <>
                <button onClick={() => scrollToSection('health')} className={`flex-1 whitespace-nowrap px-4 py-3 text-sm font-semibold transition-colors ${activeTab === 'health' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-custom-gray-text dark:text-gray-400'}`}>Health</button>
                <button onClick={() => scrollToSection('treatment')} className={`flex-1 whitespace-nowrap px-4 py-3 text-sm font-semibold transition-colors ${activeTab === 'treatment' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-custom-gray-text dark:text-gray-400'}`}>Treatment</button>
                <button onClick={() => scrollToSection('overview')} className={`flex-1 whitespace-nowrap px-4 py-3 text-sm font-semibold transition-colors ${activeTab === 'overview' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-custom-gray-text dark:text-gray-400'}`}>Info</button>
              </>
            ) : (
              <>
                <button onClick={() => scrollToSection('overview')} className={`flex-1 whitespace-nowrap px-4 py-3 text-sm font-semibold transition-colors ${activeTab === 'overview' ? 'text-custom-green border-b-2 border-custom-green' : 'text-custom-gray-text dark:text-gray-400'}`}>Overview</button>
                <button onClick={() => scrollToSection('care')} className={`flex-1 whitespace-nowrap px-4 py-3 text-sm font-semibold transition-colors ${activeTab === 'care' ? 'text-custom-green border-b-2 border-custom-green' : 'text-custom-gray-text dark:text-gray-400'}`}>Care</button>
                <button onClick={() => scrollToSection('similar')} className={`flex-1 whitespace-nowrap px-4 py-3 text-sm font-semibold transition-colors ${activeTab === 'similar' ? 'text-custom-green border-b-2 border-custom-green' : 'text-custom-gray-text dark:text-gray-400'}`}>Similar</button>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6 p-6">

          {/* Low Confidence Interactive Panel */}
          {((data.confidenceScore ?? data.matchScore ?? 100) < 65 || data.lowConfidenceDetails) && (
            <div className="flex flex-col gap-4 bg-gradient-to-br from-amber-500/10 to-amber-600/5 dark:from-amber-500/5 dark:to-transparent p-5 rounded-2xl border border-amber-500/20 shadow-sm animate-spring-in">
              <div className="flex gap-3 items-start">
                <div className="size-10 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <span className="material-symbols-outlined text-xl">photo_camera_back</span>
                </div>
                <div>
                  <h3 className="font-bold text-base text-amber-800 dark:text-amber-400">
                    Low Confidence Identification ({data.confidenceScore ?? data.matchScore ?? 50}%)
                  </h3>
                  <p className="text-xs text-amber-700/95 dark:text-amber-400/80 leading-relaxed mt-0.5">
                    Image blur, low light, or background clutter may have affected accuracy. Please check the top alternative matches below and our photography guide.
                  </p>
                </div>
              </div>

              {/* Suggestions checklist */}
              {data.lowConfidenceDetails?.suggestions && data.lowConfidenceDetails.suggestions.length > 0 && (
                <div className="mt-2 bg-white/60 dark:bg-zinc-900/40 p-4 rounded-xl border border-amber-500/10">
                  <h4 className="text-xs font-bold text-custom-charcoal dark:text-gray-200 uppercase tracking-widest flex items-center gap-1.5 mb-2.5">
                    <span className="material-symbols-outlined text-xs text-amber-500">check_circle</span>
                    Tips for a Clearer Scan
                  </h4>
                  <ul className="space-y-2">
                    {data.lowConfidenceDetails.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs text-custom-gray-text dark:text-gray-300">
                        <input type="checkbox" id={`tip-${index}`} className="mt-0.5 size-3.5 rounded border-gray-300 text-amber-500 focus:ring-amber-500 dark:border-zinc-700 shrink-0" />
                        <label htmlFor={`tip-${index}`} className="cursor-pointer select-none leading-normal">
                          {suggestion}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Alternative Matches list */}
              {data.lowConfidenceDetails?.possibleMatches && data.lowConfidenceDetails.possibleMatches.length > 0 && (
                <div className="bg-white/60 dark:bg-zinc-900/40 p-4 rounded-xl border border-amber-500/10">
                  <h4 className="text-xs font-bold text-custom-charcoal dark:text-gray-200 uppercase tracking-widest flex items-center gap-1.5 mb-3">
                    <span className="material-symbols-outlined text-xs text-amber-500">list</span>
                    Top Possible Matches
                  </h4>
                  <div className="space-y-3">
                    {data.lowConfidenceDetails.possibleMatches.map((match, index) => (
                      <div key={index} className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <div>
                            <span className="font-semibold text-custom-charcoal dark:text-white">{match.commonName}</span>
                            <span className="text-[10px] text-custom-gray-text dark:text-gray-400 italic ml-1.5">({match.scientificName})</span>
                          </div>
                          <span className="font-bold text-amber-600 dark:text-amber-400">{match.probability}%</span>
                        </div>
                        {/* Probability Progress Bar */}
                        <div className="h-1.5 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-1000"
                            style={{ width: `${match.probability}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Health Diagnosis Content */}
          {activeTab === 'health' && data.healthAssessment && (
            <div className="flex flex-col gap-4 animate-spring-in">
              <div className={`p-5 rounded-2xl border ${data.healthAssessment.isHealthy ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'}`}>
                <h3 className={`font-bold text-lg mb-2 flex items-center gap-2 ${data.healthAssessment.isHealthy ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                  <span className="material-symbols-outlined">{data.healthAssessment.isHealthy ? 'sentiment_satisfied' : 'sick'}</span>
                  {data.healthAssessment.isHealthy ? "Your plant looks great!" : "Diagnosis Results"}
                </h3>
                <p className="text-sm text-text-primary dark:text-gray-200 leading-relaxed font-medium">
                  {data.healthAssessment.diagnosis}
                </p>
              </div>

              {!data.healthAssessment.isHealthy && (
                <>
                  <div className="bg-white dark:bg-white/5 p-5 rounded-2xl shadow-subtle dark:shadow-subtle-dark border-l-4 border-orange-400">
                    <h3 className="font-semibold mb-3 flex items-center gap-2 text-custom-charcoal dark:text-white">
                      <span className="material-symbols-outlined text-orange-500">search</span>
                      Observed Symptoms
                    </h3>
                    <ul className="pl-2 space-y-2">
                      {data.healthAssessment.symptoms.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-text-secondary dark:text-gray-300">
                          <span className="mt-1 size-1.5 rounded-full bg-orange-400 shrink-0"></span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-white dark:bg-white/5 p-5 rounded-2xl shadow-subtle dark:shadow-subtle-dark">
                    <h3 className="font-semibold mb-3 flex items-center gap-2 text-custom-charcoal dark:text-white">
                      <span className="material-symbols-outlined text-purple-500">psychology</span>
                      Possible Causes
                    </h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-text-secondary dark:text-gray-300">
                      {data.healthAssessment.causes.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Treatment Content */}
          {activeTab === 'treatment' && data.healthAssessment && !data.healthAssessment.isHealthy && (
            <div className="flex flex-col gap-4 animate-spring-in">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-blue-700 dark:text-blue-400">
                  <span className="material-symbols-outlined">healing</span>
                  Treatment Plan
                </h3>
                <div className="space-y-4">
                  {data.healthAssessment.treatment.map((step, i) => (
                    <div key={i} className="flex gap-3 items-start p-3 bg-white/50 dark:bg-black/20 rounded-xl">
                      <div className="size-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-sm">{i + 1}</div>
                      <p className="text-sm text-text-primary dark:text-gray-200 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-5 rounded-2xl border border-green-100 dark:border-green-900/30">
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-green-700 dark:text-green-400">
                  <span className="material-symbols-outlined">shield</span>
                  Prevention Tips
                </h3>
                <ul className="space-y-2">
                  {data.healthAssessment.prevention.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-text-secondary dark:text-gray-300">
                      <span className="material-symbols-outlined text-green-500 text-base">check</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Regular Overview Content */}
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-4 animate-spring-in">
              <p className="text-custom-gray-text dark:text-gray-400 text-sm leading-relaxed">
                {data.description}
              </p>
              
              {/* Species Classification */}
              {data.speciesClassification && (
                <div className="bg-white dark:bg-white/5 p-5 rounded-2xl shadow-subtle dark:shadow-subtle-dark border border-black/5 dark:border-white/5">
                  <h3 className="text-xs font-semibold tracking-wider text-custom-gray-text dark:text-gray-400 uppercase mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-custom-green text-lg">hierarchy</span>
                    Taxonomy & Classification
                  </h3>
                  <div className="flex flex-wrap gap-2 items-center">
                    <div className="flex flex-col px-3 py-1.5 bg-custom-mint/50 dark:bg-custom-green/10 rounded-xl border border-custom-mint/30 dark:border-custom-green/20">
                      <span className="text-[9px] uppercase font-bold tracking-widest text-custom-gray-text dark:text-gray-400">Kingdom</span>
                      <span className="text-xs font-semibold text-custom-charcoal dark:text-white mt-0.5">{data.speciesClassification.kingdom}</span>
                    </div>
                    <span className="material-symbols-outlined text-gray-300 dark:text-zinc-600 text-xs">arrow_forward_ios</span>
                    <div className="flex flex-col px-3 py-1.5 bg-custom-mint/50 dark:bg-custom-green/10 rounded-xl border border-custom-mint/30 dark:border-custom-green/20">
                      <span className="text-[9px] uppercase font-bold tracking-widest text-custom-gray-text dark:text-gray-400">Family</span>
                      <span className="text-xs font-semibold text-custom-charcoal dark:text-white mt-0.5">{data.speciesClassification.family}</span>
                    </div>
                    <span className="material-symbols-outlined text-gray-300 dark:text-zinc-600 text-xs">arrow_forward_ios</span>
                    <div className="flex flex-col px-3 py-1.5 bg-custom-mint/50 dark:bg-custom-green/10 rounded-xl border border-custom-mint/30 dark:border-custom-green/20">
                      <span className="text-[9px] uppercase font-bold tracking-widest text-custom-gray-text dark:text-gray-400">Genus</span>
                      <span className="text-xs font-semibold text-custom-charcoal dark:text-white mt-0.5 italic">{data.speciesClassification.genus}</span>
                    </div>
                    <span className="material-symbols-outlined text-gray-300 dark:text-zinc-600 text-xs">arrow_forward_ios</span>
                    <div className="flex flex-col px-3 py-1.5 bg-custom-green text-white rounded-xl shadow-sm">
                      <span className="text-[9px] uppercase font-bold tracking-widest text-green-100">Species</span>
                      <span className="text-xs font-semibold mt-0.5 italic">{data.speciesClassification.species}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Toxicity Assessment */}
              <div className={`p-5 rounded-2xl border transition-all ${data.isToxic 
                ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900/30' 
                : 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900/30'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`size-8 rounded-full flex items-center justify-center shrink-0 ${data.isToxic 
                    ? 'bg-red-500 text-white shadow-sm' 
                    : 'bg-green-500 text-white shadow-sm'}`}>
                    <span className="material-symbols-outlined text-lg">{data.isToxic ? 'warning' : 'pets'}</span>
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold tracking-wide ${data.isToxic ? 'text-red-800 dark:text-red-400' : 'text-green-800 dark:text-green-400'}`}>
                      {data.isToxic ? 'Toxic Plant Alert' : 'Pet & Human Safe'}
                    </h4>
                    <p className={`text-xs mt-0.5 ${data.isToxic ? 'text-red-700/80 dark:text-red-400/80' : 'text-green-700/80 dark:text-green-400/80'}`}>
                      {data.isToxic ? 'Handle with care' : 'Safe for household environments'}
                    </p>
                  </div>
                </div>
                {data.toxicityDetails && (
                  <p className="text-xs font-medium text-custom-charcoal dark:text-gray-300 leading-relaxed mt-2 pl-11">
                    {data.toxicityDetails}
                  </p>
                )}
              </div>

              {/* Uses (Medicinal/Agricultural) */}
              {data.medicinalOrAgriculturalUses && (
                <div className="bg-white dark:bg-white/5 p-5 rounded-2xl shadow-subtle dark:shadow-subtle-dark border border-black/5 dark:border-white/5">
                  <h3 className="text-xs font-semibold tracking-wider text-custom-gray-text dark:text-gray-400 uppercase mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-custom-green text-lg">medical_services</span>
                    Medicinal & Agricultural Uses
                  </h3>
                  <p className="text-sm text-custom-charcoal dark:text-gray-300 leading-relaxed pl-7">
                    {data.medicinalOrAgriculturalUses}
                  </p>
                </div>
              )}

              {data.funFact && (
                <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/20">
                  <p className="text-sm text-amber-800 dark:text-amber-200 italic">💡 {data.funFact}</p>
                </div>
              )}
            </div>
          )}

          {/* Care Content */}
          {activeTab === 'care' && (
            <div className="grid grid-cols-2 gap-4 animate-spring-in" ref={careRef}>
              <div className="flex flex-col items-center gap-3 rounded-xl bg-white dark:bg-white/5 p-4 shadow-subtle dark:shadow-subtle-dark">
                <div className="flex size-12 items-center justify-center rounded-full bg-custom-mint dark:bg-custom-green/20">
                  <span className="material-symbols-outlined text-custom-green">water_drop</span>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-custom-charcoal dark:text-gray-200">Watering</p>
                  <p className="text-xs text-custom-gray-text dark:text-gray-400">{data?.careInstructions?.water}</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-3 rounded-xl bg-white dark:bg-white/5 p-4 shadow-subtle dark:shadow-subtle-dark">
                <div className="flex size-12 items-center justify-center rounded-full bg-custom-mint dark:bg-custom-green/20">
                  <span className="material-symbols-outlined text-custom-green">light_mode</span>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-custom-charcoal dark:text-gray-200">Sunlight</p>
                  <p className="text-xs text-custom-gray-text dark:text-gray-400">{data?.careInstructions?.light}</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-3 rounded-xl bg-white dark:bg-white/5 p-4 shadow-subtle dark:shadow-subtle-dark">
                <div className="flex size-12 items-center justify-center rounded-full bg-custom-mint dark:bg-custom-green/20">
                  <span className="material-symbols-outlined text-custom-green">grass</span>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-custom-charcoal dark:text-gray-200">Soil</p>
                  <p className="text-xs text-custom-gray-text dark:text-gray-400">{data?.careInstructions?.soil}</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-3 rounded-xl bg-white dark:bg-white/5 p-4 shadow-subtle dark:shadow-subtle-dark">
                <div className="flex size-12 items-center justify-center rounded-full bg-custom-mint dark:bg-custom-green/20">
                  <span className="material-symbols-outlined text-custom-green">eco</span>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-custom-charcoal dark:text-gray-200">Fertilizer</p>
                  <p className="text-xs text-custom-gray-text dark:text-gray-400">{data?.careInstructions?.fertilizer}</p>
                </div>
              </div>
              
              {/* Growth Conditions full width span */}
              {data?.careInstructions?.growthConditions && (
                <div className="col-span-2 flex flex-col items-center gap-3 rounded-xl bg-white dark:bg-white/5 p-4 shadow-subtle dark:shadow-subtle-dark">
                  <div className="flex size-12 items-center justify-center rounded-full bg-custom-mint dark:bg-custom-green/20">
                    <span className="material-symbols-outlined text-custom-green">thermostat</span>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-custom-charcoal dark:text-gray-200">Optimal Growth Conditions</p>
                    <p className="text-xs text-custom-gray-text dark:text-gray-400 mt-1">{data.careInstructions.growthConditions}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Similar Plants */}
          {activeTab === 'similar' && (
            <div ref={similarRef} className="animate-spring-in">
              <div className="flex -mx-6 px-6 space-x-4 overflow-x-auto pb-4 scrollbar-hide">
                {data.similarPlants && data.similarPlants.length > 0 ? (
                  data.similarPlants.map((plant, index) => (
                    <div key={index} className="flex flex-col items-center shrink-0 w-32 group">
                      <img className="size-32 rounded-lg object-cover transition-transform duration-200 group-hover:scale-105"
                        src={placeholders[index % placeholders.length]}
                        alt={plant.imageAlt} />
                      <p className="mt-2 text-sm text-center font-medium text-custom-charcoal dark:text-gray-200">{plant.name}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-custom-gray-text text-sm">No related species found.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowReportModal(false)}></div>
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white dark:bg-zinc-800 shadow-2xl ring-1 ring-black/5 animate-spring-in">
            <div className="p-6">
              <h3 className="text-lg font-bold leading-6 text-custom-charcoal dark:text-white mb-4">
                Report Issue
              </h3>

              <div className="space-y-3 mb-5">
                {['Incorrect Identification', 'Offensive Content', 'Poor Image Quality', 'Other'].map((reason) => (
                  <label key={reason} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="radio"
                        name="reportReason"
                        value={reason}
                        checked={reportReason === reason}
                        onChange={(e) => setReportReason(e.target.value)}
                        className="peer h-4 w-4 border-gray-300 text-custom-green focus:ring-custom-green dark:border-gray-600 dark:bg-zinc-700"
                      />
                    </div>
                    <span className="text-sm text-custom-charcoal dark:text-gray-200 group-hover:text-custom-green dark:group-hover:text-green-400 transition-colors">{reason}</span>
                  </label>
                ))}
              </div>

              <textarea
                className="w-full rounded-xl border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900/50 text-custom-charcoal dark:text-white text-sm p-3 mb-5 focus:ring-custom-green focus:border-custom-green resize-none outline-none transition-all placeholder:text-gray-400"
                rows={3}
                placeholder="Additional details (optional)..."
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
              ></textarea>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  disabled={isReporting}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-custom-charcoal dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReportSubmit}
                  disabled={isReporting}
                  className="rounded-xl bg-custom-green dark:bg-green-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-600 dark:hover:bg-green-500 transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
                >
                  {isReporting && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 animate-spring-in">
          <div className="bg-gray-900/90 dark:bg-white/90 backdrop-blur-md text-white dark:text-gray-900 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-white/10 dark:border-black/5">
            <span className="material-symbols-outlined text-custom-green">check_circle</span>
            <p className="text-sm font-medium">{showToast}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlantResult;
