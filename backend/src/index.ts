import { createApplication } from "@specific-dev/framework";
import * as appSchema from './db/schema/schema.js';
import * as authSchema from './db/schema/auth-schema.js';
import { registerExerciseRoutes } from './routes/exercises.js';
import { registerWorkoutRoutes } from './routes/workouts.js';
import { registerRewardRoutes } from './routes/rewards.js';
import { registerStatsRoutes } from './routes/stats.js';

const schema = { ...appSchema, ...authSchema };

// Create application with schema for full database type support
export const app = await createApplication(schema);

// Export App type for use in route files
export type App = typeof app;

// Enable authentication
app.withAuth();

// Register routes
registerExerciseRoutes(app);
registerWorkoutRoutes(app);
registerRewardRoutes(app);
registerStatsRoutes(app);

await app.run();
app.logger.info('Application running');
