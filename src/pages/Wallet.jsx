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

    // Fetch wallet and profile data once
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
            } catch (error) {
                console.error('Failed to fetch wallet data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [sessionId]); // Removed activeTab dependency

    // Fetch transactions only when history tab is active
    useEffect(() => {
        if (!sessionId || activeTab !== 'history') return;

        const fetchTransactions = async () => {
            try {
                const transactionData = await apiFetch('/user/transactions', { sessionId });
                console.log('Transaction data received:', transactionData);
                setTransactions(transactionData.transactions || []);
            } catch (error) {
                console.error('Failed to fetch transactions:', error);
            }
        };
        fetchTransactions();
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
        <div className="wallet-page">
            {/* Header */}
            <header className="wallet-header">
                <div className="wallet-header-content">
                    <h1 className="wallet-title">Wallet</h1>
                </div>
            </header>

            <main className="wallet-main">
                {/* User Info Section */}
                <div className="wallet-panel">
                    <div className="wallet-user-info">
                        <div className="wallet-user-details">
                            <div className="wallet-user-icon">👤</div>
                            <div className="wallet-user-text">
                                <span className="wallet-user-name">
                                    {displayPhone || profileData?.user?.firstName || user?.firstName || 'Player'}
                                </span>
                                {displayPhone && (
                                    <span className="wallet-user-phone">{displayPhone}</span>
                                )}
                            </div>
                        </div>
                        {displayRegistered ? (
                            <div className="wallet-status-verified">
                                <span className="wallet-status-icon">✓</span>
                                <span className="wallet-status-text">Verified</span>
                            </div>
                        ) : (
                            <div className="wallet-status-unverified">
                                <span className="wallet-status-icon">!</span>
                                <span className="wallet-status-text">Not registered</span>
                            </div>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="wallet-segmented">
                        <button
                            onClick={() => setActiveTab('balance')}
                            className={`wallet-seg ${activeTab === 'balance' ? 'active' : ''}`}
                        >
                            Balance
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`wallet-seg ${activeTab === 'history' ? 'active' : ''}`}
                        >
                            History
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="wallet-loading">
                        <div className="wallet-spinner"></div>
                    </div>
                ) : activeTab === 'balance' ? (
                    /* Wallet Balances */
                    <div className="wallet-balances">
                        {/* Main Wallet */}
                        <div className="wallet-card">
                            <div className="wallet-card-content">
                                <div className="wallet-card-label">
                                    <span className="wallet-label-text">Main Wallet</span>
                                    <span className="wallet-label-icon">💰</span>
                                </div>
                                <span className="wallet-value">{wallet.main?.toLocaleString() || 0}</span>
                            </div>
                        </div>

                        {/* Play Wallet */}
                        <div className="wallet-card">
                            <div className="wallet-card-content">
                                <div className="wallet-card-label">
                                    <span className="wallet-label-text">Play Wallet</span>
                                    <span className="wallet-label-icon">🎮</span>
                                </div>
                                <span className="wallet-value wallet-value-green">{wallet.play?.toLocaleString() || 0}</span>
                            </div>
                        </div>

                        {/* Coins */}
                        <div className="wallet-card">
                            <div className="wallet-card-content">
                                <div className="wallet-card-label">
                                    <span className="wallet-label-text">Coins</span>
                                    <span className="wallet-label-icon">🪙</span>
                                </div>
                                <span className="wallet-value wallet-value-yellow">{wallet.coins?.toLocaleString() || 0}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Transaction History */
                    <div className="wallet-history">
                        <h3 className="wallet-history-title">Recent Transactions</h3>
                        {transactions.length === 0 ? (
                            <div className="wallet-empty-state">
                                <div className="wallet-empty-icon">📝</div>
                                <div className="wallet-empty-text">No transactions yet</div>
                            </div>
                        ) : (
                            transactions.map((transaction) => (
                                <div key={transaction.id} className="wallet-transaction">
                                    <div className="wallet-transaction-content">
                                        <div className="wallet-transaction-info">
                                            <div className="wallet-transaction-icon">📄</div>
                                            <div className="wallet-transaction-details">
                                                <div className="wallet-transaction-description">{transaction.description || (transaction.type === 'deposit' ? 'Deposit' : 'Transaction')}</div>
                                                <div className="wallet-transaction-date">
                                                    {new Date(transaction.createdAt).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="wallet-transaction-amount">
                                            <div className={`wallet-transaction-value ${transaction.amount > 0 ? 'positive' : 'negative'}`}>{transaction.amount > 0 ? `+${transaction.amount}` : `${transaction.amount}`}</div>
                                            <div className={`wallet-transaction-status ${transaction.status === 'Approved' || transaction.amount > 0 ? 'approved' : 'pending'}`}>{transaction.status || (transaction.amount > 0 ? 'Approved' : '')}</div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Convert Section - show only on Balance tab */}
                {activeTab === 'balance' && (
                    <div className="wallet-convert">
                        <input
                            value={coins}
                            onChange={(e) => setCoins(e.target.value)}
                            className="wallet-convert-input"
                            placeholder="Enter coins to convert"
                        />
                        <button
                            onClick={convert}
                            className="wallet-convert-button"
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

