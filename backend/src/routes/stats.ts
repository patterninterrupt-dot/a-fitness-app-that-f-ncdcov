import type { App } from '../index.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema/schema.js';

export function registerStatsRoutes(app: App) {
  const requireAuth = app.requireAuth();

  // GET /api/stats - Get user stats
  app.fastify.get('/api/stats', {
    schema: {
      description: 'Get user workout statistics',
      tags: ['stats'],
      response: {
        200: {
          type: 'object',
          properties: {
            totalWorkouts: { type: 'number' },
            currentStreak: { type: 'number' },
            longestStreak: { type: 'number' },
            totalMinutes: { type: 'number' },
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

    app.logger.info({ userId }, 'Fetching user stats');

    try {
      const workouts = await app.db
        .select()
        .from(schema.workouts)
        .where(eq(schema.workouts.userId, userId))
        .orderBy(schema.workouts.completedAt);

      const totalWorkouts = workouts.length;
      const totalMinutes = workouts.reduce((sum, w) => sum + w.duration, 0);

      // Calculate streaks
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Sort workouts by date descending for streak calculation
      const sortedByDate = [...workouts].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

      for (let i = 0; i < sortedByDate.length; i++) {
        const workoutDate = new Date(sortedByDate[i].completedAt);
        workoutDate.setHours(0, 0, 0, 0);

        const expectedDate = new Date(today);
        expectedDate.setDate(expectedDate.getDate() - i);

        if (workoutDate.getTime() === expectedDate.getTime()) {
          tempStreak++;
          if (i === 0) {
            currentStreak = tempStreak;
          }
        } else {
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
          }
          tempStreak = 0;
        }
      }

      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }

      const stats = {
        totalWorkouts,
        currentStreak,
        longestStreak,
        totalMinutes,
      };

      app.logger.info({ userId, ...stats }, 'Stats retrieved successfully');
      return stats;
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to fetch stats');
      throw error;
    }
  });
}
