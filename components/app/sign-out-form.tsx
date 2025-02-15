import Form from 'next/form';

import { signOut } from '@/app/(auth)/auth';

/**
 * A form component that handles user sign-out functionality.
 * 
 * @explanation
 * The SignOutForm component provides a server-action integrated sign-out mechanism.
 * It implements:
 * 1. Server Action Integration:
 *    - Uses Next.js Form component for server action handling
 *    - Implements server-side signOut function
 *    - Handles post-signout redirection
 * 
 * 2. User Interface:
 *    - Full-width layout for consistent spacing
 *    - Left-aligned text for natural reading
 *    - Red text color for clear action indication
 *    - Minimal padding for compact presentation
 * 
 * 3. Accessibility:
 *    - Proper button type for form submission
 *    - Clear visual feedback through color
 *    - Semantic HTML structure
 * 
 * The component uses a form-based approach instead of client-side signOut
 * to ensure proper server-side session cleanup and consistent redirection
 * behavior across all environments.
 * 
 * @returns {JSX.Element} The rendered sign-out form component
 */
export const SignOutForm = () => {
  return (
    <Form
      className="w-full"
      action={async () => {
        'use server';

        await signOut({
          redirectTo: '/',
        });
      }}
    >
      <button
        type="submit"
        className="w-full text-left px-1 py-0.5 text-red-500"
      >
        Sign out
      </button>
    </Form>
  );
};
