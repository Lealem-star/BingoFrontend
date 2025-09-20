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
        <div className="admin-container">
            {/* Main Post Creation Area */}
            <div className="admin-card">
                <h2 className="admin-title">What is in Your Mind?</h2>

                <form onSubmit={submit} className="admin-form">
                    {/* Upload File Section */}
                    <div className="admin-form-group">
                        <label className="admin-label">
                            <span>📁</span>
                            Upload {form.kind}
                        </label>
                        <div className="admin-input-group">
                            <select
                                value={form.kind}
                                onChange={e => setForm({ ...form, kind: e.target.value, file: null })}
                                className="admin-select"
                            >
                                <option value="image">📷 Image</option>
                                <option value="video">🎥 Video</option>
                            </select>
                            <input
                                type="file"
                                accept={form.kind === 'image' ? 'image/*' : 'video/*'}
                                onChange={e => setForm({ ...form, file: e.target.files[0] })}
                                className="admin-file-input"
                            />
                        </div>
                        {form.file && (
                            <div className="admin-file-selected">
                                <span className="text-green-400">✓</span> Selected: {form.file.name} ({(form.file.size / 1024 / 1024).toFixed(2)} MB)
                            </div>
                        )}
                    </div>

                    {/* Write Your Message Section */}
                    <div className="admin-form-group">
                        <label className="admin-label">
                            <span>✍️</span>
                            Write Your Message
                        </label>
                        <textarea
                            value={form.caption}
                            onChange={e => setForm({ ...form, caption: e.target.value })}
                            placeholder="Write your announcement or message here..."
                            rows={4}
                            className="admin-textarea"
                        />
                    </div>

                    {/* Active Toggle */}
                    <div className="admin-checkbox-group">
                        <input
                            id="active"
                            type="checkbox"
                            checked={form.active}
                            onChange={e => setForm({ ...form, active: e.target.checked })}
                            className="admin-checkbox"
                        />
                        <label htmlFor="active" className="admin-checkbox-label">
                            <span>🔘</span>
                            Make this post active
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={uploading || !form.file}
                        className="admin-button"
                    >
                        {uploading ? (
                            <span className="admin-button-content">
                                <div className="admin-spinner"></div>
                                Uploading...
                            </span>
                        ) : (
                            <span className="admin-button-content">
                                <span>🚀</span>
                                Post Announcement
                            </span>
                        )}
                    </button>
                </form>
            </div>

            {/* Recent Posts */}
            <div className="admin-posts-section">
                <h3 className="admin-section-title">
                    <span>📋</span>
                    Recent Posts
                </h3>
                <div className="admin-posts-list">
                    {posts.map(p => (
                        <div key={p._id} className="admin-post-card">
                            <div className="admin-post-header">
                                <div className="admin-post-type">
                                    <span>{p.kind === 'image' ? '📷' : '🎥'}</span>
                                    {p.kind.toUpperCase()}
                                </div>
                                <div className="admin-post-date">
                                    {new Date(p.createdAt).toLocaleString()}
                                </div>
                            </div>
                            <div className="admin-post-file">
                                📁 {p.url || p.filename || 'File uploaded'}
                            </div>
                            {p.caption ? (
                                <div className="admin-post-caption">
                                    💬 {p.caption}
                                </div>
                            ) : null}
                            <div className="admin-post-status">
                                <span className={`admin-status-badge ${p.active ? 'admin-status-active' : 'admin-status-inactive'}`}>
                                    {p.active ? '✅ Active' : '⏸️ Inactive'}
                                </span>
                            </div>
                        </div>
                    ))}
                    {posts.length === 0 && (
                        <div className="admin-empty-state">
                            <div className="admin-empty-icon">📝</div>
                            <div className="admin-empty-title">No posts yet</div>
                            <div className="admin-empty-subtitle">Create your first announcement!</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
