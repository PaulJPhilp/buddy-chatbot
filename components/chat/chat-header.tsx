'use client';

import { useRouter } from 'next/navigation';
import { useWindowSize } from 'usehooks-ts';
import { ModelSelector } from '@/components/app/model-selector';
import { SidebarToggle } from '@/components/app/sidebar-toggle';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@/components/ui/icons';
import { useSidebar } from '@/components/ui/sidebar';
import { memo } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { type VisibilityType, VisibilitySelector } from '@/components/app/visibility-selector';

/**
 * Configuration options for the chat header display
 */
interface ChatHeaderProps {
  chatId: string;
  selectedModelId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
}

/**
 * Header component for the chat interface with navigation and settings controls.
 * 
 * @explanation
 * This component serves as the primary navigation and control panel for the chat,
 * implementing several key features:
 * 
 * 1. Navigation Controls:
 *    - Back button for chat navigation
 *    - Sidebar toggle for workspace management
 *    - Route handling for chat transitions
 * 
 * 2. Settings Management:
 *    - Model selection display
 *    - Visibility control
 *    - Read-only state indication
 * 
 * 3. User Interface:
 *    - Responsive layout adaptation
 *    - Tooltip-enhanced controls
 *    - Accessibility considerations
 * 
 * The header maintains consistent positioning and provides quick access to
 * frequently used chat controls while adapting to different screen sizes
 * and interaction modes.
 * 
 * @param props - Properties for configuring the chat header
 * @returns A header component with navigation and control elements
 */
function PureChatHeader({
  chatId,
  selectedModelId,
  selectedVisibilityType,
  isReadonly,
}: ChatHeaderProps) {
  const router = useRouter();
  const { open } = useSidebar();

  const { width: windowWidth } = useWindowSize();

  return (
    <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2">
      <SidebarToggle />

      {(!open || windowWidth < 768) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="order-2 md:order-1 md:px-2 px-2 md:h-fit ml-auto md:ml-0"
              onClick={() => {
                router.push('/');
                router.refresh();
              }}
            >
              <PlusIcon />
              <span className="md:sr-only">New Chat</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>New Chat</TooltipContent>
        </Tooltip>
      )}

      {!isReadonly && (
        <ModelSelector
          selectedModelId={selectedModelId}
          className="order-1 md:order-2"
        />
      )}

      {!isReadonly && (
        <VisibilitySelector
          chatId={chatId}
          selectedVisibilityType={selectedVisibilityType}
          className="order-1 md:order-3"
        />
      )}
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return prevProps.selectedModelId === nextProps.selectedModelId;
});
