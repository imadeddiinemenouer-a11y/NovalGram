import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, ArrowLeft, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase, getChapters, createChapter } from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import toast from 'react-hot-toast';

export default function StudioChaptersPage() {
  const { novelId } = useParams<{ novelId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [chapters, setChapters] = useState<any[]>([]);
  const [novel, setNovel] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newChapter, setNewChapter] = useState({ title: '', content: '', is_premium: false, price_ngc: 0 });

  useEffect(() => { if (user && novelId) loadData(); }, [user, novelId]);

  async function loadData() {
    try { setIsLoading(true); const { data: novelData } = await supabase.from('novels').select('*').eq('id', novelId).single(); setNovel(novelData); const chaptersData = await getChapters(novelId!); setChapters(chaptersData || []); } catch (err) { console.error(err); } finally { setIsLoading(false); }
  }

  async function handleAddChapter(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !novelId) return;
    try { await createChapter({ novel_id: novelId, title: newChapter.title, content: newChapter.content, chapter_number: chapters.length + 1, is_premium: newChapter.is_premium, price_ngc: newChapter.price_ngc, is_published: true, published_at: new Date().toISOString() }); toast.success('Chapter created!'); setNewChapter({ title: '', content: '', is_premium: false, price_ngc: 0 }); setShowAddForm(false); loadData(); } catch (err: any) { toast.error(err.message || 'Failed to create chapter'); }
  }

  if (!user) return <div className="min-h-screen flex items-center justify-center text-[var(--txt3)]">Sign in required</div>;

  return (
    <div className={`min-h-screen transition-colors ${isDark ? 'bg-[var(--void)] text-[var(--txt)]' : 'bg-gray-50 text-gray-900'}`}>
      <div className={`sticky top-14 z-30 shadow-sm border-b ${isDark ? 'bg-[var(--void)]/95 backdrop-blur-2xl border-[var(--b2)]' : 'bg-white border-gray-200'}`}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-[var(--surface2)]' : 'hover:bg-gray-100'}`}><ArrowLeft className="w-5 h-5" /></button>
            <div><h1 className="text-xl font-bold">{novel?.title || 'Chapters'}</h1><p className={`text-sm ${isDark ? 'text-[var(--txt3)]' : 'text-gray-500'}`}>{chapters.length} chapters</p></div>
          </div>
          <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2 px-4 py-2 bg-[var(--v)] text-white rounded-full text-sm font-semibold hover:opacity-90"><Plus className="w-4 h-4" />Add Chapter</button>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? <LoadingSpinner className="py-12" /> : showAddForm && (
          <form onSubmit={handleAddChapter} className={`rounded-2xl p-6 shadow-sm mb-6 space-y-4 ${isDark ? 'bg-[var(--surface)]' : 'bg-white'}`}>
            <input type="text" placeholder="Chapter title" value={newChapter.title} onChange={(e) => setNewChapter(prev => ({ ...prev, title: e.target.value }))} className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-[var(--surface2)] border-[var(--b2)] text-[var(--txt)]' : 'bg-gray-100 border-gray-200'} focus:outline-none focus:ring-2 focus:ring-[var(--v)]`} required />
            <textarea placeholder="Chapter content..." value={newChapter.content} onChange={(e) => setNewChapter(prev => ({ ...prev, content: e.target.value }))} rows={8} className={`w-full px-4 py-3 rounded-xl border resize-none ${isDark ? 'bg-[var(--surface2)] border-[var(--b2)] text-[var(--txt)]' : 'bg-gray-100 border-gray-200'} focus:outline-none focus:ring-2 focus:ring-[var(--v)]`} required />
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={newChapter.is_premium} onChange={(e) => setNewChapter(prev => ({ ...prev, is_premium: e.target.checked }))} />Premium Chapter</label>
              {newChapter.is_premium && <input type="number" placeholder="Price (NGC)" value={newChapter.price_ngc} onChange={(e) => setNewChapter(prev => ({ ...prev, price_ngc: Number(e.target.value) }))} className="w-24 px-3 py-2 rounded-lg border bg-[var(--surface2)] border-[var(--b2)] text-[var(--txt)]" min="1" />}
            </div>
            <div className="flex gap-2"><button type="submit" className="px-6 py-2 bg-[var(--v)] text-white rounded-full font-semibold">Create</button><button type="button" onClick={() => setShowAddForm(false)} className={`px-6 py-2 rounded-full font-semibold ${isDark ? 'bg-[var(--surface2)] hover:bg-[var(--surface3)]' : 'bg-gray-200 hover:bg-gray-300'}`}>Cancel</button></div>
          </form>
        )}
        {chapters.length === 0 && !showAddForm ? <EmptyState icon={BookOpen} title="No chapters" description="Add your first chapter" /> : (
          <div className="space-y-2">
            {chapters.map((ch: any) => (
              <div key={ch.id} className={`rounded-xl p-4 flex items-center justify-between shadow-sm ${isDark ? 'bg-[var(--surface)]' : 'bg-white'}`}>
                <div><p className="font-medium">Chapter {ch.chapter_number}: {ch.title}</p><p className={`text-sm ${isDark ? 'text-[var(--txt3)]' : 'text-gray-500'}`}>{ch.views || 0} views</p></div>
                <div className="flex gap-2">
                  <button onClick={() => navigate(`/chapter/${ch.id}`)} className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-[var(--surface2)] text-[var(--txt2)]' : 'hover:bg-gray-100 text-gray-500'}`}><Eye className="w-4 h-4" /></button>
                  <button className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-[var(--surface2)] text-[var(--txt2)]' : 'hover:bg-gray-100 text-gray-500'}`}><Edit className="w-4 h-4" /></button>
                  <button className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-red-900/20 text-red-400' : 'hover:bg-red-50 text-red-500'}`}><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}