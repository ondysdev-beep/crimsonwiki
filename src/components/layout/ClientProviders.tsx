'use client';

import { SidebarProvider } from '@/lib/context/SidebarContext';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return <SidebarProvider>{children}</SidebarProvider>;
}
