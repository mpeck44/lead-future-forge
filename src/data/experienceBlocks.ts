// Experience block content mapped by lesson title/keywords
// These will be displayed in ContentLesson component

export interface ExperienceBlockData {
  content: string;
  variant: 'experience' | 'field-note';
}

// Map lesson titles (or partial matches) to experience blocks
export const experienceBlocksByLessonTitle: Record<string, ExperienceBlockData[]> = {
  // Module 1, Lesson 1: Why AI Literacy Matters
  'Why AI Literacy': [
    {
      content: `In my first 20 AI workshops, I asked leaders "What's your biggest AI concern?" 80% said "finding time to think strategically about this."

That's why this module is 23 minutes. You can knock it out in one sitting.`,
      variant: 'experience'
    }
  ],
  
  // Module 1, Lesson 2: Creating Why AI Statement (or similar titles)
  'Why AI Statement': [
    {
      content: `When I first drafted my "Why AI?" statement for Pen Argyl Area School District, I focused on efficiency and time-saving. When I shared it with teachers, they heard "You want to replace us with robots."

Version 2 led with "AI can't build relationships—only you can. But it can handle the paperwork that keeps you from students."

That landed better. Yours might need iteration too.`,
      variant: 'experience'
    }
  ],
  
  // Field note for statement-related lessons
  'Statement': [
    {
      content: `Common mistake: Leaders write "Why AI?" statements that sound like tech vendor marketing: "AI will revolutionize learning!"

Better: "AI can help us solve this specific problem we're facing."

Specificity beats hype every time.`,
      variant: 'field-note'
    }
  ],
  
  // AI Literacy general
  'AI Literacy for School Leaders': [
    {
      content: `After presenting to 50+ districts, I've learned that the leaders who succeed with AI aren't the most tech-savvy—they're the ones who start with a clear problem to solve.

Don't try to "implement AI." Try to solve a specific frustration.`,
      variant: 'experience'
    }
  ],
  
  // Foundation/Getting started lessons
  'Getting Started': [
    {
      content: `I spent two years making the mistake of treating AI as a technology problem. It's not. It's a change leadership problem.

Once I reframed it that way, everything clicked.`,
      variant: 'experience'
    }
  ]
};

// Helper function to find matching experience blocks for a lesson title
export const getExperienceBlocksForLesson = (lessonTitle: string): ExperienceBlockData[] => {
  const blocks: ExperienceBlockData[] = [];
  const titleLower = lessonTitle.toLowerCase();
  
  for (const [key, blockList] of Object.entries(experienceBlocksByLessonTitle)) {
    if (titleLower.includes(key.toLowerCase())) {
      blocks.push(...blockList);
    }
  }
  
  // Deduplicate by content
  const seen = new Set<string>();
  return blocks.filter(block => {
    if (seen.has(block.content)) return false;
    seen.add(block.content);
    return true;
  });
};
