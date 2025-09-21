import React, { useState, useEffect } from 'react';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../lib/auth/AuthProvider';
import { apiFetch } from '../lib/api/client';

export default function Profile({ onNavigate }) {
    const [sound, setSound] = useState(true);
    const [profileData, setProfileData] = useState({
        user: {
            firstName: 'User',
            lastName: '',
            phone: null,
            isRegistered: false,
            totalGamesPlayed: 0,
            totalGamesWon: 0,
            registrationDate: new Date()
        },
        wallet: {
            balance: 0,
            coins: 0,
            gamesWon: 0
        }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user, sessionId } = useAuth();

    const displayName = profileData.user?.firstName || user?.firstName || 'Player';
    const initials = displayName.charAt(0).toUpperCase();

    // Fetch profile data
    useEffect(() => {
        const fetchProfileData = async () => {
            if (!sessionId) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                setError(null);
                const data = await apiFetch('/user/profile', { sessionId });
                setProfileData(data);
            } catch (error) {
                console.error('Failed to fetch profile data:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [sessionId]);

    return (
        <div className="profile-page">
            {/* Header */}
            <header className="profile-header">
                <div className="profile-header-content">
                    <div className="profile-avatar">{initials}</div>
                    <h1 className="profile-name">{displayName}</h1>
                    {profileData.user?.isRegistered && (
                        <div className="profile-verified">
                            <span className="profile-verified-icon">✓</span>
                            <span className="profile-verified-text">Verified User</span>
                        </div>
                    )}
                </div>
            </header>

            {/* Main content */}
            <main className="profile-main">
                {loading ? (
                    <div className="profile-loading">
                        <div className="profile-spinner"></div>
                    </div>
                ) : error ? (
                    <div className="profile-error">
                        <div className="profile-error-icon">❌ Error Loading Data</div>
                        <div className="profile-error-text">{error}</div>
                        <button
                            onClick={() => window.location.reload()}
                            className="profile-retry-button"
                        >
                            Retry
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Wallet & Statistics Cards */}
                        <div className="profile-cards">
                            {/* Wallet Balance */}
                            <div className="profile-card">
                                <div className="profile-card-title">
                                    <span className="profile-card-icon">💰</span>
                                    <span className="profile-card-label">Wallet</span>
                                </div>
                                <div className="profile-card-value">{profileData.wallet.balance?.toLocaleString() || 0}</div>
                            </div>

                            {/* Total Coins */}
                            <div className="profile-card">
                                <div className="profile-card-title">
                                    <span className="profile-card-icon">🪙</span>
                                    <span className="profile-card-label">Total Coins</span>
                                </div>
                                <div className="profile-card-value">{profileData.wallet.coins?.toLocaleString() || 0}</div>
                            </div>

                            {/* Games Won */}
                            <div className="profile-card">
                                <div className="profile-card-title">
                                    <span className="profile-card-icon">🏆</span>
                                    <span className="profile-card-label">Games Won</span>
                                </div>
                                <div className="profile-card-value">{profileData.wallet.gamesWon?.toLocaleString() || 0}</div>
                            </div>
                        </div>

                        {/* Settings Section */}
                        <div className="profile-settings">
                            <h2 className="profile-settings-title">Settings</h2>

                            {/* Sound Toggle */}
                            <div className="profile-settings-row">
                                <div className="profile-settings-content">
                                    <div className="profile-settings-label">
                                        <span className="profile-settings-icon">🔉</span>
                                        <span className="profile-settings-text">Sound</span>
                                    </div>
                                    <button onClick={() => setSound(!sound)} className={`profile-switch ${sound ? 'on' : ''}`} aria-pressed={sound}>
                                        <span className="profile-switch-knob"></span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>

            <BottomNav current="profile" onNavigate={onNavigate} />
        </div>
    );
}

