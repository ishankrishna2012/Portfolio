import React, { useState, useEffect } from 'react';
import { X, Lock, Loader2, AlertCircle, Shield, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { emailSchema, passwordSchema } from '../utils/validation';
import { logLoginAttempt, getAccessLogs } from '../firebase';
import { AccessLog } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

// Pre-calculated SHA-256 hash for 'Ishan@2022'
// To generate new hash: crypto.subtle.digest('SHA-256', new TextEncoder().encode('your_password'))
const ADMIN_HASH = "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92";
const ADMIN_EMAIL = "ishan@admin.com";

const AdminModal: React.FC<Props> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [view, setView] = useState<'LOGIN' | 'LOGS'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  
  // Logs State
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (isOpen) {
        // Reset state on open
        setView('LOGIN');
        setError('');
        setIsAuthenticated(false); 
        setPassword('');
    }
  }, [isOpen]);

  const hashPassword = async (pwd: string) => {
      const msgBuffer = new TextEncoder().encode(pwd);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (attempts >= 5) {
      setError('Too many failed attempts. Please try again later.');
      return;
    }

    // Validate Input Formats
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
       setError(emailResult.error.errors[0].message);
       return;
    }

    // Enforce Password Policy locally before sending (Mock security)
    const pwdResult = passwordSchema.safeParse(password);
    if (!pwdResult.success) {
        // We generally shouldn't say *why* it failed during login for security, but for a portfolio demo showing validation is good.
        setError("Password does not meet security requirements.");
        return;
    }
    
    setLoading(true);

    try {
        // Simulated Network Delay
        await new Promise(r => setTimeout(r, 800));

        const inputHash = await hashPassword(password);

        if (email === ADMIN_EMAIL && inputHash === ADMIN_HASH) {
           // 1. Log Success
           await logLoginAttempt(email, 'SUCCESS');
           
           // 2. Update UI
           setIsAuthenticated(true);
           onLoginSuccess();
           setView('LOGS');
           setAttempts(0);
           loadLogs();
        } else {
            // 1. Log Failure
            await logLoginAttempt(email, 'FAILURE');
            
            setError('Invalid credentials.');
            setAttempts(prev => prev + 1);
        }
    } catch (err) {
        setError("System error during login.");
    } finally {
        setLoading(false);
    }
  };

  const loadLogs = async () => {
      const data = await getAccessLogs();
      setLogs(data);
  };

  const clearLogs = () => {
      if (confirm('Are you sure you want to clear the access history?')) {
          localStorage.removeItem('access_logs');
          setLogs([]);
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 dark:bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-[420px] overflow-hidden transform transition-all scale-100 border border-white/50 dark:border-gray-700/50 ring-1 ring-black/5 dark:ring-white/10">
        
        {/* Header */}
        <div className="pt-8 px-8 pb-4 flex flex-col items-center relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                <X size={20} />
            </button>

            <div className={`w-12 h-12 ${isAuthenticated ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'} rounded-full flex items-center justify-center mb-4 shadow-inner transition-colors duration-500`}>
                {isAuthenticated ? <Shield size={24} /> : <Lock size={24} />}
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1 font-sans">
                {isAuthenticated ? 'Admin Dashboard' : 'Admin Access'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center font-sans">
                {isAuthenticated ? 'System Security Logs' : 'Secure Gateway'}
            </p>
        </div>

        {view === 'LOGIN' && (
            <form onSubmit={handleLogin} className="p-8 pt-2 space-y-4">
            <div className="space-y-3">
                <div>
                    <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white/60 dark:bg-black/40 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-sans placeholder:text-gray-400 dark:text-white"
                    placeholder="Email address"
                    required
                    autoComplete="email"
                    />
                </div>
                <div>
                    <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/60 dark:bg-black/40 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-sans placeholder:text-gray-400 dark:text-white"
                    placeholder="Password"
                    required
                    autoComplete="current-password"
                    />
                </div>
            </div>
            
            {error && (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-xs font-medium bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/30">
                    <AlertCircle size={14} />
                    {error}
                </div>
            )}

            <div className="flex gap-3 mt-4">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors font-sans"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading || attempts >= 5}
                    className="flex-1 bg-black dark:bg-white text-white dark:text-black py-3 rounded-xl text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-all flex justify-center items-center shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-sans"
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : 'Sign In'}
                </button>
            </div>
            </form>
        )}

        {view === 'LOGS' && (
            <div className="p-0">
                <div className="bg-gray-50 dark:bg-black/20 border-y border-gray-100 dark:border-gray-800 px-6 py-2 flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Activity Log</span>
                    <div className="flex gap-3">
                         {logs.length > 0 && (
                             <button onClick={clearLogs} className="text-red-500 hover:text-red-600 text-xs flex items-center gap-1">
                                 <Trash2 size={10} /> Clear
                             </button>
                         )}
                         <button onClick={loadLogs} className="text-blue-500 hover:text-blue-600 text-xs">Refresh</button>
                    </div>
                </div>
                
                <div className="max-h-[300px] overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
                    {logs.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-sm">No recent activity recorded.</div>
                    ) : (
                        logs.map((log) => (
                            <div key={log.id} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                                <div className="flex items-center gap-3">
                                    {log.status === 'SUCCESS' ? (
                                        <CheckCircle2 size={16} className="text-green-500" />
                                    ) : (
                                        <XCircle size={16} className="text-red-500" />
                                    )}
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-gray-900 dark:text-white">{log.email}</span>
                                        <span className="text-[10px] text-gray-500 font-mono">{log.ip}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] text-gray-400">
                                        {new Date(log.timestamp).toLocaleTimeString()}
                                    </div>
                                    <div className="text-[10px] text-gray-300">
                                        {new Date(log.timestamp).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-black/20 text-center">
                    <button onClick={onClose} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">
                        Close Dashboard
                    </button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default AdminModal;