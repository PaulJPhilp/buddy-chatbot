import { cookies } from 'next/headers';

import { AppSidebar } from '@/components/app/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

import { auth } from '../(auth)/auth';
import Script from 'next/script';
import { ErrorBoundary } from '@/components/ui/error-boundary';

export const experimental_ppr = true;

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, cookieStore] = await Promise.all([auth(), cookies()]);
  const isCollapsed = cookieStore.get('sidebar:state')?.value !== 'true';

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
        strategy="beforeInteractive"
      />
      <SidebarProvider defaultOpen={!isCollapsed}>
        <ErrorBoundary>
          <AppSidebar user={session?.user} />
        </ErrorBoundary>
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </>
  );
}
