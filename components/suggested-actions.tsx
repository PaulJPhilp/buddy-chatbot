'use client';

import { motion } from 'framer-motion';
import { Button } from './ui/button';
import type { ChatRequestOptions, CreateMessage, Message } from 'ai';
import { memo } from 'react';

interface SuggestedActionsProps {
  chatId: string;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
}

const PureSuggestedActions = memo(function SuggestedActions({
  chatId,
  append,
}: SuggestedActionsProps) {
  const suggestedActions = [
    {
      category: 'Using Tools',
      title: 'What is the weather',
      label: 'in San Francisco?',
      action: 'What is the weather in San Francisco?',
    },
    {
      category: 'Standard Prompts',
      title: 'What is the capital',
      label: 'of France?',
      action: 'What is the capital of France?',
    },
    {
      category: 'Create a Document',
      title: 'Write an article',
      label: 'about the role of men in modern marriage',
      action: 'Write an article about the role of men in modern marriage',
    },
    {
      category: 'Create a Spreadsheet',
      title: 'Write an spreadsheet',
      label: 'that displays data from google analytics',
      action: 'Write an spreadsheet that displays data from google analytics.',
    },
    {
      category: 'Create an Image',
      title: 'Create an image',
      label: 'of a cat wearing a fedora and glasses',
      action: 'Create an image of a cat wearing a fedora and glasses.',
    },
  ];

  return (
    <div className="grid sm:grid-cols-2 gap-2 w-full">
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
          className={index > 1 ? 'hidden sm:block' : 'block'}
        >
          <Button
            variant="ghost"
            onClick={async () => {
              window.history.replaceState({}, '', `/chat/${chatId}`);

              append({
                role: 'user',
                content: suggestedAction.action,
              });
            }}
            className="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 sm:flex-col w-full h-auto justify-start items-start"
          >
            <span className="font-bold">{suggestedAction.category}</span>
            <span className="font-medium">{suggestedAction.title}</span>
            <span className="text-muted-foreground">
              {suggestedAction.label}
            </span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
});

export const SuggestedActions = memo(PureSuggestedActions, () => true);
