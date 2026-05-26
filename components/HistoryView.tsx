import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { scansApi } from '../src/api/scans.api';
import { useAuth } from '../src/store/useAuthStore';
import { ArrowLeft, Clock, Copy, ChevronRight, Search, Leaf, AlertTriangle } from 'lucide-react';

interface Scan {
    id: string;
    created_at: string;
    image_url: string;
    data: any;
    type: string;
}

const HistoryView: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [scans, setScans] = useState<Scan[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!user) return;

        const fetchScans = async () => {
            setLoading(true);
            try {
                const response = await scansApi.getAll();
                // Depending on API response structure, it might be in response.data
                setScans(response.data || response || []);
            } catch (err) {
                console.error('Error fetching scans:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchScans();
    }, [user]);

    const filteredScans = scans.filter(scan => {
        const plantName = scan.data?.plantName || scan.data?.name || scan.data?.commonName || '';
        return plantName.toLowerCase().includes(searchQuery.toLowerCase()) || 
               scan.type.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const handleCopy = (content: any) => {
        const text = JSON.stringify(content, null, 2);
        navigator.clipboard.writeText(text);
        alert('Content copied to clipboard!');
    };

    return (
        <div className="min-h-screen bg-[#F8FAF9] dark:bg-[#0A0F0C] font-sans pb-10">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-white/80 dark:bg-black/40 backdrop-blur-xl border-b border-emerald-900/5 dark:border-white/5 px-6 py-4">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-emerald-900 dark:text-emerald-50" />
                        </button>
                        <h1 className="text-xl font-bold text-emerald-900 dark:text-emerald-50 tracking-tight">
                            Scan History
                        </h1>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-6 pt-6">
                {/* Search Bar */}
                <div className="relative mb-8 group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search className="w-5 h-5 text-emerald-900/30 dark:text-emerald-50/20 group-focus-within:text-emerald-600 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search your scans..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white dark:bg-emerald-900/10 border border-emerald-900/10 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-emerald-900 dark:text-emerald-50 placeholder:text-emerald-900/30 dark:placeholder:text-emerald-50/20 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-sm"
                    />
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600"></div>
                        <p className="text-emerald-900/40 dark:text-emerald-50/40 text-sm font-medium">Loading your botanical history...</p>
                    </div>
                ) : filteredScans.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
                        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center">
                            <Leaf className="w-10 h-10 text-emerald-600" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-50">No scans found</h3>
                            <p className="text-emerald-900/40 dark:text-emerald-50/40 text-sm max-w-[240px]">
                                Your identification and diagnosis history will appear here.
                            </p>
                        </div>
                        <button 
                            onClick={() => navigate('/scan')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                        >
                            Start Scanning
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredScans.map((scan) => (
                            <div 
                                key={scan.id}
                                className="group relative bg-white dark:bg-emerald-900/5 border border-emerald-900/5 dark:border-white/5 rounded-3xl p-4 flex items-center gap-4 hover:border-emerald-500/30 transition-all hover:shadow-xl hover:shadow-emerald-900/5"
                            >
                                {/* Thumbnail */}
                                <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-emerald-50 dark:bg-emerald-900/20 flex-shrink-0">
                                    {scan.image_url ? (
                                        <img 
                                            src={scan.image_url} 
                                            alt="Scan" 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    ) : (
                                        <Leaf className="w-8 h-8 text-emerald-600 m-auto absolute inset-0" />
                                    )}
                                    <div className="absolute top-1 right-1">
                                        <div className={`p-1 rounded-lg backdrop-blur-md border ${
                                            scan.type === 'identify' 
                                            ? 'bg-emerald-500/20 border-emerald-500/20 text-emerald-600' 
                                            : 'bg-orange-500/20 border-orange-500/20 text-orange-600'
                                        }`}>
                                            {scan.type === 'identify' ? <Leaf className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                                        </div>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0 pr-8">
                                    <h4 className="font-bold text-emerald-900 dark:text-emerald-50 truncate">
                                        {scan.data?.plantName || scan.data?.name || scan.data?.commonName || (scan.type === 'identify' ? 'Plant Identified' : 'Health Diagnosis')}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Clock className="w-3 h-3 text-emerald-900/30 dark:text-emerald-50/30" />
                                        <span className="text-xs text-emerald-900/40 dark:text-emerald-50/40">
                                            {new Date(scan.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="absolute right-4 flex flex-col gap-2">
                                    <button 
                                        onClick={() => handleCopy(scan.data)}
                                        className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl text-emerald-600 transition-colors"
                                        title="Copy Content"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => navigate('/result', { state: { data: scan.data, imageUrl: scan.image_url } })}
                                        className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl text-emerald-900 dark:text-emerald-50 transition-colors"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default HistoryView;
