import type { App } from '../index.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema/schema.js';

export function registerRewardRoutes(app: App) {
  const requireAuth = app.requireAuth();

  // GET /api/rewards - Get user's rewards
  app.fastify.get('/api/rewards', {
    schema: {
      description: "Get user's earned rewards ordered by date",
      tags: ['rewards'],
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              message: { type: 'string' },
              earnedAt: { type: 'string', format: 'date-time' },
              workout: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  duration: { type: 'number' },
                  category: { type: 'string' },
                },
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
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const userId = session.user.id;

    app.logger.info({ userId }, 'Fetching rewards');

    try {
      const rewards = await app.db
        .select({
          id: schema.rewards.id,
          message: schema.rewards.message,
          earnedAt: schema.rewards.earnedAt,
          workoutId: schema.rewards.workoutId,
        })
        .from(schema.rewards)
        .where(eq(schema.rewards.userId, userId));

      // Get workout details for each reward
      const rewardsWithWorkouts = await Promise.all(
        rewards.map(async (reward) => {
          const workout = await app.db
            .select({
              type: schema.workouts.type,
              duration: schema.workouts.duration,
              category: schema.workouts.category,
            })
            .from(schema.workouts)
            .where(eq(schema.workouts.id, reward.workoutId))
            .then((result) => result[0]);

          return {
            id: reward.id,
            message: reward.message,
            earnedAt: reward.earnedAt,
            workout,
          };
        })
      );

      // Sort by earnedAt descending
      const sorted = rewardsWithWorkouts.sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime());

      app.logger.info({ userId, count: sorted.length }, 'Rewards retrieved successfully');
      return sorted;
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to fetch rewards');
      throw error;
    }
  });
}
