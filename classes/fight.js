// Press-conference scuffle animation. Kept separate from the main game loop.
import { clamp01 } from '../utils/math.js';

const PERIOD = 1.55; // seconds per exchange cycle
const HIT_P = 0.42; // point in each attack (0..1) where the punch lands

const easeInOut = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
const easeOut = (x) => { x = clamp01(x); return 1 - Math.pow(1 - x, 3); };

// Attack envelope: small wind-up (negative), fast strike (to 1), slow return (to 0).
function attackEnv(u) {
  if (u < 0.3) return -easeInOut(u / 0.3) * 0.35;
  if (u < HIT_P) return -0.35 + 1.35 * easeOut((u - 0.3) / (HIT_P - 0.3));
  return 1 - easeInOut((u - HIT_P) / (1 - HIT_P));
}

// Seconds since this actor's punch last landed (stateless, derived from t).
function sinceHit(t, phase) {
  const k = Math.floor((t + phase) / PERIOD - HIT_P);
  return t - ((k + HIT_P) * PERIOD - phase);
}

export function poseFight(t, { man, other, signHolder }) {
  const phA = 0;
  const phB = PERIOD * 0.5; // opponents trade blows evenly

  const act = (actor, x, facing, phase, oppPhase) => {
    const cyc = (t + phase) / PERIOD;
    const p = cyc - Math.floor(cyc);
    const atk = attackEnv(p);
    const strike = Math.max(0, atk);
    const wind = Math.max(0, -atk);
    const leftHand = Math.floor(cyc) % 2 === 1; // alternate hands each exchange

    // Reaction to the opponent's punch: sharp snap, decaying wobble.
    const s = sinceHit(t, oppPhase);
    const react = Math.exp(-s * 6) * Math.cos(s * 14);
    const flinch = Math.max(0, react);

    const bob = Math.abs(Math.sin(t * 7 + phase)) * 0.04;
    const lunge = atk * 0.18;
    const knock = flinch * 0.14;

    actor.g.position.set(x + facing * (lunge - knock) + Math.sin(t * 2.3 + phase) * 0.02, 0.95 + bob - strike * 0.03, 31.32);
    actor.g.rotation.set(0, facing > 0 ? -Math.PI / 2 : Math.PI / 2, Math.sin(t * 5 + phase) * 0.03 - react * 0.05);

    // Torso twists into the punch, folds back on impact.
    actor.spine.rotation.x = -0.08 - strike * 0.22 + wind * 0.08 + flinch * 0.2;
    actor.spine.rotation.y = (leftHand ? 1 : -1) * (strike * 0.3 - wind * 0.15);
    actor.head.rotation.x = -0.08 + flinch * 0.25 + strike * 0.05;
    actor.head.rotation.z = Math.sin(t * 6 + phase) * 0.04 + react * 0.12;

    // Punching arm vs. guard arm.
    const punch = (arm, elbow, side) => {
      arm.rotation.set(-0.6 - strike * 1.5 + wind * 0.5, 0, side * (1.65 + strike * 0.45));
      elbow.rotation.set(-0.5 - strike * 0.7 + wind * 0.4, 0, side * 0.1);
    };
    const guard = (arm, elbow, side) => {
      arm.rotation.set(-0.45 + flinch * 0.3 + Math.sin(t * 6 + phase) * 0.05, 0, side * (0.85 + Math.sin(t * 5 + phase) * 0.08));
      elbow.rotation.set(-0.9, 0, side * 0.15);
    };
    if (leftHand) { punch(actor.aL, actor.eL, 1); guard(actor.aR, actor.eR, -1); }
    else { punch(actor.aR, actor.eR, -1); guard(actor.aL, actor.eL, 1); }

    // Footwork: planted shuffle, lead leg steps into the punch.
    const step = Math.sin(t * 6 + phase) * 0.12;
    actor.lL.rotation.x = step - strike * 0.25;
    actor.lR.rotation.x = -step + strike * 0.1;

    actor.mouth.scale.set(0.055, 0.035 + Math.abs(Math.sin(t * 9 + phase)) * 0.015 + flinch * 0.03, 0.012);
    for (const [b, sx] of actor.brows) b.rotation.z = sx * (0.5 + flinch * 0.25);
  };

  act(man, -0.63, 1, phA, phB);
  act(other, 0.63, -1, phB, phA);

  if (signHolder) {
    signHolder.g.position.set(1.85, 0, 31.7);
    signHolder.g.rotation.set(0, 0, Math.sin(t * 3) * 0.02);
    signHolder.arms[0].rotation.set(-2.55 + Math.sin(t * 2.1) * 0.03, 0, -0.12);
    signHolder.arms[1].rotation.set(-2.55 + Math.sin(t * 2.1) * 0.03, 0, 0.12);
  }

  const r = () => Math.random() * .05 - .01;
  return {
    camera: [0.8 + r(), 1. + r(), 27.2 + r()],
    target: [0.55 + r(), 1.48 + r(), 31.4 + r()]
  };
}