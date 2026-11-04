import type { Habit } from '@/db/schema';
import { habitQuestionPhrase } from '@/lib/habits';

export const copy = {
  title: 'Want to note this one?',
  intensity: 'How strong is it?',
  context: 'Where are you?',
  feelings: 'What is going on?',
  outcome: (habit: Habit) => {
    switch (habit.kind) {
      case 'cannabis': return 'Did you use cannabis?';
      case 'nicotine': return 'Did you use nicotine?';
      case 'alcohol': return 'Did you have a drink?';
      case 'gambling': return 'Did you gamble?';
      case 'custom': return `Did you ${habitQuestionPhrase(habit)}?`;
    }
  },
  yes: 'Yes',
  no: 'No',
  helpers: 'What helped?',
  note: 'Anything else? (optional)',
  habit: 'Which one?',
  noHabit: 'Pick what you are tracking first, in Me or on the setup screen.',
  save: 'Save',
  other: 'Other',
  otherPlaceholder: 'Your own word',
  helperOtherPlaceholder: 'What helped, in your own words',
  feelingOtherPlaceholder: 'What is going on, in your own words',
  saveForQuickTagging: 'Save for quick tagging',
  quickTagPlaceholder: 'Quick tag',
  addTag: 'Add',
  removeCustomHint: 'Tap a word you added to remove it.',
  maxCustomTags: 'That is the most here. Remove one to add another.',
  editTags: 'Edit tags',
  doneEditingTags: 'Done editing',
  editTagsHint: 'Tap a tag to edit or remove it.',
  editTagPlaceholder: 'Tag name',
  saveTag: 'Save tag',
  removeTag: 'Remove tag',
  cancel: 'Cancel',
  restoreDefaultTags: 'Restore the original tags',
} as const;
