
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, Leaf, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';

interface LoginViewProps {
    initialMode?: 'signin' | 'signup' | 'reset' | 'updatePassword';
    onComplete?: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ initialMode = 'signin', onComplete }) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<'signin' | 'signup' | 'reset' | 'updatePassword'>(initialMode);
    const [resetSent, setResetSent] = useState(false);

    // Sync mode if initialMode prop changes (important for recovery redirect)
    React.useEffect(() => {
        setMode(initialMode);
    }, [initialMode]);

    React.useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                setMode('updatePassword');
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (mode === 'signin') {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            } else if (mode === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        }
                    }
                });
                if (error) throw error;
                alert('Check your email for the confirmation link!');
            } else if (mode === 'reset') {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}`,
                });
                if (error) throw error;
                setResetSent(true);
            } else if (mode === 'updatePassword') {
                const { error } = await supabase.auth.updateUser({
                    password: password,
                });
                if (error) throw error;
                alert('Password updated successfully!');
                if (onComplete) {
                    onComplete();
                }
                setMode('signin');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="relative min-h-[100dvh] w-full flex items-center justify-center overflow-hidden font-body bg-[#121A15]">
            {/* Background Image */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700"
                style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=2000&auto=format&fit=crop')`,
                }}
            >
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
            </div>

            {/* Glassmorphism Card */}
            <div className="relative z-10 w-full max-w-[440px] px-6 animate-spring-in">
                <div className="bg-white/70 backdrop-blur-2xl border border-white/40 rounded-[2.5rem] p-8 md:p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)]">

                    {/* Branding */}
                    <div className="flex flex-col items-center mb-8 text-center">
                        <div className="w-16 h-16 bg-emerald-600/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-emerald-600/20 shadow-lg shadow-emerald-900/10">
                            <Leaf className="w-8 h-8 text-emerald-700 fill-emerald-600/10" />
                        </div>
                        <h1 className="text-4xl font-bold text-emerald-900 tracking-tight mb-2 font-playfair">
                            Plantify
                        </h1>
                        <p className="text-gray-600 text-sm font-medium tracking-wide">
                            Your intelligent botanical companion
                        </p>
                    </div>

                    {/* Mode Toggle */}
                    {mode === 'signin' || mode === 'signup' ? (
                        <div className="flex bg-emerald-900/5 p-1 rounded-2xl mb-8 border border-emerald-900/10">
                            <button
                                onClick={() => { setMode('signin'); setError(null); }}
                                className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${mode === 'signin' ? 'bg-white text-emerald-900 shadow-md' : 'text-emerald-900/40 hover:text-emerald-900/60'}`}
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => { setMode('signup'); setError(null); }}
                                className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${mode === 'signup' ? 'bg-white text-emerald-900 shadow-md' : 'text-emerald-900/40 hover:text-emerald-900/60'}`}
                            >
                                Sign Up
                            </button>
                        </div>
                    ) : mode === 'reset' ? (
                        <div className="mb-8 text-center animate-spring-in">
                            <h2 className="text-xl font-bold text-emerald-900">Reset Password</h2>
                            <p className="text-gray-500 text-xs mt-1">Enter your email to receive a reset link</p>
                        </div>
                    ) : mode === 'updatePassword' ? (
                        <div className="mb-8 text-center animate-spring-in">
                            <h2 className="text-xl font-bold text-emerald-900">Update Password</h2>
                            <p className="text-gray-500 text-xs mt-1">Enter your new secure password</p>
                        </div>
                    ) : null}

                    {resetSent && (
                        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-700 text-xs font-medium animate-spring-in text-center">
                            Password reset link sent! Check your inbox.
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-700 text-sm font-medium animate-spring-in text-center">
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleEmailLogin} className="space-y-5">
                        {/* Name Input - Only for Sign Up */}
                        {mode === 'signup' && (
                            <div className="relative group animate-spring-in">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-lg text-emerald-900/40 group-focus-within:text-emerald-600 transition-colors">person</span>
                                </div>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Full Name"
                                    className="w-full bg-white/50 border border-emerald-900/10 focus:border-emerald-500/50 outline-none rounded-2xl py-4 pl-12 pr-4 text-emerald-900 placeholder:text-emerald-900/30 text-sm transition-all focus:bg-white/80 focus:ring-4 focus:ring-emerald-500/10"
                                    required={mode === 'signup'}
                                />
                            </div>
                        )}

                        {/* Email Input */}
                        {mode !== 'updatePassword' && (
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <Mail className="w-5 h-5 text-emerald-900/40 group-focus-within:text-emerald-600 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email address"
                                    className="w-full bg-white/50 border border-emerald-900/10 focus:border-emerald-500/50 outline-none rounded-2xl py-4 pl-12 pr-4 text-emerald-900 placeholder:text-emerald-900/30 text-sm transition-all focus:bg-white/80 focus:ring-4 focus:ring-emerald-500/10"
                                    required={mode !== 'updatePassword'}
                                />
                            </div>
                        )}

                        {/* Password Input */}
                        {(mode !== 'reset') && (
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <Lock className="w-5 h-5 text-emerald-900/40 group-focus-within:text-emerald-600 transition-colors" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={mode === 'updatePassword' ? "New Password" : "Password"}
                                    className="w-full bg-white/50 border border-emerald-900/10 focus:border-emerald-500/50 outline-none rounded-2xl py-4 pl-12 pr-12 text-emerald-900 placeholder:text-emerald-900/30 text-sm transition-all focus:bg-white/80 focus:ring-4 focus:ring-emerald-500/10"
                                    required={mode !== 'reset'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-4 flex items-center text-emerald-900/40 hover:text-emerald-900/60 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        )}

                        {mode === 'signin' && (
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => { setMode('reset'); setError(null); }}
                                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-600 transition-colors"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        )}

                        {mode === 'reset' && (
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => { setMode('signin'); setError(null); setResetSent(false); }}
                                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-600 transition-colors"
                                >
                                    Back to Sign In
                                </button>
                            </div>
                        )}

                        {/* Primary Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-bold py-4 rounded-2xl shadow-[0_10px_20px_-5px_rgba(16,185,129,0.3)] hover:shadow-[0_15px_30px_-5px_rgba(16,185,129,0.4)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:hover:translate-y-0"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>
                                        {mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : mode === 'reset' ? 'Send Reset Link' : 'Update Password'}
                                    </span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>



                    {/* Footer Credits */}
                    <p className="mt-10 text-center text-emerald-900/20 text-[10px] font-medium tracking-[0.2em] uppercase">
                        Powered by Botanical AI
                    </p>
                </div>
            </div>

            {/* Floating decorative elements */}
            <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-green-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
        </div>
    );
};

export default LoginView;
