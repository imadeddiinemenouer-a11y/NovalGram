import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/api';
import toast from 'react-hot-toast';

export default function NewNovelPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('en');
  const [genres, setGenres] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const genreOptions = ['Fantasy', 'Romance', 'Sci-Fi', 'Mystery', 'Horror', 'Adventure', 'Comedy', 'Drama', 'Action', 'Thriller'];

  function toggleGenre(genre: string) {
    setGenres(prev => prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!user || user.role !== 'author') {
      toast.error('Only authors can create novels');
      return;
    }
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('novels')
        .insert({
          title: title.trim(),
          description: description.trim(),
          author_id: user.id,
          language,
          genre: genres,
          is_published: false,
        })
        .select()
        .single();

      if (error) throw error;
      toast.success('Novel created!');
      navigate(`/studio/chapters/${data.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create novel');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-14 z-30">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Create New Novel</h1>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleCreate} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter novel title"
              className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of your novel"
              rows={4}
              className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {['en', 'ar', 'fr', 'es', 'de', 'zh', 'ja', 'ko', 'ru', 'tr'].map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Genres</label>
            <div className="flex flex-wrap gap-2">
              {genreOptions.map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggleGenre(g)}
                  className={`px-3 py-1 rounded-full text-sm transition-all ${
                    genres.includes(g)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Create Novel'}
          </button>
        </form>
      </div>
    </div>
  );
}