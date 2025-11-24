'use client';

import { useSetPageHeader } from '@/hooks/useSetPageHeader';

export default function ClientPage() {
  useSetPageHeader(undefined, 'Coming soon');
  return null;
}
