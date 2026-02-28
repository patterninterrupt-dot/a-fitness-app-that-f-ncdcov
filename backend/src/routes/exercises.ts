import type { App } from '../index.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and } from 'drizzle-orm';
import * as schema from '../db/schema/schema.js';

const motivationalMessages = [
  'Consistency is key! 🔥',
  "You showed up! That's what matters! 💪",
  'Ready is an action, not a feeling! ⚡',
  'Another step forward! 🚀',
  "You're building the habit! 🎯",
];

const exerciseLibrary = [
  // HOME - Upper
  { name: 'Push-ups', type: 'home', category: 'upper', description: 'Standard push-ups for chest and triceps', duration: '30s' },
  { name: 'Diamond Push-ups', type: 'home', category: 'upper', description: 'Diamond hand position push-ups for triceps', duration: '30s' },
  { name: 'Pike Push-ups', type: 'home', category: 'upper', description: 'Pike position push-ups for shoulders', duration: '30s' },
  { name: 'Tricep Dips', type: 'home', category: 'upper', description: 'Dips using a chair or bench', duration: '30s' },
  { name: 'Plank to Down Dog', type: 'home', category: 'upper', description: 'Flow from plank to downward dog', duration: '30s' },
  { name: 'Arm Circles', type: 'home', category: 'upper', description: 'Circular arm movements for shoulder activation', duration: '30s' },
  // HOME - Lower
  { name: 'Squats', type: 'home', category: 'lower', description: 'Bodyweight squats for legs', duration: '30s' },
  { name: 'Lunges', type: 'home', category: 'lower', description: 'Walking or stationary lunges', duration: '30s' },
  { name: 'Jump Squats', type: 'home', category: 'lower', description: 'Explosive squat jumps', duration: '30s' },
  { name: 'Glute Bridges', type: 'home', category: 'lower', description: 'Hip bridges for glute activation', duration: '30s' },
  { name: 'Calf Raises', type: 'home', category: 'lower', description: 'Standing calf raises', duration: '30s' },
  { name: 'Wall Sit', type: 'home', category: 'lower', description: 'Hold a wall sit position', duration: '30s' },
  // HOME - Conditioning
  { name: 'Burpees', type: 'home', category: 'conditioning', description: 'Full body burpees for cardio', duration: '30s' },
  { name: 'Mountain Climbers', type: 'home', category: 'conditioning', description: 'Mountain climber movement', duration: '30s' },
  { name: 'High Knees', type: 'home', category: 'conditioning', description: 'High knee running in place', duration: '30s' },
  { name: 'Jumping Jacks', type: 'home', category: 'conditioning', description: 'Classic jumping jacks', duration: '30s' },
  { name: 'Plank Jacks', type: 'home', category: 'conditioning', description: 'Jumping jacks in plank position', duration: '30s' },
  { name: 'Shadow Boxing', type: 'home', category: 'conditioning', description: 'Shadow boxing for cardio', duration: '30s' },
  // GYM - Upper
  { name: 'Bench Press', type: 'gym', category: 'upper', description: 'Barbell bench press', reps: '8-10', sets: '3' },
  { name: 'Dumbbell Rows', type: 'gym', category: 'upper', description: 'Single arm dumbbell rows', reps: '10-12', sets: '3' },
  { name: 'Overhead Press', type: 'gym', category: 'upper', description: 'Standing overhead shoulder press', reps: '8-10', sets: '3' },
  { name: 'Lat Pulldowns', type: 'gym', category: 'upper', description: 'Lat pulldown machine', reps: '10-12', sets: '3' },
  { name: 'Bicep Curls', type: 'gym', category: 'upper', description: 'Dumbbell bicep curls', reps: '12-15', sets: '3' },
  { name: 'Tricep Extensions', type: 'gym', category: 'upper', description: 'Tricep rope extensions', reps: '12-15', sets: '3' },
  // GYM - Lower
  { name: 'Barbell Squats', type: 'gym', category: 'lower', description: 'Barbell back squats', reps: '8-10', sets: '4' },
  { name: 'Deadlifts', type: 'gym', category: 'lower', description: 'Conventional or sumo deadlifts', reps: '6-8', sets: '3' },
  { name: 'Leg Press', type: 'gym', category: 'lower', description: 'Leg press machine', reps: '10-12', sets: '3' },
  { name: 'Leg Curls', type: 'gym', category: 'lower', description: 'Lying or seated leg curls', reps: '10-12', sets: '3' },
  { name: 'Leg Extensions', type: 'gym', category: 'lower', description: 'Leg extension machine', reps: '10-12', sets: '3' },
  { name: 'Romanian Deadlifts', type: 'gym', category: 'lower', description: 'RDLs for hamstrings', reps: '8-10', sets: '3' },
  // GYM - Conditioning
  { name: 'Rowing Machine', type: 'gym', category: 'conditioning', description: 'Rowing machine cardio', duration: '20 min' },
  { name: 'Treadmill Sprints', type: 'gym', category: 'conditioning', description: 'Sprint intervals on treadmill', duration: '15 min' },
  { name: 'Battle Ropes', type: 'gym', category: 'conditioning', description: 'Battle rope waves', reps: '30s', sets: '3' },
  { name: 'Box Jumps', type: 'gym', category: 'conditioning', description: 'Explosive box jumps', reps: '10', sets: '3' },
  { name: 'Kettlebell Swings', type: 'gym', category: 'conditioning', description: 'Kettlebell swings', reps: '15', sets: '3' },
  { name: 'Assault Bike', type: 'gym', category: 'conditioning', description: 'Assault bike intervals', duration: '15 min' },
];

