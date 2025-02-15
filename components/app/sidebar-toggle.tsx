import type { ComponentProps } from 'react';

import { type SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { SidebarLeftIcon } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';

/**
 * Props interface for the SidebarToggle component, extending SidebarTrigger props.
 * 
 * @explanation
 * This interface extends the base SidebarTrigger component props while adding
 * specific styling capabilities through an optional className property.
 */
interface SidebarToggleProps extends ComponentProps<typeof SidebarTrigger> {
  className?: string;
}

/**
 * A button component that toggles the visibility of the application sidebar.
 * 
 * @explanation
 * The SidebarToggle component provides a user-friendly way to control sidebar visibility.
 * It implements:
 * 1. Interactive elements:
 *    - Button with icon for visual clarity
 *    - Tooltip for improved accessibility
 *    - Click handler for toggling sidebar state
 * 2. Responsive design:
 *    - Custom sizing for mobile and desktop views
 *    - Consistent padding and height adjustments
 * 3. Visual feedback:
 *    - Outline variant for visual distinction
 *    - Hover states for interactivity
 *    - Tooltip content for action description
 * 
 * The component integrates with the sidebar context through useSidebar hook,
 * providing a seamless way to control the application's layout state while
 * maintaining accessibility and responsive design principles.
 * 
 * @param {SidebarToggleProps} props - The component props, extending SidebarTrigger
 * @param {string} [props.className] - Optional CSS classes for styling
 * @returns {JSX.Element} The rendered sidebar toggle button with tooltip
 */
export function SidebarToggle({
  className,
  ...props
}: SidebarToggleProps) {
  const { toggleSidebar } = useSidebar();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={toggleSidebar}
          variant="outline"
          className="md:px-2 md:h-fit"
        >
          <SidebarLeftIcon size={16} />
        </Button>
      </TooltipTrigger>
      <TooltipContent align="start">Toggle Sidebar</TooltipContent>
    </Tooltip>
  );
}
