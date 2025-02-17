'use client';

import { useState } from 'react';

interface CodeBlockProps {
  node: any;
  inline: boolean;
  className: string;
  children: any;
}

export function CodeBlock({
  node,
  inline,
  className,
  children,
  ...props
}: CodeBlockProps) {
  console.log('CodeBlock', children);
  console.log('CodeBlock', node);
  console.log('CodeBlock', inline);
  console.log('CodeBlock', className);

  const [output, setOutput] = useState<string | null>(null);
  const [pyodide, setPyodide] = useState<any>(null);
  const match = /language-(\w+)/.exec(className || '');
  const isPython = match && match[1] === 'python';
  const codeContent = String(children).replace(/\n$/, '');
  const [tab, setTab] = useState<'code' | 'run'>('code');

  if (!inline) {
    return (
      <span className="not-prose block">
        {tab === 'code' && (
          <code
            {...props}
            className={`block text-sm w-full overflow-x-auto dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl dark:text-zinc-50 text-zinc-900 whitespace-pre-wrap break-words`}
          >
            {children}
          </code>
        )}

        {tab === 'run' && output && (
          <code className="block text-sm w-full overflow-x-auto bg-zinc-800 dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-700 border-t-0 rounded-b-xl text-zinc-50">
            {output}
          </code>
        )}
      </span>
    );
  } else {
    return (
      <code {...props} className={className}>
        {children}
      </code>
    );
  }
}
