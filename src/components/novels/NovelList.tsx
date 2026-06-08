import React from 'react';
import NovelCard from './NovelCard';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import type { Novel } from '../../types';

interface NovelListProps {
  novels: Novel[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

export default function NovelList({ 
  novels, 
  isLoading, 
  emptyTitle = 'No novels found',
  emptyDescription = 'Check back later for new stories'
}: NovelListProps) {
  if (isLoading) {
    return <LoadingSpinner className="py-12" />;
  }

  if (novels.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {novels.map((novel) => (
        <NovelCard key={novel.id} novel={novel} />
      ))}
    </div>
  );
}
