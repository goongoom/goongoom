export const CACHE_TAGS = {
  clerkUser: (userId: string) => `clerk:user:${userId}`,
  clerkUsers: 'clerk:users',
  answers: 'convex:answers',
  recentAnswers: 'convex:answers:recent',
  answerCount: 'convex:answers:count',
  questions: 'convex:questions',
  users: 'convex:users',
  userCount: 'convex:users:count',
  ogImages: 'og:images',
  ogQuestion: (questionId: string) => `og:question:${questionId}`,
} as const
