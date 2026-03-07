import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBlog } from '../context/BlogContext.jsx';
import { BLOG_CATEGORIES, COVER_GRADIENTS } from '@/lib/constants.js';
import {
    Save, Send, Bold, Italic, Heading2, List, Quote, RotateCcw, CheckCircle,
    ImagePlus, X, Eye, Heart, Clock, Calendar, Stethoscope, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { uploadBlogImage } from '@/lib/uploadImage.js';
import { supabase } from '@/lib/supabase.js';

const EMPTY = { title: '', category: BLOG_CATEGORIES[0], tags: '', excerpt: '', content: '', coverGradient: COVER_GRADIENTS[0], readTime: 5, imageUrl: '' };

function ToolbarBtn({ onClick, title, children }) {
    return (
        <button type="button" onClick={onClick} title={title}
            className="h-7 px-2 rounded flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition text-xs font-mono">
            {children}
        </button>
    );
}

/* ── Live Preview Card ──────────────────────────────────────────────────── */
function LivePreview({ form, blogger }) {
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
    const today = format(new Date(), 'dd MMM yyyy');
    const hasContent = form.title || form.excerpt;

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <Eye size={11} /> Live Preview
            </h3>

            {/* Card preview */}
            <div className="rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                {/* Cover */}
                <div className={cn(`bg-gradient-to-br ${form.coverGradient} flex items-end p-3 relative overflow-hidden`, form.imageUrl ? 'h-36' : 'h-28')}>
                    {form.imageUrl && (
                        <img src={form.imageUrl} alt="cover" className="absolute inset-0 w-full h-full object-cover" />
                    )}
                    {/* Overlay when image set */}
                    {form.imageUrl && <div className="absolute inset-0 bg-black/30" />}
                    <span className="relative z-10 text-[10px] font-semibold text-white/90 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                        {form.category}
                    </span>
                </div>

                {/* Card body */}
                <div className="p-3">
                    {hasContent ? (
                        <>
                            <h4 className="text-sm font-bold text-slate-800 line-clamp-2 mb-1 leading-snug">
                                {form.title || 'Your article title will appear here…'}
                            </h4>
                            <p className="text-[11px] text-slate-500 line-clamp-2 mb-2">
                                {form.excerpt || 'The excerpt you write will appear here as the card description.'}
                            </p>
                            {tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                    {tags.slice(0, 3).map(t => (
                                        <span key={t} className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-400 text-[10px]">{t}</span>
                                    ))}
                                </div>
                            )}
                            <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
                                <div className="h-6 w-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                                    style={{ background: blogger?.avatarColor || '#0d9488' }}>
                                    {(blogger?.name || 'B')[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-semibold text-slate-700 truncate">{blogger?.name || 'Author Name'}</p>
                                    <p className="text-[9px] text-slate-400">{today}</p>
                                </div>
                                <div className="flex items-center gap-2 text-[9px] text-slate-400">
                                    <span className="flex items-center gap-0.5"><Clock size={8} /> {form.readTime}m</span>
                                    <span className="flex items-center gap-0.5"><Heart size={8} /> 0</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="py-4 text-center">
                            <p className="text-[11px] text-slate-400">Start typing to see a preview…</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Article header mini-preview */}
            {form.title && (
                <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Article View</p>
                    <div className={cn(`bg-gradient-to-br ${form.coverGradient} h-14 rounded-lg relative overflow-hidden mb-2`)}>
                        {form.imageUrl && (
                            <img src={form.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-70" />
                        )}
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute bottom-2 left-2">
                            <span className="text-[9px] text-white/80 bg-white/20 px-1.5 py-0.5 rounded-full">{form.category}</span>
                        </div>
                    </div>
                    <p className="text-xs font-bold text-slate-800 line-clamp-1 mb-1">{form.title}</p>
                    {form.tags && (
                        <div className="flex flex-wrap gap-1 mb-1.5">
                            {tags.slice(0, 2).map(t => (
                                <span key={t} className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[9px]">{t}</span>
                            ))}
                        </div>
                    )}
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-100">
                        <div className="h-5 w-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
                            style={{ background: blogger?.avatarColor || '#0d9488' }}>
                            {(blogger?.name || 'B')[0]}
                        </div>
                        <div>
                            <p className="text-[9px] font-semibold text-slate-700">{blogger?.name || 'Author'}</p>
                            {blogger?.specialty && (
                                <p className="text-[8px] text-slate-400 flex items-center gap-0.5"><Stethoscope size={7} /> {blogger.specialty}</p>
                            )}
                        </div>
                        <div className="ml-auto flex items-center gap-2 text-[9px] text-slate-400">
                            <span className="flex items-center gap-0.5"><Calendar size={8} /> {today}</span>
                            <span className="flex items-center gap-0.5"><Clock size={8} /> {form.readTime}m</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ── Image Upload ───────────────────────────────────────────────────────── */
function ImageUpload({ imageUrl, onChange, bloggerId }) {
    const fileInputRef = useRef(null);
    const [urlInput, setUrlInput] = useState('');
    const [urlMode, setUrlMode] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');

    /**
     * handleFile
     * Uploads the selected/dropped image to Supabase Storage `blog-images`
     * and calls onChange() with the returned public URL.
     */
    const handleFile = async (file) => {
        if (!file || !file.type.startsWith('image/')) return;
        setUploadError('');
        setUploading(true);
        try {
            // Get the current auth user ID for the storage path
            const { data: { user } } = await supabase.auth.getUser();
            const userId = user?.id || bloggerId || 'anonymous';
            const url = await uploadBlogImage(file, userId);
            onChange(url);
        } catch (err) {
            setUploadError(err.message || 'Upload failed. Try again.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        handleFile(file);
    };

    const applyUrl = () => {
        if (urlInput.trim()) { onChange(urlInput.trim()); setUrlMode(false); setUrlInput(''); }
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <ImagePlus size={11} /> Featured Image
            </h3>

            {imageUrl ? (
                <div className="relative">
                    <img src={imageUrl} alt="Featured" className="w-full h-32 object-cover rounded-lg border border-slate-100" />
                    <button onClick={() => onChange('')}
                        className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-red-500 transition-colors">
                        <X size={12} />
                    </button>
                    <p className="text-[10px] text-emerald-600 mt-1.5 flex items-center gap-1">
                        <CheckCircle size={9} /> Image uploaded to Supabase Storage
                    </p>
                </div>
            ) : (
                <>
                    {/* Drop zone */}
                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => !uploading && fileInputRef.current?.click()}
                        className={cn(
                            'border-2 border-dashed rounded-xl p-5 text-center transition-all',
                            uploading ? 'cursor-default opacity-70' : 'cursor-pointer',
                            dragOver
                                ? 'border-primary bg-primary/5'
                                : 'border-slate-200 hover:border-primary/50 hover:bg-slate-50'
                        )}>
                        {uploading ? (
                            <>
                                <Loader2 size={22} className="mx-auto text-primary mb-2 animate-spin" />
                                <p className="text-xs font-medium text-primary">Uploading to Supabase…</p>
                            </>
                        ) : (
                            <>
                                <ImagePlus size={22} className="mx-auto text-slate-300 mb-2" />
                                <p className="text-xs font-medium text-slate-500">Drop image or click to upload</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WebP up to 10 MB</p>
                            </>
                        )}
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                            onChange={(e) => handleFile(e.target.files[0])} disabled={uploading} />
                    </div>

                    {/* Upload error */}
                    {uploadError && (
                        <p className="mt-1.5 text-[11px] text-red-500 flex items-center gap-1">
                            ⚠ {uploadError}
                        </p>
                    )}

                    {/* URL option */}
                    <div className="mt-2">
                        {urlMode ? (
                            <div className="flex gap-1.5">
                                <input type="url" value={urlInput} onChange={e => setUrlInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && applyUrl()}
                                    placeholder="https://example.com/image.jpg"
                                    autoFocus
                                    className="flex-1 h-8 px-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary" />
                                <button onClick={applyUrl}
                                    className="h-8 px-2.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 transition">
                                    Apply
                                </button>
                                <button onClick={() => { setUrlMode(false); setUrlInput(''); }}
                                    className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-100 transition">
                                    <X size={12} />
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => setUrlMode(true)}
                                className="w-full text-[11px] text-primary hover:underline text-center py-1">
                                Or paste image URL instead
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

/* ── Main Editor ────────────────────────────────────────────────────────── */
export default function PostEditor() {
    const { id } = useParams();
    const { myPosts, publishPost, saveDraft, updatePost, blogger } = useBlog();
    const navigate = useNavigate();
    const [form, setForm] = useState(EMPTY);
    const [toast, setToast] = useState(null);
    const [textareaRef, setTextareaRef] = useState(null);

    useEffect(() => {
        if (id) {
            const existing = myPosts.find(p => p.id === id);
            if (existing) setForm({
                ...existing,
                tags: Array.isArray(existing.tags) ? existing.tags.join(', ') : existing.tags || '',
                imageUrl: existing.imageUrl || '',
            });
        } else {
            setForm(EMPTY);
        }
    }, [id]);

    const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };
    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
    const tagsArray = () => form.tags.split(',').map(t => t.trim()).filter(Boolean);

    const insertText = (before, after = '') => {
        if (!textareaRef) return;
        const start = textareaRef.selectionStart;
        const end = textareaRef.selectionEnd;
        const sel = form.content.slice(start, end);
        const newContent = form.content.slice(0, start) + before + sel + after + form.content.slice(end);
        set('content', newContent);
        setTimeout(() => {
            textareaRef.focus();
            textareaRef.setSelectionRange(start + before.length, start + before.length + sel.length);
        }, 0);
    };

    const handleSaveDraft = () => {
        const data = { ...form, tags: tagsArray(), status: 'draft' };
        if (id) { updatePost(id, data); showToast('Draft updated ✓'); }
        else { saveDraft(data); showToast('Draft saved ✓'); navigate('/blogger/posts'); }
    };

    const handlePublish = async () => {
        if (!form.title.trim() || !form.content.trim() || !form.excerpt.trim()) {
            showToast('Please fill in Title, Excerpt and Content before publishing.', 'error'); return;
        }
        const data = { ...form, tags: tagsArray(), status: 'published' };
        try {
            if (id) {
                // Edit existing — update status to published
                await updatePost(id, { ...data, status: 'published' });
                showToast('Post published! 🎉');
                // Find the slug from myPosts (state updated after updatePost)
                const existing = myPosts.find(p => p.id === id);
                const slug = existing?.slug || id;
                setTimeout(() => navigate(`/blogs/${slug}`), 800);
            } else {
                // New post
                const published = await publishPost(data);
                showToast('Post published! 🎉');
                setTimeout(() => navigate(`/blogs/${published.slug}`), 800);
            }
        } catch {
            showToast('Failed to publish. Please try again.', 'error');
        }
    };

    return (
        <div className="space-y-5 max-w-5xl">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-slate-800">{id ? 'Edit Post' : 'Write New Post'}</h1>
                <div className="flex gap-2">
                    <button onClick={handleSaveDraft}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition">
                        <Save size={14} /> Save Draft
                    </button>
                    <button onClick={handlePublish}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 shadow-md shadow-primary/20 transition">
                        <Send size={14} /> Publish
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Left — main content */}
                <div className="lg:col-span-2 space-y-4">
                    <input type="text" placeholder="Article Title…" value={form.title}
                        onChange={e => set('title', e.target.value)}
                        className="w-full text-xl sm:text-2xl font-bold px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder-slate-300 transition" />

                    <textarea placeholder="Short excerpt / summary (shown on the blog listing)…" value={form.excerpt}
                        onChange={e => set('excerpt', e.target.value)} rows={2}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none placeholder-slate-300 transition" />

                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-primary/25 focus-within:border-primary transition">
                        <div className="flex items-center gap-1 px-3 py-2 border-b border-slate-100 bg-slate-50 flex-wrap">
                            <ToolbarBtn onClick={() => insertText('<strong>', '</strong>')} title="Bold"><Bold size={13} /></ToolbarBtn>
                            <ToolbarBtn onClick={() => insertText('<em>', '</em>')} title="Italic"><Italic size={13} /></ToolbarBtn>
                            <ToolbarBtn onClick={() => insertText('\n<h2>', '</h2>\n')} title="Heading"><Heading2 size={13} /></ToolbarBtn>
                            <ToolbarBtn onClick={() => insertText('\n<ul>\n  <li>', '</li>\n</ul>\n')} title="List"><List size={13} /></ToolbarBtn>
                            <ToolbarBtn onClick={() => insertText('\n<blockquote>\n  <p>', '</p>\n</blockquote>\n')} title="Quote"><Quote size={13} /></ToolbarBtn>
                            <ToolbarBtn onClick={() => insertText('\n<p>', '</p>\n')} title="Paragraph">¶</ToolbarBtn>
                            {form.imageUrl && (
                                <ToolbarBtn onClick={() => insertText(`\n<img src="${form.imageUrl}" alt="" class="w-full rounded-xl my-4" />\n`)} title="Insert Image">
                                    <ImagePlus size={13} />
                                </ToolbarBtn>
                            )}
                            <div className="flex-1" />
                            <button type="button" onClick={() => set('content', '')} title="Clear"
                                className="h-7 px-2 rounded text-xs text-slate-400 hover:text-red-400 hover:bg-red-50 flex items-center gap-1 transition">
                                <RotateCcw size={11} /> Clear
                            </button>
                        </div>
                        <textarea
                            ref={el => setTextareaRef(el)}
                            placeholder="Write your article content here (HTML supported, or use toolbar buttons for formatting)…"
                            value={form.content}
                            onChange={e => set('content', e.target.value)}
                            rows={18}
                            className="w-full px-4 py-3 text-sm text-slate-700 font-mono leading-relaxed focus:outline-none resize-none"
                        />
                    </div>
                </div>

                {/* Right — metadata + preview */}
                <div className="space-y-4">
                    {/* Post Settings */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Post Settings</h3>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1.5">Category</label>
                            <select value={form.category} onChange={e => set('category', e.target.value)}
                                className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition">
                                {BLOG_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1.5">Tags <span className="text-slate-400">(comma separated)</span></label>
                            <input type="text" value={form.tags} onChange={e => set('tags', e.target.value)}
                                placeholder="e.g. Heart, Cardiology, Tips"
                                className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1.5">Read Time <span className="text-slate-400">(minutes)</span></label>
                            <input type="number" min={1} max={60} value={form.readTime} onChange={e => set('readTime', Number(e.target.value))}
                                className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition" />
                        </div>
                    </div>

                    {/* Cover Gradient */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Cover Gradient</h3>
                        <div className="grid grid-cols-3 gap-2">
                            {COVER_GRADIENTS.map(g => (
                                <button key={g} type="button" onClick={() => set('coverGradient', g)}
                                    className={cn(`h-10 rounded-xl bg-gradient-to-br ${g} transition-all`,
                                        form.coverGradient === g ? 'ring-2 ring-offset-2 ring-primary scale-105' : 'hover:scale-105')}>
                                    {form.coverGradient === g && <CheckCircle size={13} className="text-white mx-auto" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Image Upload */}
                    <ImageUpload imageUrl={form.imageUrl} onChange={(url) => set('imageUrl', url)} bloggerId={blogger?.id} />

                    {/* Publish */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Publish</h3>
                        <button onClick={handlePublish}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition shadow-md shadow-primary/20">
                            <Send size={14} /> Publish Now
                        </button>
                        <button onClick={handleSaveDraft}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition">
                            <Save size={14} /> Save as Draft
                        </button>
                    </div>

                    {/* Live Preview — fills the blank space */}
                    <LivePreview form={form} blogger={blogger} />
                </div>
            </div>

            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                        className={cn('fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2',
                            toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white')}>
                        <CheckCircle size={15} /> {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
