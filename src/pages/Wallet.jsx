import React, { useEffect, useState } from 'react';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../lib/auth/AuthProvider.jsx';
import { apiFetch } from '../lib/api/client.js';

export default function Wallet({ onNavigate }) {
    const { sessionId, user } = useAuth();
    const [wallet, setWallet] = useState({ main: 0, play: 0, coins: 0 });
    const [coins, setCoins] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('balance');
    const [transactions, setTransactions] = useState([]);
    const [profileData, setProfileData] = useState(null);
    const [displayPhone, setDisplayPhone] = useState(null);
    const [displayRegistered, setDisplayRegistered] = useState(false);

    useEffect(() => {
        if (!sessionId) {
            console.log('No sessionId available for wallet fetch');
            return;
        }
        const fetchData = async () => {
            try {
                console.log('Fetching wallet data with sessionId:', sessionId);
                setLoading(true);
                // Always hydrate latest profile to reflect DB phone/registration
                try {
                    const profile = await apiFetch('/user/profile', { sessionId });
                    console.log('Profile data for wallet:', profile);
                    setProfileData(profile);
                    setDisplayPhone(profile?.user?.phone || null);
                    setDisplayRegistered(!!profile?.user?.isRegistered);
                } catch (e) {
                    console.error('Profile fetch error:', e);
                }
                const walletData = await apiFetch('/wallet', { sessionId });
                console.log('Wallet data received:', walletData);
                setWallet(walletData);

                if (activeTab === 'history') {
                    const transactionData = await apiFetch('/user/transactions', { sessionId });
                    console.log('Transaction data received:', transactionData);
                    setTransactions(transactionData.transactions || []);
                }
            } catch (error) {
                console.error('Failed to fetch wallet data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [sessionId, activeTab]);

    const convert = async () => {
        if (!sessionId) return;
        const amt = Number(coins || 0);
        if (!amt) return;
        try {
            const out = await apiFetch('/wallet/convert', { method: 'POST', body: { coins: amt }, sessionId });
            setWallet(out.wallet);
            setCoins('');
        } catch { }
    };
    return (
        <div className="min-h-screen overflow-y-auto pb-28 bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900">
            {/* Header */}
            <header className="p-4 pt-16">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-white">Wallet</h1>

                </div>
            </header>

            <main className="p-4 space-y-8">
                {/* User Info Section */}
                <div className="wallet-panel">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full grid place-items-center bg-white/10 border border-white/20 text-white">👤</div>
                            <div className="flex flex-col">
                                <span className="text-white font-medium">
                                    {displayPhone || profileData?.user?.firstName || user?.firstName || 'Player'}
                                </span>
                                {displayPhone && (
                                    <span className="text-slate-300 text-xs">{displayPhone}</span>
                                )}
                            </div>
                        </div>
                        {displayRegistered ? (
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-600/20 border border-green-400/30">
                                <span className="text-green-400 text-sm">✓</span>
                                <span className="text-green-300 text-sm font-medium">Verified</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 bg-yellow-600/20 px-3 py-1 rounded-full border border-yellow-400/30">
                                <span className="text-yellow-400 text-sm">!</span>
                                <span className="text-yellow-300 text-sm font-medium">Not registered</span>
                            </div>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="segmented">
                        <button
                            onClick={() => setActiveTab('balance')}
                            className={`seg ${activeTab === 'balance' ? 'active' : ''}`}
                        >
                            Balance
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`seg ${activeTab === 'history' ? 'active' : ''}`}
                        >
                            History
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400"></div>
                    </div>
                ) : activeTab === 'balance' ? (
                    /* Wallet Balances */
                    <div className="space-y-8">
                        {/* Main Wallet */}
                        <div className="wallet-card">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="label">Main Wallet</span>
                                    <span className="text-blue-400 text-sm">💰</span>
                                </div>
                                <span className="value">{wallet.main?.toLocaleString() || 0}</span>
                            </div>
                        </div>

                        {/* Play Wallet */}
                        <div className="wallet-card">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="label">Play Wallet</span>
                                    <span className="text-green-400 text-sm">🎮</span>
                                </div>
                                <span className="value green">{wallet.play?.toLocaleString() || 0}</span>
                            </div>
                        </div>

                        {/* Coins */}
                        <div className="wallet-card">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="label">Coins</span>
                                    <span className="text-yellow-400 text-sm">🪙</span>
                                </div>
                                <span className="value yellow">{wallet.coins?.toLocaleString() || 0}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Transaction History */
                    <div className="space-y-8">
                        <h3 className="history-title">Recent Transactions</h3>
                        {transactions.length === 0 ? (
                            <div className="rounded-2xl p-8 border border-white/10 bg-slate-900/40 text-center">
                                <div className="text-slate-400 text-lg mb-2">📝</div>
                                <div className="text-slate-300">No transactions yet</div>
                            </div>
                        ) : (
                            transactions.map((transaction) => (
                                <div key={transaction.id} className="history-item">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="icon">📄</div>
                                            <div>
                                                <div className="text-white font-semibold">{transaction.description || (transaction.type === 'deposit' ? 'Deposit' : 'Transaction')}</div>
                                                <div className="text-slate-400 text-xs mt-0.5">
                                                    {new Date(transaction.createdAt).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-lg font-extrabold ${transaction.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{transaction.amount > 0 ? `+${transaction.amount}` : `${transaction.amount}`}</div>
                                            <div className={`text-xs font-semibold ${transaction.status === 'Approved' || transaction.amount > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>{transaction.status || (transaction.amount > 0 ? 'Approved' : '')}</div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Convert Section - show only on Balance tab */}
                {activeTab === 'balance' && (
                    <div className="wallet-card space-y-3 mt-8">
                        <input
                            value={coins}
                            onChange={(e) => setCoins(e.target.value)}
                            className="wallet-input"
                            placeholder="Enter coins to convert"
                        />
                        <button
                            onClick={convert}
                            className="wallet-button flex items-center justify-center gap-2"
                        >
                            <span>↓</span>
                            <span>Convert Coin</span>
                        </button>
                    </div>
                )}
            </main>
            <BottomNav current="wallet" onNavigate={onNavigate} />
        </div>
    );
}

