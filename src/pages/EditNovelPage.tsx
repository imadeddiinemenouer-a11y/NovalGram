import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../utils/api';
import toast from 'react-hot-toast';

export default function EditNovelPage() {
  const { novelId } = useParams<{ novelId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { if (novelId) { supabase.from('novels').select('*').eq('id', novelId).single().then(({ data }: any) => { if (data) { setTitle(data.title); setDescription(data.description || ''); } }); } }, [novelId]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !novelId) return;
    setIsSubmitting(true);
    try { await supabase.from('novels').update({ title, description }).eq('id', novelId); toast.success('Novel updated!'); navigate(-1); } catch (err: any) { toast.error(err.message); } finally { setIsSubmitting(false); }
  }

  return (
    <div className={`min-h-screen transition-colors ${isDark ? 'bg-[var(--void)] text-[var(--txt)]' : 'bg-gray-50 text-gray-900'}`}>
      <div className={`sticky top-14 z-30 shadow-sm border-b ${isDark ? 'bg-[var(--void)]/95 backdrop-blur-2xl border-[var(--b2)]' : 'bg-white border-gray-200'}`}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-[var(--surface2)]' : 'hover:bg-gray-100'}`}><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="text-xl font-bold flex items-center gap-2"><BookOpen className={`w-5 h-5 ${isDark ? 'text-[var(--vb)]' : 'text-indigo-600'}`} />Edit Novel</h1>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSave} className="space-y-6">
          <div><label className={`block text-sm font-medium mb-2 ${isDark ? 'text-[var(--txt2)]' : 'text-gray-700'}`}>Title *</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Novel title" className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all ${isDark ? 'bg-[var(--surface2)] border-[var(--b2)] text-[var(--txt)] placeholder-[var(--txt3)] focus:ring-[var(--v)] focus:border-[var(--v)]' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500'}`} required /></div>
          <div><label className={`block text-sm font-medium mb-2 ${isDark ? 'text-[var(--txt2)]' : 'text-gray-700'}`}>Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's your story about?" rows={5} className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 resize-none transition-all ${isDark ? 'bg-[var(--surface2)] border-[var(--b2)] text-[var(--txt)] placeholder-[var(--txt3)] focus:ring-[var(--v)] focus:border-[var(--v)]' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500'}`} /></div>
          <button type="submit" disabled={isSubmitting || !title.trim()} className={`w-full py-3.5 rounded-xl font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${isDark ? 'bg-gradient-to-r from-[var(--v)] to-[var(--mg)] text-white' : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'}`}>{isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Save Changes'}</button>
        </form>
      </div>
    </div>
  );
}