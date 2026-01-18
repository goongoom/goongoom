import { pgSchema, text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const goongoom = pgSchema('goongoom')

export type SocialLinks = {
  instagram?: string
  facebook?: string
  github?: string
  twitter?: string
}

export const users = goongoom.table('users', {
  clerkId: text('clerk_id').primaryKey(),
  bio: text('bio'),
  socialLinks: jsonb('social_links').$type<SocialLinks>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const questions = goongoom.table('questions', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  recipientClerkId: text('recipient_clerk_id').notNull(),
  senderClerkId: text('sender_clerk_id'),
  content: text('content').notNull(),
  isAnonymous: integer('is_anonymous').notNull().default(1),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const answers = goongoom.table('answers', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  questionId: integer('question_id').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const usersRelations = relations(users, ({ many }) => ({
  receivedQuestions: many(questions, { relationName: 'recipient' }),
  sentQuestions: many(questions, { relationName: 'sender' }),
}))

export const questionsRelations = relations(questions, ({ one, many }) => ({
  recipient: one(users, {
    fields: [questions.recipientClerkId],
    references: [users.clerkId],
    relationName: 'recipient',
  }),
  sender: one(users, {
    fields: [questions.senderClerkId],
    references: [users.clerkId],
    relationName: 'sender',
  }),
  answers: many(answers),
}))

export const answersRelations = relations(answers, ({ one }) => ({
  question: one(questions, {
    fields: [answers.questionId],
    references: [questions.id],
  }),
}))

export type User = typeof users.$inferSelect
export type Question = typeof questions.$inferSelect
export type Answer = typeof answers.$inferSelect
