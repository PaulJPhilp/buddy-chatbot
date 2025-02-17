'use client';

import type { User } from 'next-auth';
import { useRouter } from 'next/navigation';

import { SidebarHistory } from '@/components/app/sidebar-history';
import { SidebarUserNav } from '@/components/app/sidebar-user-nav';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@/components/ui/icons';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface AppSidebarProps {
  user: User | undefined;
}

/**
 * Renders the application sidebar with navigation and user-specific controls.
 * 
 * @explanation
 * The AppSidebar serves as the main navigation component for the application.
 * It provides:
 * 1. Application branding with the BuddyChatbot title
 * 2. User-specific controls and authentication state display
 * 3. Mobile responsiveness with a collapsible design
 * 4. Integration with the router for navigation handling
 * 
 * The component adapts its display based on the user's authentication status,
 * showing appropriate controls and options for both logged-in and anonymous users.
 * 
 * @param {AppSidebarProps} props - The component props
 * @param {User | undefined} props.user - The current user object, undefined if not logged in
 * @returns {JSX.Element} The rendered sidebar component
 */
export function AppSidebar({ user }: AppSidebarProps): JSX.Element {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar className="group-data-[side=left]:border-r-0">
      <SidebarHeader>
        <SidebarMenu>
          <div className="flex flex-row justify-between items-center">
            <Link
              href="/"
              onClick={() => {
                setOpenMobile(false);
              }}
              className="flex flex-row gap-3 items-center"
            >
              <span className="text-lg font-semibold px-2 hover:bg-muted rounded-md cursor-pointer">
                <h4>BuddyChatbot</h4>
              </span>
            </Link>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  type="button"
                  className="p-2 h-fit"
                  onClick={() => {
                    setOpenMobile(false);
                    router.push('/');
                    router.refresh();
                  }}
                >
                  <PlusIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent align="end">New Chat</TooltipContent>
            </Tooltip>
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarHistory user={user} />
      </SidebarContent>
      <SidebarFooter>{user && <SidebarUserNav user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
