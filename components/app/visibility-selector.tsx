'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';

import { useChatVisibility } from '@/hooks/use-chat-visibility';
import {
  CheckCircleFillIcon,
  ChevronDownIcon,
  GlobeIcon,
  LockIcon,
} from '../ui/icons';

export type VisibilityType = 'private' | 'public';

const visibilities: Array<{
  id: VisibilityType;
  label: string;
  description: string;
  icon: ReactNode;
}> = [
    {
      id: 'private',
      label: 'Private',
      description: 'Only you can access this chat',
      icon: <LockIcon />,
    },
    {
      id: 'public',
      label: 'Public',
      description: 'Anyone with the link can access this chat',
      icon: <GlobeIcon />,
    },
  ];

/**
 * Props interface for the VisibilitySelector component.
 * 
 * @explanation
 * Extends Button props while adding chat-specific visibility properties.
 * This enables the component to maintain standard button functionality
 * while adding chat visibility control capabilities.
 */
interface VisibilitySelectorProps extends React.ComponentProps<typeof Button> {
  chatId: string;
  selectedVisibilityType: VisibilityType;
}

/**
 * A dropdown component for controlling chat visibility settings.
 * 
 * @explanation
 * The VisibilitySelector provides an intuitive interface for managing chat
 * visibility permissions. It implements:
 * 
 * 1. Visibility States:
 *    - Private: Limited to owner access
 *    - Public: Accessible via link sharing
 *    - Visual indicators for current state
 * 
 * 2. Interactive UI:
 *    - Dropdown menu for state selection
 *    - Descriptive labels and icons
 *    - Responsive design (hidden on mobile)
 * 
 * 3. State Management:
 *    - Memoized visibility selection
 *    - Controlled dropdown state
 *    - Immediate feedback on changes
 * 
 * 4. Accessibility:
 *    - Semantic dropdown structure
 *    - Keyboard navigation support
 *    - Clear visual feedback
 * 
 * The component uses a button-triggered dropdown pattern with rich visual
 * feedback and maintains a controlled state through the useChatVisibility hook.
 * 
 * @param {VisibilitySelectorProps} props - The component props
 * @param {string} props.chatId - Unique identifier for the chat
 * @param {VisibilityType} props.selectedVisibilityType - Current visibility state
 * @param {string} [props.className] - Optional CSS class names
 * @returns {JSX.Element} The rendered visibility selector
 */
export function VisibilitySelector({
  chatId,
  className,
  selectedVisibilityType,
  ...props
}: VisibilitySelectorProps) {
  const [open, setOpen] = useState(false);

  const { visibilityType, setVisibilityType } = useChatVisibility({
    chatId,
    initialVisibility: selectedVisibilityType,
  });

  const selectedVisibility = useMemo(
    () => visibilities.find((visibility) => visibility.id === visibilityType),
    [visibilityType],
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        asChild
        className={cn(
          'w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
          className,
        )}
      >
        <Button
          variant="outline"
          className="hidden md:flex md:px-2 md:h-[34px]"
        >
          {selectedVisibility?.icon}
          {selectedVisibility?.label}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="min-w-[300px]">
        {visibilities.map((visibility) => (
          <DropdownMenuItem
            key={visibility.id}
            onSelect={() => {
              setVisibilityType(visibility.id);
              setOpen(false);
            }}
            className="gap-4 group/item flex flex-row justify-between items-center"
            data-active={visibility.id === visibilityType}
          >
            <div className="flex flex-col gap-1 items-start">
              {visibility.label}
              {visibility.description && (
                <div className="text-xs text-muted-foreground">
                  {visibility.description}
                </div>
              )}
            </div>
            <div className="text-foreground dark:text-foreground opacity-0 group-data-[active=true]/item:opacity-100">
              <CheckCircleFillIcon />
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
