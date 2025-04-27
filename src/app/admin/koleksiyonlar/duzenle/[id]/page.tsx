import React from 'react';
import ClientEditCollectionPage from './edit-client';

export const dynamic = 'force-dynamic';

export default function EditCollectionPage({ params }: { params: { id: string } }) {
  return <ClientEditCollectionPage id={params.id} />;
} 