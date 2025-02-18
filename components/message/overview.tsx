import { motion } from 'framer-motion';

export const Overview = () => {
  return (
    <motion.div
      key="overview"
      className="max-w-3xl mx-auto md:mt-20"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="rounded-xl p-6 flex flex-col gap-8 leading-relaxed text-center 
        max-w-xl border border-zinc-200 dark:border-zinc-700"
      >
        <h2 className="text-2xl font-bold">Welcome to BuddyChat!</h2>
        <h3 className="text-xl font-semibold">New Features</h3>

        <ul className="list-disc list-inside text-sm">
          <li>Personal Knowledge Base - Add knowledge that you can use later in 
            your prompts</li>
          <li>Document Knowledge Base - When you create or update a document, 
            it's automatically added to your knowledge base.</li>
          <li>Smarter Prompts - Your prompts are smarter. They are appended with 
            context from your knowledge base.</li>
        </ul>
      </div>
    </motion.div>
  );
};