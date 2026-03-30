import type { App } from '../index.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and, gt, isNull } from 'drizzle-orm';
import * as schema from '../db/schema/schema.js';

const motivationalMessages = [
  'Consistency is key! 🔥',
  "You showed up! That's what matters! 💪",
  'Ready is an action, not a feeling! ⚡',
  'Another step forward! 🚀',
  "You're building the habit! 🎯",
];

/**
 * Fisher-Yates shuffle algorithm for proper randomization
 * Ensures truly random selection from an array
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const exerciseLibrary = [
  // HOME - UPPER (25 exercises)
  { name: 'Push-ups', type: 'home', category: 'upper', description: 'Standard push-ups for chest and triceps', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4' },
  { name: 'Diamond Push-ups', type: 'home', category: 'upper', description: 'Diamond hand position push-ups for triceps', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=1I-vl3JA1HA' },
  { name: 'Wide Push-ups', type: 'home', category: 'upper', description: 'Wide grip push-ups for chest activation', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=ScFv7d8JZpU' },
  { name: 'Decline Push-ups', type: 'home', category: 'upper', description: 'Feet elevated push-ups for upper chest', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=cVqPwQnP4kc' },
  { name: 'Pike Push-ups', type: 'home', category: 'upper', description: 'Pike position push-ups for shoulders', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=0WFasj-wX1I' },
  { name: 'Archer Push-ups', type: 'home', category: 'upper', description: 'Single arm emphasis push-ups', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=VpOFqRVXbXY' },
  { name: 'Tricep Dips', type: 'home', category: 'upper', description: 'Dips using a chair or bench', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=0326dy_-DyM' },
  { name: 'Bench Dips', type: 'home', category: 'upper', description: 'Tricep dips on a low bench', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=0326dy_-DyM' },
  { name: 'Chair Dips', type: 'home', category: 'upper', description: 'Dips using a sturdy chair', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=0326dy_-DyM' },
  { name: 'Plank Hold', type: 'home', category: 'upper', description: 'Static plank hold for core strength', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=pSHjTRCQxIw' },
  { name: 'Plank to Down Dog', type: 'home', category: 'upper', description: 'Flow from plank to downward dog', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=FZCqAoQVZxc' },
  { name: 'Arm Circles', type: 'home', category: 'upper', description: 'Circular arm movements for shoulder activation', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=lMuSNJcDa74' },
  { name: 'Shoulder Taps', type: 'home', category: 'upper', description: 'Alternating shoulder taps in plank position', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=d0aJJfO7Jvc' },
  { name: 'Inchworms', type: 'home', category: 'upper', description: 'Walk hands to plank and back', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=aMWpXPRPcyY' },
  { name: 'Handstand Hold', type: 'home', category: 'upper', description: 'Wall assisted handstand hold', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=hMuD_kYcJu4' },
  { name: 'Wall Walks', type: 'home', category: 'upper', description: 'Walk feet up wall from plank position', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=23yQVx4RCE0' },
  { name: 'Bear Crawls', type: 'home', category: 'upper', description: 'Move in bear crawl position', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=cI0hc8dGi9s' },
  { name: 'Superman Holds', type: 'home', category: 'upper', description: 'Superman position hold for back', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=ayPxJUFsj_0' },
  { name: 'Reverse Snow Angels', type: 'home', category: 'upper', description: 'Snow angels on belly', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=YMR-GkZO-Jc' },
  { name: 'Pseudo Planche Leans', type: 'home', category: 'upper', description: 'Lean forward in plank position', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=tUaLCzfJjAE' },
  { name: 'Push-up to T Rotation', type: 'home', category: 'upper', description: 'Push-up with side rotation', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=1l8V7R6e5Ew' },
  { name: 'Elbows-In Push-ups', type: 'home', category: 'upper', description: 'Close grip push-ups for triceps', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=ZzFFtKaGw5c' },
  { name: 'Knuckle Push-ups', type: 'home', category: 'upper', description: 'Push-ups on knuckles for wrist strength', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=3HcV3tqLZuo' },
  { name: 'Hindu Push-ups', type: 'home', category: 'upper', description: 'Yoga style push-ups', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=Qm8EwlM-F2E' },
  { name: 'Clapping Push-ups', type: 'home', category: 'upper', description: 'Explosive clapping push-ups', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=RbJjSJpj8EI' },

  // HOME - LOWER (25 exercises)
  { name: 'Squats', type: 'home', category: 'lower', description: 'Bodyweight squats for legs', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=aclHkVaku9U' },
  { name: 'Jump Squats', type: 'home', category: 'lower', description: 'Explosive squat jumps', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=kmJ79g0hDLw' },
  { name: 'Pistol Squats', type: 'home', category: 'lower', description: 'Single leg squat hold', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=6IXLQ7JVYX8' },
  { name: 'Sumo Squats', type: 'home', category: 'lower', description: 'Wide stance squats', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=qEBW2ZK6_dQ' },
  { name: 'Bulgarian Split Squats', type: 'home', category: 'lower', description: 'Rear leg elevated squats', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=gPFlnCS-BXI' },
  { name: 'Lunges', type: 'home', category: 'lower', description: 'Walking or stationary lunges', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=QOVaHwm-Q6U' },
  { name: 'Reverse Lunges', type: 'home', category: 'lower', description: 'Lunges stepping backward', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=QOVaHwm-Q6U' },
  { name: 'Walking Lunges', type: 'home', category: 'lower', description: 'Forward walking lunges', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=QOVaHwm-Q6U' },
  { name: 'Jumping Lunges', type: 'home', category: 'lower', description: 'Explosive alternating lunges', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=Fz7fh1nBfL0' },
  { name: 'Curtsy Lunges', type: 'home', category: 'lower', description: 'Behind body diagonal lunges', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=fIxj8s0pLh8' },
  { name: 'Glute Bridges', type: 'home', category: 'lower', description: 'Hip bridges for glute activation', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=wPM8icPYGQo' },
  { name: 'Single Leg Glute Bridges', type: 'home', category: 'lower', description: 'Single leg hip bridge', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=d0Soa8O2lFI' },
  { name: 'Hip Thrusts', type: 'home', category: 'lower', description: 'Elevated hip thrusts', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=wPM8icPYGQo' },
  { name: 'Calf Raises', type: 'home', category: 'lower', description: 'Standing calf raises', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=O-aI33EFwn0' },
  { name: 'Single Leg Calf Raises', type: 'home', category: 'lower', description: 'One leg standing calf raises', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=O-aI33EFwn0' },
  { name: 'Wall Sits', type: 'home', category: 'lower', description: 'Hold a wall sit position', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=y-wV4qXIbJ8' },
  { name: 'Single Leg Wall Sits', type: 'home', category: 'lower', description: 'One leg wall sit', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=y-wV4qXIbJ8' },
  { name: 'Step-ups', type: 'home', category: 'lower', description: 'Step up onto a chair or step', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=pqDVcG9Bj8Y' },
  { name: 'Box Jumps', type: 'home', category: 'lower', description: 'Box jumps using stairs or chair', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=IWJ3PfN1-wE' },
  { name: 'Donkey Kicks', type: 'home', category: 'lower', description: 'Kick legs back from all fours', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=d_Yrwk8FitzF8' },
  { name: 'Fire Hydrants', type: 'home', category: 'lower', description: 'Side leg lifts from all fours', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=8kxV_DM4QHo' },
  { name: 'Leg Raises', type: 'home', category: 'lower', description: 'Lying leg raises for lower abs', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=JB2oyqG5f2o' },
  { name: 'Single Leg Squats Lean', type: 'home', category: 'lower', description: 'Single leg squat lean against wall', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=6IXLQ7JVYX8' },
  { name: 'Glute Kickbacks', type: 'home', category: 'lower', description: 'Standing leg kickbacks', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=d_Yrwk8FitzF8' },

  // HOME - CONDITIONING (25 exercises)
  { name: 'Burpees', type: 'home', category: 'conditioning', description: 'Full body burpees for cardio', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=JZQA08SlJnM' },
  { name: 'Burpee with Push-up', type: 'home', category: 'conditioning', description: 'Burpees including push-up', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=JZQA08SlJnM' },
  { name: 'Mountain Climbers', type: 'home', category: 'conditioning', description: 'Mountain climber movement', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=5oi-cbJmL0w' },
  { name: 'High Knees', type: 'home', category: 'conditioning', description: 'High knee running in place', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=SZBkYRwLhZw' },
  { name: 'Jumping Jacks', type: 'home', category: 'conditioning', description: 'Classic jumping jacks', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=9Wf6KqGlMPw' },
  { name: 'Plank Jacks', type: 'home', category: 'conditioning', description: 'Jumping jacks in plank position', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=d0aJJfO7Jvc' },
  { name: 'Star Jumps', type: 'home', category: 'conditioning', description: 'Explosive star jump', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=sP7sAuwBMVo' },
  { name: 'Tuck Jumps', type: 'home', category: 'conditioning', description: 'Jump with knees to chest', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=jLVvN3hKRvk' },
  { name: 'Shadow Boxing', type: 'home', category: 'conditioning', description: 'Shadow boxing for cardio', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=lJF5_0RkL5Y' },
  { name: 'Speed Skaters', type: 'home', category: 'conditioning', description: 'Side to side skating motion', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=LWa5l33mYbg' },
  { name: 'Lateral Shuffles', type: 'home', category: 'conditioning', description: 'Shuffle side to side', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=aYH3PQsn9Jc' },
  { name: 'Jump Rope', type: 'home', category: 'conditioning', description: 'Jump rope exercise', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=eudVTnCHdlI' },
  { name: 'Running in Place', type: 'home', category: 'conditioning', description: 'High intensity running in place', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=SZBkYRwLhZw' },
  { name: 'Sprawls', type: 'home', category: 'conditioning', description: 'Jump back to plank burpee variation', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=Ddb2FV7g4Rw' },
  { name: 'Squat Thrusts', type: 'home', category: 'conditioning', description: 'Squat to plank jump back', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=Ddb2FV7g4Rw' },
  { name: 'Bear Crawls', type: 'home', category: 'conditioning', description: 'Move in bear crawl position', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=cI0hc8dGi9s' },
  { name: 'Crab Walk', type: 'home', category: 'conditioning', description: 'Backward crab walk position', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=6MVTlWLI5c4' },
  { name: 'Jumping Lunges', type: 'home', category: 'conditioning', description: 'Explosive alternating lunges', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=Fz7fh1nBfL0' },
  { name: 'Broad Jumps', type: 'home', category: 'conditioning', description: 'Long distance horizontal jumps', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=zDpVWwS6dLI' },
  { name: 'Lateral Bounds', type: 'home', category: 'conditioning', description: 'Side to side bounding', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=LWa5l33mYbg' },
  { name: 'Suicide Runs', type: 'home', category: 'conditioning', description: 'Back and forth sprint runs', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=7xzqnR-U7Rk' },
  { name: 'Agility Ladder', type: 'home', category: 'conditioning', description: 'Agility ladder foot work', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=j3uazCjC8oQ' },
  { name: 'Box Shuffle', type: 'home', category: 'conditioning', description: 'Shuffle around box pattern', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=aYH3PQsn9Jc' },
  { name: 'Plyometric Push-ups', type: 'home', category: 'conditioning', description: 'Explosive push-ups', duration: '30s', videoUrl: 'https://www.youtube.com/watch?v=RbJjSJpj8EI' },

  // GYM - UPPER (25 exercises)
  { name: 'Bench Press', type: 'gym', category: 'upper', description: 'Barbell bench press', reps: '8-10', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=rT7DgCr-3pg' },
  { name: 'Incline Bench Press', type: 'gym', category: 'upper', description: 'Incline barbell press', reps: '8-10', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=DbLWScEPv7I' },
  { name: 'Decline Bench Press', type: 'gym', category: 'upper', description: 'Decline barbell press', reps: '8-10', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=DbLWScEPv7I' },
  { name: 'Dumbbell Bench Press', type: 'gym', category: 'upper', description: 'Dumbbell bench press', reps: '8-12', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=F0BwpE7l-pE' },
  { name: 'Dumbbell Rows', type: 'gym', category: 'upper', description: 'Single arm dumbbell rows', reps: '10-12', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=I4Z-5nWJIbM' },
  { name: 'Barbell Rows', type: 'gym', category: 'upper', description: 'Barbell bent over rows', reps: '8-10', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=vEFEZDGH9bc' },
  { name: 'Cable Rows', type: 'gym', category: 'upper', description: 'Cable rowing machine', reps: '10-12', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=5P0-pAJ-p5s' },
  { name: 'T-Bar Rows', type: 'gym', category: 'upper', description: 'T-bar machine rows', reps: '8-10', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=5P0-pAJ-p5s' },
  { name: 'Overhead Press', type: 'gym', category: 'upper', description: 'Standing overhead shoulder press', reps: '8-10', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=_RwqrXD-Wmc' },
  { name: 'Arnold Press', type: 'gym', category: 'upper', description: 'Rotating dumbbell shoulder press', reps: '10-12', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=6Z15_WdXmj8' },
  { name: 'Lateral Raises', type: 'gym', category: 'upper', description: 'Dumbbell lateral shoulder raises', reps: '12-15', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=3VcKaXpapvE' },
  { name: 'Front Raises', type: 'gym', category: 'upper', description: 'Dumbbell front shoulder raises', reps: '12-15', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=W3FBigQ3vNo' },
  { name: 'Lat Pulldowns', type: 'gym', category: 'upper', description: 'Lat pulldown machine', reps: '10-12', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=Qw-R5CGAFsA' },
  { name: 'Pull-ups', type: 'gym', category: 'upper', description: 'Bodyweight pull-ups', reps: '6-12', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=OIzAxsScXNA' },
  { name: 'Chin-ups', type: 'gym', category: 'upper', description: 'Underhand grip pull-ups', reps: '6-12', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=OIzAxsScXNA' },
  { name: 'Face Pulls', type: 'gym', category: 'upper', description: 'Cable face pull exercise', reps: '15-20', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=rep-qVOkYSc' },
  { name: 'Bicep Curls', type: 'gym', category: 'upper', description: 'Dumbbell bicep curls', reps: '12-15', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=ykJmrsCvzSA' },
  { name: 'Hammer Curls', type: 'gym', category: 'upper', description: 'Neutral grip dumbbell curls', reps: '12-15', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=zC3nLlEvin4' },
  { name: 'Preacher Curls', type: 'gym', category: 'upper', description: 'Preacher bench dumbbell curls', reps: '12-15', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=psM3bVuVRu4' },
  { name: 'Cable Curls', type: 'gym', category: 'upper', description: 'Cable bicep curls', reps: '12-15', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=0uJ-G9O0yX0' },
  { name: 'Tricep Extensions', type: 'gym', category: 'upper', description: 'Tricep rope extensions', reps: '12-15', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=KrnyT8z5-QE' },
  { name: 'Skull Crushers', type: 'gym', category: 'upper', description: 'Lying tricep extensions', reps: '10-12', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=PG4ZmgQSVSQ' },
  { name: 'Dips', type: 'gym', category: 'upper', description: 'Parallel bar dips', reps: '8-12', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=tzrYlHIiPRk' },
  { name: 'Close Grip Bench Press', type: 'gym', category: 'upper', description: 'Tricep focused bench press', reps: '8-10', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=6_nW6K0V5uY' },
  { name: 'Machine Chest Fly', type: 'gym', category: 'upper', description: 'Chest fly machine', reps: '12-15', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=wRwkhMqIIXU' },

  // GYM - LOWER (25 exercises)
  { name: 'Barbell Squats', type: 'gym', category: 'lower', description: 'Barbell back squats', reps: '8-10', sets: '4', videoUrl: 'https://www.youtube.com/watch?v=ultWZbUMPL8' },
  { name: 'Front Squats', type: 'gym', category: 'lower', description: 'Barbell front squats', reps: '8-10', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=qf3bCRjSHkU' },
  { name: 'Goblet Squats', type: 'gym', category: 'lower', description: 'Kettlebell goblet squats', reps: '12-15', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=eoOUqRu0V-w' },
  { name: 'Hack Squats', type: 'gym', category: 'lower', description: 'Hack squat machine', reps: '10-12', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=F1d7HqmMSUU' },
  { name: 'Deadlifts', type: 'gym', category: 'lower', description: 'Conventional deadlifts', reps: '6-8', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=op9kVnSso6Q' },
  { name: 'Romanian Deadlifts', type: 'gym', category: 'lower', description: 'RDLs for hamstrings', reps: '8-10', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=vSCJNsKP9P4' },
  { name: 'Sumo Deadlifts', type: 'gym', category: 'lower', description: 'Wide stance deadlifts', reps: '6-8', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=6LDK-p5GW5o' },
  { name: 'Trap Bar Deadlifts', type: 'gym', category: 'lower', description: 'Trap bar deadlifts', reps: '6-8', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=op9kVnSso6Q' },
  { name: 'Leg Press', type: 'gym', category: 'lower', description: 'Leg press machine', reps: '10-12', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=IZxyjW7EZLU' },
  { name: 'Leg Curls', type: 'gym', category: 'lower', description: 'Lying leg curl machine', reps: '10-12', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=1Lm7R5KWLJY' },
  { name: 'Seated Leg Curls', type: 'gym', category: 'lower', description: 'Seated leg curl machine', reps: '10-12', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=1Lm7R5KWLJY' },
  { name: 'Leg Extensions', type: 'gym', category: 'lower', description: 'Leg extension machine', reps: '10-12', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=YEC3KwjKA0s' },
  { name: 'Bulgarian Split Squats', type: 'gym', category: 'lower', description: 'Rear leg elevated squats with dumbbells', reps: '10-12', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=gPFlnCS-BXI' },
  { name: 'Walking Lunges with Dumbbells', type: 'gym', category: 'lower', description: 'Walking lunges holding dumbbells', reps: '10-12', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=F1wVx-yqCaI' },
  { name: 'Hip Thrusts', type: 'gym', category: 'lower', description: 'Barbell hip thrusts', reps: '10-12', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=wPM8icPYGQo' },
  { name: 'Cable Pull-throughs', type: 'gym', category: 'lower', description: 'Cable pull-through for glutes', reps: '12-15', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=PG4ZmgQSVSQ' },
  { name: 'Good Mornings', type: 'gym', category: 'lower', description: 'Good morning exercise for posterior chain', reps: '10-12', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=REr86rOFI2w' },
  { name: 'Machine Leg Press', type: 'gym', category: 'lower', description: 'V-squat or sled leg press', reps: '10-12', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=IZxyjW7EZLU' },
  { name: 'Calf Raises on Machine', type: 'gym', category: 'lower', description: 'Machine calf raises', reps: '15-20', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=zKDRMh0p3G0' },
  { name: 'Seated Calf Raises', type: 'gym', category: 'lower', description: 'Seated calf raise machine', reps: '15-20', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=zKDRMh0p3G0' },
  { name: 'Pendulum Squats', type: 'gym', category: 'lower', description: 'Pendulum squat machine', reps: '10-12', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=F1d7HqmMSUU' },
  { name: 'Smith Machine Squats', type: 'gym', category: 'lower', description: 'Smith machine squats', reps: '8-12', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=ultWZbUMPL8' },
  { name: 'Sissy Squats', type: 'gym', category: 'lower', description: 'Quad focused sissy squats', reps: '12-15', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=oqR3RhNfNFk' },
  { name: 'Single Leg Presses', type: 'gym', category: 'lower', description: 'One leg leg press', reps: '10-12', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=IZxyjW7EZLU' },

  // GYM - CONDITIONING (25 exercises)
  { name: 'Rowing Machine', type: 'gym', category: 'conditioning', description: 'Rowing machine cardio', duration: '20 min', videoUrl: 'https://www.youtube.com/watch?v=GKzfKZGfvXY' },
  { name: 'Treadmill Sprints', type: 'gym', category: 'conditioning', description: 'Sprint intervals on treadmill', duration: '15 min', videoUrl: 'https://www.youtube.com/watch?v=ZkqwVqvuYNY' },
  { name: 'Assault Bike', type: 'gym', category: 'conditioning', description: 'Assault bike intervals', duration: '15 min', videoUrl: 'https://www.youtube.com/watch?v=4RbVXFIW7-c' },
  { name: 'Stair Climber', type: 'gym', category: 'conditioning', description: 'Stair climbing machine', duration: '15 min', videoUrl: 'https://www.youtube.com/watch?v=IbFKPBFvwqY' },
  { name: 'Battle Ropes', type: 'gym', category: 'conditioning', description: 'Battle rope waves', reps: '30s', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=P5YqPjpdVSQ' },
  { name: 'Box Jumps', type: 'gym', category: 'conditioning', description: 'Explosive box jumps', reps: '10', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=IWJ3PfN1-wE' },
  { name: 'Kettlebell Swings', type: 'gym', category: 'conditioning', description: 'Kettlebell swings', reps: '15', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=cKx8xE8jJZI' },
  { name: 'Sled Push', type: 'gym', category: 'conditioning', description: 'Push sled machine', reps: '40m', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=tVDKW9I0tXc' },
  { name: 'Sled Pull', type: 'gym', category: 'conditioning', description: 'Pull sled machine', reps: '40m', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=tVDKW9I0tXc' },
  { name: 'Farmer Walks', type: 'gym', category: 'conditioning', description: 'Farmer carry with heavy weights', reps: '40m', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=dVWGH3BVJn0' },
  { name: 'Medicine Ball Slams', type: 'gym', category: 'conditioning', description: 'Medicine ball overhead slams', reps: '12', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=_sL-Y3BRH8I' },
  { name: 'Wall Balls', type: 'gym', category: 'conditioning', description: 'Wall ball throw exercise', reps: '15', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=EgTdUXxCeZk' },
  { name: 'Jump Rope', type: 'gym', category: 'conditioning', description: 'Jump rope cardio', duration: '15 min', videoUrl: 'https://www.youtube.com/watch?v=eudVTnCHdlI' },
  { name: 'Agility Ladder Drills', type: 'gym', category: 'conditioning', description: 'Agility ladder footwork', duration: '10 min', videoUrl: 'https://www.youtube.com/watch?v=j3uazCjC8oQ' },
  { name: 'Elliptical Machine', type: 'gym', category: 'conditioning', description: 'Elliptical machine cardio', duration: '15 min', videoUrl: 'https://www.youtube.com/watch?v=hzGmXZJIeco' },
  { name: 'Stationary Bike', type: 'gym', category: 'conditioning', description: 'Stationary bike cardio', duration: '15 min', videoUrl: 'https://www.youtube.com/watch?v=TL1eH2y_lOw' },
  { name: 'Speed Bag', type: 'gym', category: 'conditioning', description: 'Speed bag training', duration: '10 min', videoUrl: 'https://www.youtube.com/watch?v=4bQrNmE4cRQ' },
  { name: 'Heavy Bag', type: 'gym', category: 'conditioning', description: 'Heavy bag punching', duration: '10 min', videoUrl: 'https://www.youtube.com/watch?v=z9YHjECTjI0' },
  { name: 'Tire Flips', type: 'gym', category: 'conditioning', description: 'Flip heavy tire', reps: '10', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=6ZkB2GX3qfk' },
  { name: 'Prowler Push', type: 'gym', category: 'conditioning', description: 'Prowler sled push machine', reps: '40m', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=tVDKW9I0tXc' },
  { name: 'Rope Climbing', type: 'gym', category: 'conditioning', description: 'Climb rope for cardio', reps: '20ft', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=J-5OJH7bnDQ' },
  { name: 'Turkish Get-ups', type: 'gym', category: 'conditioning', description: 'Kettlebell Turkish get-ups', reps: '5', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=3Oa9DRSwTXE' },
  { name: 'Burpee Box Jump', type: 'gym', category: 'conditioning', description: 'Burpee followed by box jump', reps: '10', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=JZQA08SlJnM' },
  { name: 'Double Unders', type: 'gym', category: 'conditioning', description: 'Double rotation jump rope', reps: '30', sets: '3', videoUrl: 'https://www.youtube.com/watch?v=eudVTnCHdlI' },
  { name: 'Incline Treadmill Walk', type: 'gym', category: 'conditioning', description: 'Incline treadmill walking', duration: '10 min', videoUrl: 'https://www.youtube.com/watch?v=ZkqwVqvuYNY' },
];

// Additional exercises to expand the pool
const additionalExercises = [
  // GYM - UPPER (12 exercises)
  { name: 'Cable Flyes', type: 'gym', category: 'upper', sets: '3', reps: '12-15', description: JSON.stringify({ restSeconds: 60, muscleGroup: 'Chest', instructions: 'Stand between cables, bring handles together in front of chest with slight elbow bend' }), videoUrl: 'https://www.youtube.com/watch?v=pFAJRs91dt0' },
  { name: 'Incline Dumbbell Press', type: 'gym', category: 'upper', sets: '3', reps: '10-12', description: JSON.stringify({ restSeconds: 90, muscleGroup: 'Upper Chest', instructions: 'Set bench to 30-45 degrees, press dumbbells up from chest level' }), videoUrl: 'https://www.youtube.com/watch?v=DbLWScEPv7I' },
  { name: 'Face Pulls', type: 'gym', category: 'upper', sets: '3', reps: '15-20', description: JSON.stringify({ restSeconds: 60, muscleGroup: 'Rear Delts', instructions: 'Pull rope attachment to face level, flare elbows out to sides' }), videoUrl: 'https://www.youtube.com/watch?v=rep-qVOkYSc' },
  { name: 'Seated Cable Row', type: 'gym', category: 'upper', sets: '3', reps: '10-12', description: JSON.stringify({ restSeconds: 90, muscleGroup: 'Back', instructions: 'Sit upright, pull handle to lower chest keeping elbows close to body' }), videoUrl: 'https://www.youtube.com/watch?v=5P0-pAJ-p5s' },
  { name: 'Shrugs', type: 'gym', category: 'upper', sets: '3', reps: '15-20', description: JSON.stringify({ restSeconds: 60, muscleGroup: 'Traps', instructions: 'Hold heavy dumbbells or barbell, shrug shoulders straight up and hold briefly' }), videoUrl: 'https://www.youtube.com/watch?v=Q2IKwF1B3i4' },
  { name: 'Chest Dips', type: 'gym', category: 'upper', sets: '3', reps: '8-12', description: JSON.stringify({ restSeconds: 90, muscleGroup: 'Chest', instructions: 'Lean forward slightly on dip bars, lower until chest is at bar level' }), videoUrl: 'https://www.youtube.com/watch?v=tzrYlHIiPRk' },
  { name: 'Preacher Curls', type: 'gym', category: 'upper', sets: '3', reps: '10-12', description: JSON.stringify({ restSeconds: 90, muscleGroup: 'Biceps', instructions: 'Rest upper arms on preacher pad, curl barbell up fully squeezing at top' }), videoUrl: 'https://www.youtube.com/watch?v=psM3bVuVRu4' },

  // GYM - LOWER (12 exercises)
  { name: 'Hip Thrusts', type: 'gym', category: 'lower', sets: '3', reps: '12-15', description: JSON.stringify({ restSeconds: 90, muscleGroup: 'Glutes', instructions: 'Upper back on bench, barbell on hips, drive hips up squeezing glutes at top' }), videoUrl: 'https://www.youtube.com/watch?v=wPM8icPYGQo' },
  { name: 'Hack Squats', type: 'gym', category: 'lower', sets: '3', reps: '10-12', description: JSON.stringify({ restSeconds: 90, muscleGroup: 'Quads', instructions: 'On hack squat machine, lower until thighs are parallel, drive through heels' }), videoUrl: 'https://www.youtube.com/watch?v=F1d7HqmMSUU' },
  { name: 'Calf Raises', type: 'gym', category: 'lower', sets: '4', reps: '15-20', description: JSON.stringify({ restSeconds: 60, muscleGroup: 'Calves', instructions: 'Stand on edge of platform, raise heels as high as possible, lower slowly' }), videoUrl: 'https://www.youtube.com/watch?v=zKDRMh0p3G0' },
  { name: 'Goblet Squats', type: 'gym', category: 'lower', sets: '3', reps: '12-15', description: JSON.stringify({ restSeconds: 60, muscleGroup: 'Quads/Glutes', instructions: 'Hold dumbbell at chest, squat deep keeping elbows inside knees' }), videoUrl: 'https://www.youtube.com/watch?v=eoOUqRu0V-w' },
  { name: 'Front Squats', type: 'gym', category: 'lower', sets: '3', reps: '8-10', description: JSON.stringify({ restSeconds: 120, muscleGroup: 'Quads', instructions: 'Bar rests on front delts, elbows high, squat deep keeping torso upright' }), videoUrl: 'https://www.youtube.com/watch?v=qf3bCRjSHkU' },
  { name: 'Reverse Lunges', type: 'gym', category: 'lower', sets: '3', reps: '12 each', description: JSON.stringify({ restSeconds: 60, muscleGroup: 'Quads/Glutes', instructions: 'Step backward into lunge, lower back knee toward floor, return to start' }), videoUrl: 'https://www.youtube.com/watch?v=F1wVx-yqCaI' },

  // GYM - CONDITIONING (12 exercises)
  { name: 'Sled Push', type: 'gym', category: 'conditioning', sets: '4', reps: '20m', description: JSON.stringify({ restSeconds: 90, muscleGroup: 'Full Body', instructions: 'Load sled, drive forward with powerful leg pushes keeping low body position' }), videoUrl: 'https://www.youtube.com/watch?v=tVDKW9I0tXc' },
  { name: 'Medicine Ball Slams', type: 'gym', category: 'conditioning', sets: '4', reps: '12-15', description: JSON.stringify({ restSeconds: 60, muscleGroup: 'Full Body', instructions: 'Raise ball overhead, slam down with full force, catch on bounce' }), videoUrl: 'https://www.youtube.com/watch?v=_sL-Y3BRH8I' },
  { name: 'Tire Flips', type: 'gym', category: 'conditioning', sets: '4', reps: '8-10', description: JSON.stringify({ restSeconds: 90, muscleGroup: 'Full Body', instructions: 'Squat under tire, drive up with legs, push tire over as it rises' }), videoUrl: 'https://www.youtube.com/watch?v=6ZkB2GX3qfk' },
  { name: 'Farmer\'s Carry', type: 'gym', category: 'conditioning', sets: '4', reps: '30m', description: JSON.stringify({ restSeconds: 90, muscleGroup: 'Full Body', instructions: 'Hold heavy weights at sides, walk with upright posture and controlled steps' }), videoUrl: 'https://www.youtube.com/watch?v=dVWGH3BVJn0' },

  // HOME - UPPER (12 exercises)
  { name: 'Resistance Band Rows', type: 'home', category: 'upper', sets: '3', reps: '12-15', description: JSON.stringify({ restSeconds: 60, muscleGroup: 'Back', instructions: 'Anchor band at chest height, pull handles to sides squeezing shoulder blades' }), videoUrl: 'https://www.youtube.com/watch?v=0nWGQIWlKX8' },
  { name: 'Resistance Band Curls', type: 'home', category: 'upper', sets: '3', reps: '12-15', description: JSON.stringify({ restSeconds: 60, muscleGroup: 'Biceps', instructions: 'Stand on band, curl handles up to shoulders keeping elbows at sides' }), videoUrl: 'https://www.youtube.com/watch?v=4CLhkVWW5Ck' },
  { name: 'Inverted Rows', type: 'home', category: 'upper', sets: '3', reps: '10-12', description: JSON.stringify({ restSeconds: 90, muscleGroup: 'Back', instructions: 'Under a table or bar, pull chest up to bar keeping body straight' }), videoUrl: 'https://www.youtube.com/watch?v=OISfp89drwA' },
  { name: 'Superman Hold', type: 'home', category: 'upper', sets: '3', reps: '10-12', description: JSON.stringify({ restSeconds: 60, muscleGroup: 'Lower Back', instructions: 'Lie face down, raise arms and legs simultaneously, hold 2 seconds at top' }), videoUrl: 'https://www.youtube.com/watch?v=ayPxJUFsj_0' },

  // HOME - LOWER (12 exercises)
  { name: 'Single-leg Glute Bridge', type: 'home', category: 'lower', sets: '3', reps: '12-15 each', description: JSON.stringify({ restSeconds: 60, muscleGroup: 'Glutes', instructions: 'Lie on back, one leg extended, drive hip up through planted heel' }), videoUrl: 'https://www.youtube.com/watch?v=d0Soa8O2lFI' },
  { name: 'Pistol Squat Progression', type: 'home', category: 'lower', sets: '3', reps: '8-10 each', description: JSON.stringify({ restSeconds: 90, muscleGroup: 'Quads/Glutes', instructions: 'Hold onto support if needed, extend one leg forward, squat on other leg' }), videoUrl: 'https://www.youtube.com/watch?v=6IXLQ7JVYX8' },
  { name: 'Lateral Lunges', type: 'home', category: 'lower', sets: '3', reps: '10-12 each', description: JSON.stringify({ restSeconds: 60, muscleGroup: 'Quads/Glutes', instructions: 'Step wide to side, bend that knee while keeping other leg straight' }), videoUrl: 'https://www.youtube.com/watch?v=fIxj8s0pLh8' },
  { name: 'Donkey Kicks', type: 'home', category: 'lower', sets: '3', reps: '15 each', description: JSON.stringify({ restSeconds: 60, muscleGroup: 'Glutes', instructions: 'On all fours, kick one leg back and up keeping knee bent, squeeze glute at top' }), videoUrl: 'https://www.youtube.com/watch?v=d_Yrwk8FitzF8' },

  // HOME - CONDITIONING (12 exercises)
  { name: 'Speed Skaters', type: 'home', category: 'conditioning', sets: '3', reps: '20 total', description: JSON.stringify({ restSeconds: 60, muscleGroup: 'Legs/Cardio', instructions: 'Leap side to side landing on one foot, swing arms like a speed skater' }), videoUrl: 'https://www.youtube.com/watch?v=LWa5l33mYbg' },
  { name: 'Tuck Jumps', type: 'home', category: 'conditioning', sets: '3', reps: '10-12', description: JSON.stringify({ restSeconds: 90, muscleGroup: 'Legs/Cardio', instructions: 'Jump up pulling knees to chest at peak, land softly and immediately repeat' }), videoUrl: 'https://www.youtube.com/watch?v=jLVvN3hKRvk' },
  { name: 'Inchworms', type: 'home', category: 'conditioning', sets: '3', reps: '10-12', description: JSON.stringify({ restSeconds: 60, muscleGroup: 'Full Body', instructions: 'Hinge at hips, walk hands out to push-up position, walk feet back to hands' }), videoUrl: 'https://www.youtube.com/watch?v=aMWpXPRPcyY' },
  { name: 'Lateral Shuffles', type: 'home', category: 'conditioning', sets: '4', reps: '30 seconds', description: JSON.stringify({ restSeconds: 60, muscleGroup: 'Legs/Cardio', instructions: 'Athletic stance, shuffle quickly side to side touching floor at each end' }), videoUrl: 'https://www.youtube.com/watch?v=aYH3PQsn9Jc' },
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

  // GET /api/exercises/:type/:category/:duration - Get 6 exercises with rotation
  app.fastify.get('/api/exercises/:type/:category/:duration', {
    schema: {
      description: 'Get 6 random exercises matching the requested type/category, with rotation filtering if authenticated',
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
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
              type: { type: 'string' },
              category: { type: 'string' },
              sets: { type: ['string', 'null'] },
              reps: { type: ['string', 'null'] },
              restSeconds: { type: 'number' },
              muscleGroup: { type: 'string' },
              instructions: { type: 'string' },
            },
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

    app.logger.info({ type, category, duration }, 'Fetching exercises');

    try {
      // Get all exercises matching type and category
      const allExercises = await app.db
        .select()
        .from(schema.exercises)
        .where(and(
          eq(schema.exercises.type, type),
          eq(schema.exercises.category, category)
        ));

      if (allExercises.length === 0) {
        app.logger.warn({ type, category }, 'No exercises found');
        return reply.status(400).send({ error: 'No exercises found for the specified filters' });
      }

      // Try to get user ID from request
      let userId: string | undefined;
      try {
        userId = (request as any).user?.id;
        if (!userId && (request as any).session) {
          userId = (request as any).session.user?.id;
        }
      } catch {
        // Silently fail if we can't get user ID
      }

      let pool = allExercises;

      // If authenticated, filter out recently used exercises
      if (userId) {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        try {
          // Get recently used exercise IDs with their completion dates
          const recentUsage = await app.db
            .select({
              exerciseId: schema.workoutExercises.exerciseId,
              completedAt: schema.workouts.completedAt,
            })
            .from(schema.workoutExercises)
            .innerJoin(schema.workouts, eq(schema.workoutExercises.workoutId, schema.workouts.id))
            .innerJoin(schema.exercises, eq(schema.workoutExercises.exerciseId, schema.exercises.id))
            .where(and(
              eq(schema.workouts.userId, userId),
              eq(schema.exercises.type, type),
              eq(schema.exercises.category, category),
              gt(schema.workoutExercises.createdAt, sevenDaysAgo)
            ));

          const recentlyUsedIds = new Set(recentUsage.map((r) => r.exerciseId));
          const recentUsageMap = new Map(recentUsage.map((r) => [r.exerciseId, r.completedAt]));

          // Filter to only unused exercises
          let filtered = allExercises.filter((ex) => !recentlyUsedIds.has(ex.id));

          // If not enough unused exercises, add least recently used
          if (filtered.length < 6) {
            const recentlyUsed = allExercises.filter((ex) => recentlyUsedIds.has(ex.id));
            // Sort by oldest usage first
            recentlyUsed.sort((a, b) => {
              const dateA = recentUsageMap.get(a.id) || new Date(0);
              const dateB = recentUsageMap.get(b.id) || new Date(0);
              return dateA.getTime() - dateB.getTime();
            });
            filtered = [...filtered, ...recentlyUsed];
          }

          pool = filtered;
          app.logger.info({ userId, filtered: pool.length, total: allExercises.length }, 'Applied exercise rotation');
        } catch (error) {
          app.logger.warn({ err: error }, 'Failed to apply rotation, using full pool');
          pool = allExercises;
        }
      }

      // Shuffle the pool and select 6
      const shuffled = shuffleArray(pool);
      const selected = shuffled.slice(0, 6);

      // Parse description JSON and format response
      const formatted = selected.map((ex) => {
        let parsed = { restSeconds: 60, muscleGroup: '', instructions: '' };
        try {
          if (ex.description) {
            parsed = JSON.parse(ex.description);
          }
        } catch {
          // If JSON parsing fails, use the raw description as instructions
          parsed.instructions = ex.description || '';
        }

        return {
          id: ex.id,
          name: ex.name,
          type: ex.type,
          category: ex.category,
          sets: ex.sets || null,
          reps: ex.reps || null,
          restSeconds: parsed.restSeconds || 60,
          muscleGroup: parsed.muscleGroup || '',
          instructions: parsed.instructions || '',
        };
      });

      app.logger.info({ count: selected.length }, 'Exercises retrieved successfully');
      return formatted;
    } catch (error) {
      app.logger.error({ err: error, type, category }, 'Failed to fetch exercises');
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

    // Insert additional exercises (skip if already exists by name+type+category)
    try {
      for (const exercise of additionalExercises) {
        const existing = await app.db
          .select()
          .from(schema.exercises)
          .where(and(
            eq(schema.exercises.name, exercise.name),
            eq(schema.exercises.type, exercise.type),
            eq(schema.exercises.category, exercise.category)
          ))
          .limit(1);

        if (existing.length === 0) {
          await app.db.insert(schema.exercises).values(exercise);
        }
      }
      app.logger.info({ count: additionalExercises.length }, 'Additional exercises seeded');
    } catch (error) {
      app.logger.warn({ err: error }, 'Failed to seed additional exercises');
    }

    // Update exercises with missing videoUrl values
    try {
      const exercisesWithoutVideo = await app.db
        .select()
        .from(schema.exercises)
        .where(isNull(schema.exercises.videoUrl));

      if (exercisesWithoutVideo.length > 0) {
        app.logger.info({ count: exercisesWithoutVideo.length }, 'Found exercises missing video URLs, updating...');

        for (const exercise of exercisesWithoutVideo) {
          // Find matching exercise in library by name, type, and category
          const libraryExercise = exerciseLibrary.find(
            (lib) =>
              lib.name === exercise.name &&
              lib.type === exercise.type &&
              lib.category === exercise.category
          );

          if (libraryExercise && libraryExercise.videoUrl) {
            await app.db
              .update(schema.exercises)
              .set({ videoUrl: libraryExercise.videoUrl })
              .where(eq(schema.exercises.id, exercise.id));

            app.logger.debug({ exerciseName: exercise.name, videoUrl: libraryExercise.videoUrl }, 'Exercise video URL updated');
          }
        }

        app.logger.info({ count: exercisesWithoutVideo.length }, 'Exercise video URLs updated successfully');
      }
    } catch (error) {
      app.logger.warn({ err: error }, 'Failed to update exercise video URLs');
    }
  });
}
