import React from 'react';
import { useParams } from 'react-router-dom';
import ChapterReader from '../components/novels/ChapterReader';

export default function ChapterPage() {
  const { chapterId } = useParams<{ chapterId: string }>();

  return <ChapterReader />;
}
