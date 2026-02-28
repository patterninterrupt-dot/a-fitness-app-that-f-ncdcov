import { describe, test, expect } from "bun:test";
import { api, authenticatedApi, signUpTestUser, expectStatus, connectWebSocket, connectAuthenticatedWebSocket, waitForMessage } from "./helpers";

describe("API Integration Tests", () => {
  let authToken: string;
  let userId: string;
  let workoutId: string;

  // ============================================================
  // Auth Setup
  // ============================================================

  test("Sign up test user", async () => {
    const { token, user } = await signUpTestUser();
    authToken = token;
    userId = user.id;
    expect(authToken).toBeDefined();
    expect(userId).toBeDefined();
  });

  // ============================================================
  // Exercises Endpoints
  // ============================================================

  describe("Exercises", () => {
    test("GET /api/exercises - Get all exercises", async () => {
      const res = await api("/api/exercises");
      await expectStatus(res, 200);
      const exercises = await res.json();
      expect(Array.isArray(exercises)).toBe(true);
      if (exercises.length > 0) {
        expect(exercises[0]).toHaveProperty("id");
        expect(exercises[0]).toHaveProperty("name");
        expect(exercises[0]).toHaveProperty("type");
        expect(exercises[0]).toHaveProperty("category");
      }
    });

    test("GET /api/exercises/{type}/{category}/{duration} - Get random exercises for valid params", async () => {
      const res = await api("/api/exercises/home/upper/30");
      await expectStatus(res, 200);
      const exercises = await res.json();
      expect(Array.isArray(exercises)).toBe(true);
      expect(exercises.length).toBeLessThanOrEqual(6);
      if (exercises.length > 0) {
        expect(exercises[0]).toHaveProperty("id");
        expect(exercises[0]).toHaveProperty("name");
      }
    });

    test("GET /api/exercises/{type}/{category}/{duration} - Invalid type", async () => {
      const res = await api("/api/exercises/invalid/upper/30");
      await expectStatus(res, 400);
      const data = await res.json();
      expect(data).toHaveProperty("error");
    });

    test("GET /api/exercises/{type}/{category}/{duration} - Invalid category", async () => {
      const res = await api("/api/exercises/home/invalid/30");
      await expectStatus(res, 400);
      const data = await res.json();
      expect(data).toHaveProperty("error");
    });

    test("GET /api/exercises/{type}/{category}/{duration} - Invalid duration", async () => {
      const res = await api("/api/exercises/home/upper/99");
      await expectStatus(res, 400);
      const data = await res.json();
      expect(data).toHaveProperty("error");
    });

    test("GET /api/exercises/{type}/{category}/{duration} - Gym/Lower/60", async () => {
      const res = await api("/api/exercises/gym/lower/60");
      await expectStatus(res, 200);
      const exercises = await res.json();
      expect(Array.isArray(exercises)).toBe(true);
    });

    test("GET /api/exercises/{type}/{category}/{duration} - Home/Conditioning/45", async () => {
      const res = await api("/api/exercises/home/conditioning/45");
      await expectStatus(res, 200);
      const exercises = await res.json();
      expect(Array.isArray(exercises)).toBe(true);
    });

    test("GET /api/exercises/{type}/{category}/{duration} - Gym/Upper/90", async () => {
      const res = await api("/api/exercises/gym/upper/90");
      await expectStatus(res, 200);
      const exercises = await res.json();
      expect(Array.isArray(exercises)).toBe(true);
    });
  });

  // ============================================================
  // Workouts Endpoints
  // ============================================================

  describe("Workouts", () => {
    test("POST /api/workouts - Create workout without auth", async () => {
      const res = await api("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "home",
          duration: 30,
          category: "upper",
          completedAt: new Date().toISOString(),
        }),
      });
      await expectStatus(res, 401);
      const data = await res.json();
      expect(data).toHaveProperty("error");
    });

    test("POST /api/workouts - Create workout with missing required field", async () => {
      const res = await authenticatedApi("/api/workouts", authToken, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "home",
          duration: 30,
          category: "upper",
          // missing completedAt
        }),
      });
      await expectStatus(res, 400);
    });

    test("POST /api/workouts - Create workout successfully", async () => {
      const res = await authenticatedApi("/api/workouts", authToken, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "home",
          duration: 30,
          category: "upper",
          completedAt: new Date().toISOString(),
        }),
      });
      await expectStatus(res, 201);
      const data = await res.json();
      expect(data).toHaveProperty("workout");
      expect(data.workout).toHaveProperty("id");
      expect(data.workout.userId).toBe(userId);
      expect(data.workout.type).toBe("home");
      expect(data.workout.duration).toBe(30);
      expect(data.workout.category).toBe("upper");
      expect(data).toHaveProperty("reward");
      expect(data.reward).toHaveProperty("id");
      expect(data.reward).toHaveProperty("message");
      workoutId = data.workout.id;
    });

    test("POST /api/workouts - Create gym workout", async () => {
      const res = await authenticatedApi("/api/workouts", authToken, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "gym",
          duration: 60,
          category: "lower",
          completedAt: new Date().toISOString(),
        }),
      });
      await expectStatus(res, 201);
      const data = await res.json();
      expect(data.workout.type).toBe("gym");
      expect(data.workout.duration).toBe(60);
      expect(data.workout.category).toBe("lower");
    });

    test("POST /api/workouts - Create conditioning workout", async () => {
      const res = await authenticatedApi("/api/workouts", authToken, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "home",
          duration: 45,
          category: "conditioning",
          completedAt: new Date().toISOString(),
        }),
      });
      await expectStatus(res, 201);
      const data = await res.json();
      expect(data.workout.category).toBe("conditioning");
    });

    test("GET /api/workouts - Get workout history without auth", async () => {
      const res = await api("/api/workouts");
      await expectStatus(res, 401);
      const data = await res.json();
      expect(data).toHaveProperty("error");
    });

    test("GET /api/workouts - Get workout history with auth", async () => {
      const res = await authenticatedApi("/api/workouts", authToken);
      await expectStatus(res, 200);
      const workouts = await res.json();
      expect(Array.isArray(workouts)).toBe(true);
      // Should have at least 3 workouts from above tests
      expect(workouts.length).toBeGreaterThanOrEqual(3);
      if (workouts.length > 0) {
        expect(workouts[0]).toHaveProperty("id");
        expect(workouts[0]).toHaveProperty("type");
        expect(workouts[0]).toHaveProperty("duration");
        expect(workouts[0]).toHaveProperty("category");
        expect(workouts[0]).toHaveProperty("completedAt");
      }
    });
  });

  // ============================================================
  // Rewards Endpoints
  // ============================================================

  describe("Rewards", () => {
    test("GET /api/rewards - Get rewards without auth", async () => {
      const res = await api("/api/rewards");
      await expectStatus(res, 401);
      const data = await res.json();
      expect(data).toHaveProperty("error");
    });

    test("GET /api/rewards - Get rewards with auth", async () => {
      const res = await authenticatedApi("/api/rewards", authToken);
      await expectStatus(res, 200);
      const rewards = await res.json();
      expect(Array.isArray(rewards)).toBe(true);
      // Should have rewards from workout creations above
      expect(rewards.length).toBeGreaterThan(0);
      if (rewards.length > 0) {
        expect(rewards[0]).toHaveProperty("id");
        expect(rewards[0]).toHaveProperty("message");
        expect(rewards[0]).toHaveProperty("earnedAt");
        expect(rewards[0]).toHaveProperty("workout");
        expect(rewards[0].workout).toHaveProperty("type");
        expect(rewards[0].workout).toHaveProperty("duration");
        expect(rewards[0].workout).toHaveProperty("category");
      }
    });
  });

  // ============================================================
  // Stats Endpoints
  // ============================================================

  describe("Stats", () => {
    test("GET /api/stats - Get stats without auth", async () => {
      const res = await api("/api/stats");
      await expectStatus(res, 401);
      const data = await res.json();
      expect(data).toHaveProperty("error");
    });

    test("GET /api/stats - Get stats with auth", async () => {
      const res = await authenticatedApi("/api/stats", authToken);
      await expectStatus(res, 200);
      const stats = await res.json();
      expect(stats).toHaveProperty("totalWorkouts");
      expect(stats).toHaveProperty("currentStreak");
      expect(stats).toHaveProperty("longestStreak");
      expect(stats).toHaveProperty("totalMinutes");
      expect(typeof stats.totalWorkouts).toBe("number");
      expect(typeof stats.currentStreak).toBe("number");
      expect(typeof stats.longestStreak).toBe("number");
      expect(typeof stats.totalMinutes).toBe("number");
      // Should have 3+ workouts from above
      expect(stats.totalWorkouts).toBeGreaterThanOrEqual(3);
      // Total minutes should be at least 30+60+45=135
      expect(stats.totalMinutes).toBeGreaterThanOrEqual(135);
    });
  });
});
