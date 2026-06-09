import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { supabase } from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import NovelCard from '../components/novels/NovelCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function AuthorPage() {
  const { authorId } = useParams<{ authorId: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [author, setAuthor] = useState<any>(null);
  const [novels, setNovels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { if (authorId) loadAuthor(); }, [authorId]);

  async function loadAuthor() {
    try {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', authorId).single();
      setAuthor(profile);
      const { data: novelsData } = await supabase.from('novels').select('*, chapters:chapters(count)').eq('author_id', authorId).eq('is_published', true);
      setNovels(novelsData || []);
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  }

  if (isLoading) return <LoadingSpinner className="min-h-screen" />;

  return (
    <div className={`min-h-screen transition-colors ${isDark ? 'bg-[var(--void)] text-[var(--txt)]' : 'bg-gray-50 text-gray-900'}`}>
      <div className={`bg-gradient-to-r from-[var(--v)] to-[var(--mg)] text-white`}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/80 hover:text-white mb-4"><ArrowLeft className="w-4 h-4" />Back</button>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">{author?.display_name?.[0] || author?.username?.[0] || '?'}</div>
            <div><h1 className="text-2xl font-bold">{author?.display_name || author?.username || 'Unknown'}</h1><p className="text-white/70">@{author?.username}</p><p className="mt-2">{author?.bio || 'No bio'}</p></div>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-[var(--txt)]' : 'text-gray-900'}`}><BookOpen className="w-5 h-5" />Novels ({novels.length})</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{novels.map((novel) => (<NovelCard key={novel.id} novel={novel} />))}</div>
      </div>
    </div>
  );
}