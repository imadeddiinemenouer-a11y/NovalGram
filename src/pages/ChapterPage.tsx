import React from 'react';
import { useParams } from 'react-router-dom';
import ChapterReader from '../components/novels/ChapterReader';

export default function ChapterPage() {
  const { chapterId } = useParams<{ chapterId: string }>();

  if (!chapterId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Chapter not found</p>
      </div>
    );
  }

  return <ChapterReader chapterId={chapterId} />;
}