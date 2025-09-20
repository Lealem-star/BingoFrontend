import React, { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api/client';

export default function AdminHome() {
    const [posts, setPosts] = useState([]);
    const [form, setForm] = useState({ kind: 'image', file: null, caption: '', active: true });
    const [uploading, setUploading] = useState(false);

    const load = async () => {
        const data = await apiFetch('/admin/posts');
        setPosts(data.posts || []);
    };

    useEffect(() => { load(); }, []);

    const submit = async (e) => {
        e.preventDefault();
        if (!form.file) {
            alert('Please select a file to upload');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('kind', form.kind);
            formData.append('file', form.file);
            formData.append('caption', form.caption);
            formData.append('active', form.active);

            await apiFetch('/admin/posts', {
                method: 'POST',
                body: formData,
                headers: {} // Let the browser set Content-Type for FormData
            });

            setForm({ kind: 'image', file: null, caption: '', active: true });
            load();
        } catch (error) {
            console.error('Upload failed:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                formData: {
                    kind: form.kind,
                    file: form.file ? {
                        name: form.file.name,
                        size: form.file.size,
                        type: form.file.type
                    } : null,
                    caption: form.caption,
                    active: form.active
                }
            });
            alert(`Upload failed: ${error.message}. Please try again.`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="px-6 py-8 space-y-8">
            {/* Main Post Creation Area */}
            <div className="bg-gradient-to-br from-white/8 to-white/4 backdrop-blur-sm rounded-3xl p-8 border border-white/15 shadow-2xl shadow-purple-500/10">
                <h2 className="text-white text-2xl font-bold mb-8 text-center bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">What is in Your Mind?</h2>

                <form onSubmit={submit} className="space-y-6">
                    {/* Upload File Section */}
                    <div className="space-y-3">
                        <label className="text-white/90 text-sm font-semibold flex items-center gap-2">
                            <span className="text-amber-400">📁</span>
                            Upload {form.kind}
                        </label>
                        <div className="flex gap-3">
                            <select
                                value={form.kind}
                                onChange={e => setForm({ ...form, kind: e.target.value, file: null })}
                                className="px-4 py-3 rounded-xl bg-white/12 text-white border border-white/25 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400/50 transition-all duration-200 backdrop-blur-sm"
                            >
                                <option value="image">📷 Image</option>
                                <option value="video">🎥 Video</option>
                            </select>
                            <input
                                type="file"
                                accept={form.kind === 'image' ? 'image/*' : 'video/*'}
                                onChange={e => setForm({ ...form, file: e.target.files[0] })}
                                className="flex-1 px-4 py-3 rounded-xl bg-white/12 text-white border border-white/25 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400/50 transition-all duration-200 backdrop-blur-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gradient-to-r file:from-amber-500 file:to-orange-500 file:text-white hover:file:from-amber-600 hover:file:to-orange-600"
                            />
                        </div>
                        {form.file && (
                            <div className="text-white/70 text-sm bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                                <span className="text-green-400">✓</span> Selected: {form.file.name} ({(form.file.size / 1024 / 1024).toFixed(2)} MB)
                            </div>
                        )}
                    </div>

                    {/* Write Your Message Section */}
                    <div className="space-y-3">
                        <label className="text-white/90 text-sm font-semibold flex items-center gap-2">
                            <span className="text-amber-400">✍️</span>
                            Write Your Message
                        </label>
                        <textarea
                            value={form.caption}
                            onChange={e => setForm({ ...form, caption: e.target.value })}
                            placeholder="Write your announcement or message here..."
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl bg-white/12 text-white border border-white/25 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400/50 resize-none transition-all duration-200 backdrop-blur-sm"
                        />
                    </div>

                    {/* Active Toggle */}
                    <div className="flex items-center gap-3 bg-white/5 rounded-xl p-4 border border-white/10">
                        <input
                            id="active"
                            type="checkbox"
                            checked={form.active}
                            onChange={e => setForm({ ...form, active: e.target.checked })}
                            className="w-5 h-5 text-amber-500 bg-white/10 border-white/25 rounded-lg focus:ring-amber-500/50 focus:ring-2"
                        />
                        <label htmlFor="active" className="text-white/90 text-sm font-medium flex items-center gap-2">
                            <span className="text-green-400">🔘</span>
                            Make this post active
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={uploading || !form.file}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-xl shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {uploading ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Uploading...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                <span>🚀</span>
                                Post Announcement
                            </span>
                        )}
                    </button>
                </form>
            </div>

            {/* Recent Posts */}
            <div className="space-y-6">
                <h3 className="text-white text-xl font-bold flex items-center gap-3">
                    <span className="text-amber-400">📋</span>
                    Recent Posts
                </h3>
                <div className="space-y-4">
                    {posts.map(p => (
                        <div key={p._id} className="p-6 rounded-2xl bg-gradient-to-br from-white/8 to-white/4 backdrop-blur-sm border border-white/15 shadow-lg hover:shadow-xl transition-all duration-300 text-white">
                            <div className="flex justify-between items-start mb-4">
                                <div className="font-bold text-amber-400 flex items-center gap-2">
                                    <span>{p.kind === 'image' ? '📷' : '🎥'}</span>
                                    {p.kind.toUpperCase()}
                                </div>
                                <div className="opacity-70 text-sm bg-white/5 px-3 py-1 rounded-lg">
                                    {new Date(p.createdAt).toLocaleString()}
                                </div>
                            </div>
                            <div className="truncate opacity-90 text-sm mb-3 bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                                📁 {p.url || p.filename || 'File uploaded'}
                            </div>
                            {p.caption ? (
                                <div className="opacity-80 text-sm mb-4 bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                                    💬 {p.caption}
                                </div>
                            ) : null}
                            <div className="flex justify-between items-center">
                                <span className={`text-xs px-3 py-2 rounded-full font-medium ${p.active ? 'bg-green-500/20 text-green-400 border border-green-400/30' : 'bg-gray-500/20 text-gray-400 border border-gray-400/30'}`}>
                                    {p.active ? '✅ Active' : '⏸️ Inactive'}
                                </span>
                            </div>
                        </div>
                    ))}
                    {posts.length === 0 && (
                        <div className="text-center text-white/60 py-12 bg-white/5 rounded-2xl border border-white/10">
                            <div className="text-4xl mb-4">📝</div>
                            <div className="text-lg font-medium mb-2">No posts yet</div>
                            <div className="text-sm">Create your first announcement!</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
