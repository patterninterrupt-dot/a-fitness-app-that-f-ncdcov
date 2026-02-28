import type { App } from '../index.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema/schema.js';

const motivationalMessages = [
  'Consistency is key! 🔥',
  "You showed up! That's what matters! 💪",
  'Ready is an action, not a feeling! ⚡',
  'Another step forward! 🚀',
  "You're building the habit! 🎯",
];

interface CreateWorkoutBody {
  type: 'home' | 'gym';
  duration: 30 | 45 | 60 | 90;
  category: 'upper' | 'lower' | 'conditioning';
  completedAt: string; // ISO8601 timestamp
}

export function registerWorkoutRoutes(app: App) {
  const requireAuth = app.requireAuth();

  // POST /api/workouts - Create a new workout
  app.fastify.post('/api/workouts', {
    schema: {
      description: 'Create a completed workout and earn a reward',
      tags: ['workouts'],
      body: {
        type: 'object',
        required: ['type', 'duration', 'category', 'completedAt'],
        properties: {
          type: { type: 'string', enum: ['home', 'gym'] },
          duration: { type: 'number', enum: [30, 45, 60, 90] },
          category: { type: 'string', enum: ['upper', 'lower', 'conditioning'] },
          completedAt: { type: 'string', format: 'date-time' },
        },
      },
      response: {
        201: {
          description: 'Workout created successfully',
          type: 'object',
          properties: {
            workout: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                userId: { type: 'string' },
                type: { type: 'string' },
                duration: { type: 'number' },
                category: { type: 'string' },
                completedAt: { type: 'string', format: 'date-time' },
                createdAt: { type: 'string', format: 'date-time' },
              },
            },
            reward: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                userId: { type: 'string' },
                workoutId: { type: 'string', format: 'uuid' },
                message: { type: 'string' },
                earnedAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
        401: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  }, async (
    request: FastifyRequest<{ Body: CreateWorkoutBody }>,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const { type, duration, category, completedAt } = request.body;
    const userId = session.user.id;

    app.logger.info({ userId, type, duration, category, completedAt }, 'Creating workout');

    try {
      const workoutData = {
        userId,
        type,
        duration,
        category,
        completedAt: new Date(completedAt),
      };

      const [workout] = await app.db.insert(schema.workouts).values(workoutData).returning();
      app.logger.info({ workoutId: workout.id, userId }, 'Workout created successfully');

      // Create reward
      const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
      const [reward] = await app.db.insert(schema.rewards).values({
        userId,
        workoutId: workout.id,
        message: randomMessage,
      }).returning();

      app.logger.info({ rewardId: reward.id, workoutId: workout.id }, 'Reward created successfully');

      return reply.status(201).send({ workout, reward });
    } catch (error) {
      app.logger.error({ err: error, userId, type, duration, category }, 'Failed to create workout');
      throw error;
    }
  });

  // GET /api/workouts - Get user's workout history
  app.fastify.get('/api/workouts', {
    schema: {
      description: "Get user's workout history ordered by date",
      tags: ['workouts'],
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              type: { type: 'string' },
              duration: { type: 'number' },
              category: { type: 'string' },
              completedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
        401: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const userId = session.user.id;

    app.logger.info({ userId }, 'Fetching workout history');

    try {
      const workouts = await app.db
        .select({
          id: schema.workouts.id,
          type: schema.workouts.type,
          duration: schema.workouts.duration,
          category: schema.workouts.category,
          completedAt: schema.workouts.completedAt,
        })
        .from(schema.workouts)
        .where(eq(schema.workouts.userId, userId))
        .orderBy(schema.workouts.completedAt);

      // Sort by completedAt descending
      const sorted = workouts.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

      app.logger.info({ userId, count: sorted.length }, 'Workout history retrieved successfully');
      return sorted;
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to fetch workouts');
      throw error;
    }
  });
}