export function registerExerciseRoutes(app: App) {
  // GET /api/exercises - Return all exercises
  app.fastify.get('/api/exercises', {
    schema: {
      description: 'Get all exercises from the library',
      tags: ['exercises'],
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
              type: { type: 'string' },
              category: { type: 'string' },
              description: { type: 'string' },
              reps: { type: ['string', 'null'] },
              sets: { type: ['string', 'null'] },
              duration: { type: ['string', 'null'] },
              videoUrl: { type: ['string', 'null'] },
            },
          },
        },
      },
    },
  }, async () => {
    app.logger.info('Fetching all exercises');
    const exercises = await app.db.select().from(schema.exercises);
    app.logger.info({ count: exercises.length }, 'Exercises retrieved successfully');
    return exercises;
  });

  // GET /api/exercises/:type/:category/:duration - Get exercises matched to duration
  app.fastify.get('/api/exercises/:type/:category/:duration', {
    schema: {
      description: 'Get exercises for a workout matched to selected duration',
      tags: ['exercises'],
      params: {
        type: 'object',
        required: ['type', 'category', 'duration'],
        properties: {
          type: { type: 'string', enum: ['home', 'gym'] },
          category: { type: 'string', enum: ['upper', 'lower', 'conditioning'] },
          duration: { type: 'string', enum: ['30', '45', '60', '90'] },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            exercises: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  name: { type: 'string' },
                  type: { type: 'string' },
                  category: { type: 'string' },
                  description: { type: 'string' },
                  reps: { type: ['string', 'null'] },
                  sets: { type: ['string', 'null'] },
                  duration: { type: ['string', 'null'] },
                  videoUrl: { type: ['string', 'null'] },
                  estimatedMinutes: { type: 'number' },
                },
              },
            },
            totalEstimatedMinutes: { type: 'number' },
            rounds: { type: 'number' },
          },
        },
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Params: { type: string; category: string; duration: string } }>, reply: FastifyReply) => {
    const { type, category, duration } = request.params;
    const durationMinutes = parseInt(duration, 10);

    app.logger.info({ type, category, durationMinutes }, 'Fetching exercises for duration');

    try {
      const exercises = await app.db
        .select()
        .from(schema.exercises)
        .where(and(
          eq(schema.exercises.type, type),
          eq(schema.exercises.category, category)
        ));

      if (exercises.length === 0) {
        app.logger.warn({ type, category }, 'No exercises found for filters');
        return reply.status(400).send({ error: 'No exercises found for the specified filters' });
      }

      let selectedExercises: typeof exercises;
      let estimatedMinutes: number;
      let rounds = 1;

      if (type === 'home') {
        // For home/circuit workouts: each exercise is 30s, with 10s rest = 40s per exercise
        // Max 6 exercises per circuit, can do multiple rounds
        const exerciseTimeWithRest = 40; // 30s exercise + 10s rest
        const maxExercisesPerRound = 6;
        const restBetweenRounds = 60; // 1 minute rest between rounds

        // Shuffle and pick up to 6 random exercises
        const shuffled = exercises.sort(() => Math.random() - 0.5);
        selectedExercises = shuffled.slice(0, Math.min(6, shuffled.length));

        // Calculate how many rounds fit in the duration
        const totalTimePerRound = (selectedExercises.length * exerciseTimeWithRest) / 60; // convert to minutes
        const timeWithRestBetweenRounds = totalTimePerRound + (restBetweenRounds / 60);
        rounds = Math.max(1, Math.floor(durationMinutes / timeWithRestBetweenRounds));

        estimatedMinutes = Math.round(totalTimePerRound * rounds);
      } else {
        // For gym workouts: estimate 4-5 minutes per exercise
        // Select appropriate number of exercises based on duration
        let exerciseCount: number;
        if (durationMinutes === 30) {
          exerciseCount = 6;
          estimatedMinutes = 30;
        } else if (durationMinutes === 45) {
          exerciseCount = 9;
          estimatedMinutes = 45;
        } else if (durationMinutes === 60) {
          exerciseCount = 12;
          estimatedMinutes = 60;
        } else {
          // 90 minutes
          exerciseCount = 18;
          estimatedMinutes = 90;
        }

        const shuffled = exercises.sort(() => Math.random() - 0.5);
        selectedExercises = shuffled.slice(0, Math.min(exerciseCount, shuffled.length));
      }

      // Add estimated minutes per exercise
      const exercisesWithTiming = selectedExercises.map((ex) => ({
        ...ex,
        estimatedMinutes: type === 'home' ? 0.67 : Math.round(estimatedMinutes / selectedExercises.length),
      }));

      app.logger.info(
        { count: selectedExercises.length, type, category, durationMinutes, estimatedMinutes, rounds },
        'Exercises retrieved successfully'
      );

      return {
        exercises: exercisesWithTiming,
        totalEstimatedMinutes: estimatedMinutes,
        rounds,
      };
    } catch (error) {
      app.logger.error({ err: error, type, category, durationMinutes }, 'Failed to fetch exercises');
      throw error;
    }
  });

  // Seed exercises on startup if table is empty
  app.fastify.addHook('onReady', async () => {
    const existingExercises = await app.db.select().from(schema.exercises).limit(1);
    if (existingExercises.length === 0) {
      app.logger.info('Seeding exercise library');
      await app.db.insert(schema.exercises).values(exerciseLibrary);
      app.logger.info({ count: exerciseLibrary.length }, 'Exercise library seeded successfully');
    }
  });
}
