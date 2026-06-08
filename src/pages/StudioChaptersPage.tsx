import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, ArrowLeft, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase, getChapters, createChapter } from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import toast from 'react-hot-toast';

export default function StudioChaptersPage() {
  const { novelId } = useParams<{ novelId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chapters, setChapters] = useState<any[]>([]);
  const [novel, setNovel] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newChapter, setNewChapter] = useState({
    title: '',
    content: '',
    is_premium: false,
    price_ngc: 0
  });

  useEffect(() => {
    if (user && novelId) loadData();
  }, [user, novelId]);

  async function loadData() {
    try {
      setIsLoading(true);
      const { data: novelData } = await supabase
        .from('novels')
        .select('*')
        .eq('id', novelId)
        .single();
      setNovel(novelData);
      const chaptersData = await getChapters(novelId!);
      setChapters(chaptersData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddChapter(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !novelId) return;
    try {
      await createChapter({
        novel_id: novelId,
        title: newChapter.title,
        content: newChapter.content,
        chapter_number: chapters.length + 1,
        is_premium: newChapter.is_premium,
        price_ngc: newChapter.price_ngc,
        is_published: true,
        published_at: new Date().toISOString()
      });
      toast.success('Chapter created!');
      setNewChapter({ title: '', content: '', is_premium: false, price_ngc: 0 });
      setShowAddForm(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create chapter');
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Sign in required
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-14 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold">{novel?.title || 'Chapters'}</h1>
              <p className="text-sm text-gray-500">{chapters.length} chapters</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" /> Add Chapter
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <LoadingSpinner className="py-12" />
        ) : showAddForm && (
          <form onSubmit={handleAddChapter} className="bg-white rounded-xl p-6 shadow-sm mb-6 space-y-4">
            <input
              type="text"
              placeholder="Chapter title"
              value={newChapter.title}
              onChange={(e) => setNewChapter(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 border rounded-xl"
              required
            />
            <textarea
              placeholder="Chapter content..."
              value={newChapter.content}
              onChange={(e) => setNewChapter(prev => ({ ...prev, content: e.target.value }))}
              rows={8}
              className="w-full px-4 py-2 border rounded-xl resize-none"
              required
            />
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newChapter.is_premium}
                  onChange={(e) =>
                    setNewChapter(prev => ({ ...prev, is_premium: e.target.checked }))
                  }
                />
                Premium Chapter
              </label>
              {newChapter.is_premium && (
                <input
                  type="number"
                  placeholder="Price (NGC)"
                  value={newChapter.price_ngc}
                  onChange={(e) =>
                    setNewChapter(prev => ({ ...prev, price_ngc: Number(e.target.value) }))
                  }
                  className="w-24 px-3 py-1 border rounded-lg"
                  min="1"
                />
              )}
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-xl">
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 bg-gray-200 rounded-xl"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {chapters.length === 0 && !showAddForm ? (
          <EmptyState
            icon={BookOpen}
            title="No chapters"
            description="Add your first chapter"
          />
        ) : (
          <div className="space-y-2">
            {chapters.map((ch: any) => (
              <div
                key={ch.id}
                className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm"
              >
                <div>
                  <p className="font-medium">
                    Chapter {ch.chapter_number}: {ch.title}
                  </p>
                  <p className="text-sm text-gray-500">{ch.views || 0} views</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/chapter/${ch.id}`)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <Eye className="w-4 h-4 text-gray-500" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <Edit className="w-4 h-4 text-gray-500" />
                  </button>
                  <button className="p-2 hover:bg-red-50 rounded-full">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}