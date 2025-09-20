import React, { useState, useEffect } from 'react';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../lib/auth/AuthProvider';
import { apiFetch } from '../lib/api/client';

export default function Scores({ onNavigate }) {
    const { sessionId, user } = useAuth();
    const [userStats, setUserStats] = useState({
        totalGamesPlayed: 0,
        totalGamesWon: 0,
        totalWinnings: 0,
        winRate: 0
    });
    const [loading, setLoading] = useState(true);
    const [topFilter, setTopFilter] = useState('newyear'); // newyear | alltime | monthly | weekly | daily

    const leaderboards = {
        newyear: [
            { name: 'Kiya', played: 1293, wins: 102 },
            { name: 'djx@etc', played: 774, wins: 97 },
            { name: 'Sara', played: 650, wins: 80 }
        ],
        alltime: [
            { name: 'Alpha', played: 2301, wins: 320 },
            { name: 'Beta', played: 2019, wins: 298 },
            { name: 'Gamma', played: 1890, wins: 276 }
        ],
        monthly: [
            { name: 'Miki', played: 120, wins: 28 },
            { name: 'Lulu', played: 110, wins: 25 },
            { name: 'Noah', played: 95, wins: 22 }
        ],
        weekly: [
            { name: 'Ken', played: 38, wins: 9 },
            { name: 'Abel', played: 34, wins: 8 },
            { name: 'Ruth', played: 30, wins: 7 }
        ],
        daily: [
            { name: 'Mina', played: 9, wins: 3 },
            { name: 'Yon', played: 8, wins: 2 },
            { name: 'Geez', played: 7, wins: 2 }
        ]
    };

    useEffect(() => {
        if (!sessionId) return;
        const fetchUserStats = async () => {
            try {
                setLoading(true);
                const data = await apiFetch('/user/profile', { sessionId });
                const stats = data.user;
                setUserStats({
                    totalGamesPlayed: stats.totalGamesPlayed || 0,
                    totalGamesWon: stats.totalGamesWon || 0,
                    totalWinnings: stats.totalWinnings || 0,
                    winRate: stats.totalGamesPlayed > 0 ? Math.round((stats.totalGamesWon / stats.totalGamesPlayed) * 100) : 0
                });
            } catch (error) {
                console.error('Failed to fetch user stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUserStats();
    }, [sessionId]);

    return (
        <div className="min-h-screen overflow-y-auto pb-28 bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900">
            <main className="p-6 pt-16 space-y-6">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400"></div>
                    </div>
                ) : (
                    <>
                        {/* Leaderboard header */}
                        <section>
                            <h2 className="text-white font-extrabold mb-3">Leaderboard</h2>
                            <div className="wallet-card">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="profile-avatar" style={{ width: 40, height: 40, fontSize: 16 }}>
                                            {String(user?.firstName || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="text-white font-semibold">{user?.firstName || 'User'}</div>
                                            <div className="text-slate-400 text-xs">{userStats.totalGamesPlayed} Played • {userStats.totalGamesWon} wins</div>
                                        </div>
                                    </div>
                                    <div className="px-3 py-1 rounded-full bg-slate-800/70 border border-white/10 text-slate-200 text-xs">Unranked</div>
                                </div>
                            </div>
                        </section>

                        {/* Top Players filter bar + list (placeholder) */}
                        <section>
                            <h3 className="text-white font-extrabold mb-2">Top Players</h3>
                            <div className="segmented mb-3">
                                <button onClick={() => setTopFilter('newyear')} className={`seg ${topFilter === 'newyear' ? 'active' : ''}`}>New year</button>
                                <button onClick={() => setTopFilter('alltime')} className={`seg ${topFilter === 'alltime' ? 'active' : ''}`}>All time</button>
                                <button onClick={() => setTopFilter('monthly')} className={`seg ${topFilter === 'monthly' ? 'active' : ''}`}>Monthly</button>
                                <button onClick={() => setTopFilter('weekly')} className={`seg ${topFilter === 'weekly' ? 'active' : ''}`}>Weekly</button>
                                <button onClick={() => setTopFilter('daily')} className={`seg ${topFilter === 'daily' ? 'active' : ''}`}>Daily</button>
                            </div>
                            <div className="space-y-3">
                                {(leaderboards[topFilter] || []).map((p, i) => (
                                    <div key={p.name} className="history-item">
                                        <div className="flex items-center gap-3">
                                            <div className="icon">{i + 1}</div>
                                            <div className="flex-1">
                                                <div className="text-white font-semibold">{p.name}</div>
                                                <div className="text-slate-400 text-xs">{p.wins} wins</div>
                                            </div>
                                            <div className="text-slate-200 font-extrabold">{p.played}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </>
                )}
            </main>
            <BottomNav current="scores" onNavigate={onNavigate} />
        </div>
    );
}

