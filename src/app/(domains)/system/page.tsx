'use client';

import { useSetPageHeader } from '@/hooks/useSetPageHeader';

export default function SystemPage() {
  useSetPageHeader(undefined, 'Coming soon');
  return null;
}
