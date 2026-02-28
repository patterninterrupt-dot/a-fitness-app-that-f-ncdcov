import { pgTable, uuid, text, timestamp, integer } from 'drizzle-orm/pg-core';

export const exercises = pgTable('exercises', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'home' or 'gym'
  category: text('category').notNull(), // 'upper', 'lower', 'conditioning'
  description: text('description'),
  reps: text('reps'), // for gym exercises
  sets: text('sets'), // for gym exercises
  duration: text('duration'), // for home circuits
  videoUrl: text('video_url'), // optional video URL for exercise demonstration
});

export const workouts = pgTable('workouts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  type: text('type').notNull(), // 'home' or 'gym'
  duration: integer('duration').notNull(), // 30, 45, 60, 90 minutes
  category: text('category').notNull(), // 'upper', 'lower', 'conditioning'
  completedAt: timestamp('completed_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const rewards = pgTable('rewards', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  workoutId: uuid('workout_id').notNull().references(() => workouts.id, { onDelete: 'cascade' }),
  message: text('message').notNull(),
  earnedAt: timestamp('earned_at', { withTimezone: true }).defaultNow().notNull(),
});
