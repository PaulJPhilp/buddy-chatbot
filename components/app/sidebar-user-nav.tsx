'use client';
import { ChevronUp } from 'lucide-react';
import Image from 'next/image';
import type { User } from 'next-auth';
import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

import type { ComponentProps } from 'react';

/**
 * Props interface for the SidebarUserNav component.
 * 
 * @explanation
 * This interface extends the base SidebarMenu component props while requiring
 * a User object for authenticated user information. It enables the component
 * to maintain all standard sidebar menu functionality while adding user-specific
 * features.
 */
interface SidebarUserNavProps extends ComponentProps<typeof SidebarMenu> {
  user: User;
}

/**
 * User navigation component for the sidebar with theme and authentication controls.
 * 
 * @explanation
 * The SidebarUserNav component provides user-specific controls and information
 * in the sidebar. It implements:
 * 1. User Profile Display:
 *    - Avatar image generated from user's email
 *    - Truncated email display
 *    - Responsive button layout
 * 
 * 2. Theme Management:
 *    - Light/dark mode toggle
 *    - Persistent theme state
 *    - Visual feedback on theme change
 * 
 * 3. Authentication Controls:
 *    - Sign out functionality
 *    - Redirect handling post-signout
 *    - Session management
 * 
 * 4. Interactive Elements:
 *    - Dropdown menu for actions
 *    - Hover and active states
 *    - Proper keyboard navigation
 * 
 * The component uses a dropdown pattern for compact presentation while
 * maintaining accessibility and providing clear visual feedback for all
 * user interactions.
 * 
 * @param {SidebarUserNavProps} props - The component props
 * @param {User} props.user - The authenticated user object
 * @param {...ComponentProps<typeof SidebarMenu>} props - Additional sidebar menu props
 * @returns {JSX.Element} The rendered user navigation component
 */
export function SidebarUserNav({ user, ...props }: SidebarUserNavProps) {
  const { setTheme, theme } = useTheme();

  return (
    <SidebarMenu {...props}>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent bg-background data-[state=open]:text-sidebar-accent-foreground h-10">
              <Image
                src={`https://avatar.vercel.sh/${user.email}`}
                alt={user.email ?? 'User Avatar'}
                width={24}
                height={24}
                className="rounded-full"
              />
              <span className="truncate">{user?.email}</span>
              <ChevronUp className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            className="w-[--radix-popper-anchor-width]"
          >
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {`Toggle ${theme === 'light' ? 'dark' : 'light'} mode`}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <button
                type="button"
                className="w-full cursor-pointer"
                onClick={() => {
                  signOut({
                    redirectTo: '/',
                  });
                }}
              >
                Sign out
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}