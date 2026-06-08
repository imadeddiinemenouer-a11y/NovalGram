import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, BookOpen, Globe, Tag, Image } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase, uploadCover } from '../utils/api';
import toast from 'react-hot-toast';

export default function NewNovelPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('en');
  const [genres, setGenres] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const genreOptions = ['Fantasy', 'Romance', 'Sci-Fi', 'Mystery', 'Horror', 'Adventure', 'Comedy', 'Drama', 'Action', 'Thriller'];

  function toggleGenre(genre: string) {
    setGenres(prev => prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]);
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
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
      
      const novelId = data.id;
      
      // رفع الغلاف إذا وُجد
      if (coverFile) {
        try {
          const coverUrl = await uploadCover(novelId, coverFile);
          if (coverUrl) {
            await supabase.from('novels').update({ cover_image: coverUrl }).eq('id', novelId);
          }
        } catch (err) {
          console.error('Cover upload failed:', err);
        }
      }
      
      toast.success('Novel created!');
      navigate(`/studio/chapters/${novelId}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create novel');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={`min-h-screen transition-colors ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className={`sticky top-14 z-30 shadow-sm border-b ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <BookOpen className={`w-5 h-5 ${isDark ? 'text-red-400' : 'text-indigo-600'}`} />
              Create New Novel
            </h1>
          </div>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleCreate} className="space-y-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a captivating title..."
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                isDark 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-red-500 focus:border-red-500' 
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
              required
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's your story about?"
              rows={5}
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 resize-none transition-all ${
                isDark 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-red-500 focus:border-red-500' 
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <Image className="w-4 h-4" /> Cover Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                isDark 
                  ? 'bg-gray-800 border-gray-700 text-white focus:ring-red-500' 
                  : 'bg-white border-gray-200 text-gray-900 focus:ring-indigo-500'
              }`}
            />
            {coverPreview && (
              <img src={coverPreview} alt="Cover preview" className="mt-3 w-full h-48 object-cover rounded-xl shadow-md" />
            )}
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <Globe className="w-4 h-4" /> Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                isDark 
                  ? 'bg-gray-800 border-gray-700 text-white focus:ring-red-500 focus:border-red-500' 
                  : 'bg-white border-gray-200 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
            >
              {['en', 'ar', 'fr', 'es', 'de', 'zh', 'ja', 'ko', 'ru', 'tr'].map(lang => (
                <option key={lang} value={lang}>{lang.toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <Tag className="w-4 h-4" /> Genres
            </label>
            <div className="flex flex-wrap gap-2">
              {genreOptions.map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggleGenre(g)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    genres.includes(g)
                      ? 'bg-indigo-600 dark:bg-red-600 text-white shadow-md'
                      : isDark 
                        ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' 
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
            disabled={isSubmitting || !title.trim()}
            className={`w-full py-3.5 rounded-xl font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
              isDark 
                ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-500 hover:to-pink-500' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500'
            }`}
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              'Create Novel'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}