import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/api';
import toast from 'react-hot-toast';

export default function EditNovelPage() {
  const { novelId } = useParams<{ novelId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (novelId) {
      supabase
        .from('novels')
        .select('*')
        .eq('id', novelId)
        .single()
        .then(({ data }: any) => {
          if (data) {
            setTitle(data.title);
            setDescription(data.description || '');
          }
        });
    }
  }, [novelId]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !novelId) return;
    setIsSubmitting(true);
    try {
      await supabase.from('novels').update({ title, description }).eq('id', novelId);
      toast.success('Novel updated!');
      navigate(-1);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-14 z-30">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Edit Novel</h1>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-white rounded-xl border focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 bg-white rounded-xl border focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}