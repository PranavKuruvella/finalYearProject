"use client";

import { useEffect, useRef, useCallback, useState } from "react";

export type SwipeDirection = "left" | "right" | null;
export type GestureType = "thumbsUp" | "ok" | "peace" | null;

export interface BodyMeasurements {
  shoulderWidthCm: number;
  torsoLengthCm: number;
  chestEstimateCm: number;
  distanceMeters: number;
  recommendedSize: "S" | "M" | "L" | "XL";
  fitConfidence: number;
  isCalibrated: boolean;
}

export interface SwipeGestureHook {
  direction: SwipeDirection;
  gesture: GestureType;
  tracking: boolean;
  bodyTracking: boolean;
  measurements: BodyMeasurements | null;
}

// MediaPipe hand landmark connections for drawing skeleton
const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];

// MediaPipe upper body pose landmark connections
const UPPER_BODY_CONNECTIONS = [
  [11, 12], // shoulders
  [11, 13], [13, 15], // left arm
  [12, 14], [14, 16], // right arm
  [11, 23], [12, 24], // torso sides
  [23, 24], // hips
];

// Landmark indices
const WRIST = 0;
const THUMB_TIP = 4;
const THUMB_IP = 3;
const THUMB_MCP = 2;
const INDEX_TIP = 8;
const INDEX_PIP = 6;
const INDEX_MCP = 5;
const MIDDLE_TIP = 12;
const MIDDLE_PIP = 10;
const RING_TIP = 16;
const RING_PIP = 14;
const PINKY_TIP = 20;
const PINKY_PIP = 18;

// ─── Landmark smoothing (EMA) ───
const SMOOTHING_FACTOR = 0.6;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let smoothedLandmarks: any[] | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function smoothLandmarkData(raw: any[]): any[] {
  if (!smoothedLandmarks || smoothedLandmarks.length !== raw.length) {
    smoothedLandmarks = raw.map((p: { x: number; y: number; z: number }) => ({ ...p }));
    return smoothedLandmarks;
  }
  smoothedLandmarks = raw.map((point: { x: number; y: number; z: number }, i: number) => ({
    x: SMOOTHING_FACTOR * point.x + (1 - SMOOTHING_FACTOR) * smoothedLandmarks![i].x,
    y: SMOOTHING_FACTOR * point.y + (1 - SMOOTHING_FACTOR) * smoothedLandmarks![i].y,
    z: SMOOTHING_FACTOR * point.z + (1 - SMOOTHING_FACTOR) * smoothedLandmarks![i].z,
  }));
  return smoothedLandmarks;
}

// ─── Majority voting for gesture stability ───
const VOTE_WINDOW = 4;
const gestureVoteHistory: GestureType[] = [];

function stableGesture(current: GestureType): GestureType {
  gestureVoteHistory.push(current);
  if (gestureVoteHistory.length > VOTE_WINDOW) gestureVoteHistory.shift();
  if (gestureVoteHistory.length < VOTE_WINDOW) return null;

  const counts: Record<string, number> = {};
  for (const g of gestureVoteHistory) {
    if (g) counts[g] = (counts[g] || 0) + 1;
  }

  // Require 3 out of 4 frames to agree
  for (const [gesture, count] of Object.entries(counts)) {
    if (count >= 3) return gesture as GestureType;
  }
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function detectGesture(landmarks: any[]): GestureType {
  const hand = smoothLandmarkData(landmarks[0]);

  // Thumbs Up Detection: thumb tip points up, other fingers curled
  const thumbPointsUp =
    hand[THUMB_TIP].y < hand[THUMB_IP].y &&
    hand[THUMB_IP].y < hand[THUMB_MCP].y &&
    hand[THUMB_TIP].y < hand[WRIST].y;

  const indexCurled = hand[INDEX_TIP].y > hand[INDEX_PIP].y;
  const middleCurled = hand[MIDDLE_TIP].y > hand[MIDDLE_PIP].y;
  const ringCurled = hand[RING_TIP].y > hand[RING_PIP].y;
  const pinkyCurled = hand[PINKY_TIP].y > hand[PINKY_PIP].y;

  if (thumbPointsUp && indexCurled && middleCurled && ringCurled && pinkyCurled) {
    return "thumbsUp";
  }

  // OK Sign Detection: thumb tip and index tip close together, other 3 extended
  const dx = hand[THUMB_TIP].x - hand[INDEX_TIP].x;
  const dy = hand[THUMB_TIP].y - hand[INDEX_TIP].y;
  const dz = hand[THUMB_TIP].z - hand[INDEX_TIP].z;
  const thumbIndexDist = Math.sqrt(dx * dx + dy * dy + dz * dz);

  const pinching = thumbIndexDist < 0.07;
  const middleExtended = hand[MIDDLE_TIP].y < hand[MIDDLE_PIP].y;
  const ringExtended = hand[RING_TIP].y < hand[RING_PIP].y;
  const pinkyExtended = hand[PINKY_TIP].y < hand[PINKY_PIP].y;

  if (pinching && middleExtended && ringExtended && pinkyExtended) {
    return "ok";
  }

  // Peace / Victory sign (✌️) or Point Up (☝️) for Voice Activation
  const indexExtended = hand[INDEX_TIP].y < hand[INDEX_PIP].y;
  if (indexExtended && ringCurled && pinkyCurled && !pinching) {
    return "peace";
  }

  return null;
}

function drawAllLandmarks(
  canvas: HTMLCanvasElement,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handLandmarks: any[] | null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  poseLandmarks: any[] | null,
  videoWidth: number,
  videoHeight: number,
  measurements: BodyMeasurements | null
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = videoWidth;
  canvas.height = videoHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. Draw Upper Body Pose Skeleton (Minimalist Luxury Aesthetic)
  if (poseLandmarks && poseLandmarks.length > 0) {
    const pose = poseLandmarks[0];

    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1.5;

    for (const [i, j] of UPPER_BODY_CONNECTIONS) {
      const a = pose[i];
      const b = pose[j];
      if (a && b && (a.visibility === undefined || a.visibility > 0.35) && (b.visibility === undefined || b.visibility > 0.35)) {
        ctx.beginPath();
        ctx.moveTo(a.x * videoWidth, a.y * videoHeight);
        ctx.lineTo(b.x * videoWidth, b.y * videoHeight);
        ctx.stroke();
      }
    }

    // Draw key joints
    for (const idx of [11, 12, 13, 14, 15, 16, 23, 24]) {
      const p = pose[idx];
      if (p && (p.visibility === undefined || p.visibility > 0.35)) {
        const px = p.x * videoWidth;
        const py = p.y * videoHeight;

        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, 2 * Math.PI);
        ctx.fill();
      }
    }

    // Dynamic Shoulder Measurement Callout
    const lSh = pose[11];
    const rSh = pose[12];
    if (lSh && rSh && measurements) {
      const midX = ((lSh.x + rSh.x) / 2) * videoWidth;
      const midY = ((lSh.y + rSh.y) / 2) * videoHeight - 16;

      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(lSh.x * videoWidth, lSh.y * videoHeight);
      ctx.lineTo(rSh.x * videoWidth, rSh.y * videoHeight);
      ctx.stroke();
      ctx.setLineDash([]);

      const text = `${measurements.shoulderWidthCm.toFixed(1)} CM • SIZE ${measurements.recommendedSize}`;
      ctx.font = "500 9px sans-serif";
      const textWidth = ctx.measureText(text).width;
      const pillWidth = textWidth + 14;
      const pillHeight = 18;

      ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(midX - pillWidth / 2, midY - pillHeight / 2, pillWidth, pillHeight, 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, midX, midY);
    }
  }

  // 2. Draw Hand Landmarks (Electric Blue glow)
  if (handLandmarks && handLandmarks.length > 0) {
    for (const hand of handLandmarks) {
      const wrist = hand[0];
      const middleTip = hand[12];
      const handSize = Math.hypot(
        (middleTip.x - wrist.x) * videoWidth,
        (middleTip.y - wrist.y) * videoHeight
      );

      const dotRadius = Math.max(4, Math.min(8, handSize * 0.04));
      const ringRadius = dotRadius * 1.3;
      const lineWidth = Math.max(2, Math.min(5, handSize * 0.025));
      const glowSize = Math.max(4, lineWidth * 1.5);

      ctx.strokeStyle = "#4A90FF";
      ctx.lineWidth = lineWidth;
      ctx.shadowColor = "#4A90FF";
      ctx.shadowBlur = glowSize;
      for (const [i, j] of HAND_CONNECTIONS) {
        const a = hand[i];
        const b = hand[j];
        ctx.beginPath();
        ctx.moveTo(a.x * videoWidth, a.y * videoHeight);
        ctx.lineTo(b.x * videoWidth, b.y * videoHeight);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;

      for (const point of hand) {
        const px = point.x * videoWidth;
        const py = point.y * videoHeight;
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(px, py, ringRadius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = "#4A90FF";
        ctx.beginPath();
        ctx.arc(px, py, dotRadius, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }
}

export function useSwipeGesture(
  videoEl: HTMLVideoElement | null,
  canvasEl: HTMLCanvasElement | null,
  enabled: boolean,
  onSwipe: (direction: "left" | "right") => void,
  onGesture?: (gesture: "thumbsUp" | "ok" | "peace") => void
): SwipeGestureHook {
  const [tracking, setTracking] = useState(false);
  const [bodyTracking, setBodyTracking] = useState(false);
  const [direction, setDirection] = useState<SwipeDirection>(null);
  const [gesture, setGesture] = useState<GestureType>(null);
  const [measurements, setMeasurements] = useState<BodyMeasurements | null>(null);

  const measurementsRef = useRef<BodyMeasurements | null>(null);
  const onSwipeRef = useRef(onSwipe);
  onSwipeRef.current = onSwipe;
  const onGestureRef = useRef(onGesture);
  onGestureRef.current = onGesture;

  const handHistoryRef = useRef<{ x: number; y: number; time: number }[]>([]);
  const cooldownRef = useRef(false);
  const gestureCooldownRef = useRef(false);
  const gestureHoldRef = useRef<{ type: GestureType; start: number }>({ type: null, start: 0 });
  const stableFramesRef = useRef(0);

  // EMA smoothing accumulators for anthropometric measurement stability
  const smoothShoulderRef = useRef<number>(43.0);
  const smoothTorsoRef = useRef<number>(51.0);
  const measurementSamplesRef = useRef<number>(0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handLandmarkerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const poseLandmarkerRef = useRef<any>(null);
  const rafRef = useRef<number>(0);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  const canvasRef = useRef(canvasEl);
  canvasRef.current = canvasEl;

  const processFrame = useCallback(() => {
    if (!videoEl || !enabledRef.current) return;
    if (videoEl.readyState < 2) {
      rafRef.current = requestAnimationFrame(processFrame);
      return;
    }

    try {
      const nowTs = performance.now();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let handResults: any = null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let poseResults: any = null;

      if (handLandmarkerRef.current) {
        handResults = handLandmarkerRef.current.detectForVideo(videoEl, nowTs);
      }
      if (poseLandmarkerRef.current) {
        poseResults = poseLandmarkerRef.current.detectForVideo(videoEl, nowTs);
      }

      // ─── Process Pose & Anthropometrics ───
      const hasPose = poseResults && poseResults.landmarks && poseResults.landmarks.length > 0;
      setBodyTracking(Boolean(hasPose));

      if (hasPose && poseResults.worldLandmarks && poseResults.worldLandmarks.length > 0) {
        const world = poseResults.worldLandmarks[0];
        const screen = poseResults.landmarks[0];
        const lSh = world[11];
        const rSh = world[12];
        const lHp = world[23];
        const rHp = world[24];

        if (lSh && rSh && lHp && rHp) {
          const rawShoulderDist = Math.hypot(
            (rSh.x - lSh.x),
            (rSh.y - lSh.y),
            (rSh.z - lSh.z)
          ) * 100;

          const midShY = (lSh.y + rSh.y) / 2;
          const midShZ = (lSh.z + rSh.z) / 2;
          const midHpY = (lHp.y + rHp.y) / 2;
          const midHpZ = (lHp.z + rHp.z) / 2;
          const rawTorsoDist = Math.hypot(midShY - midHpY, midShZ - midHpZ) * 100;

          const clampedShoulder = Math.max(36.0, Math.min(52.5, rawShoulderDist));
          const clampedTorso = Math.max(44.0, Math.min(62.0, rawTorsoDist));

          smoothShoulderRef.current = 0.88 * smoothShoulderRef.current + 0.12 * clampedShoulder;
          smoothTorsoRef.current = 0.88 * smoothTorsoRef.current + 0.12 * clampedTorso;
          measurementSamplesRef.current += 1;

          const finalShoulder = smoothShoulderRef.current;
          const finalTorso = smoothTorsoRef.current;
          const chestEst = finalShoulder * 2.25;

          const screenSpan = Math.abs(screen[12].x - screen[11].x);
          const distanceEst = Math.max(0.8, Math.min(2.8, Number((0.45 / Math.max(0.18, screenSpan)).toFixed(1))));

          let recSize: "S" | "M" | "L" | "XL" = "M";
          let confidence = 94;

          if (finalShoulder < 41.5) {
            recSize = "S";
            confidence = Math.max(82, Math.min(98, Math.round(98 - Math.abs(finalShoulder - 39.5) * 4.2)));
          } else if (finalShoulder < 45.0) {
            recSize = "M";
            confidence = Math.max(84, Math.min(99, Math.round(98 - Math.abs(finalShoulder - 43.2) * 3.6)));
          } else if (finalShoulder < 48.5) {
            recSize = "L";
            confidence = Math.max(83, Math.min(98, Math.round(98 - Math.abs(finalShoulder - 46.5) * 3.6)));
          } else {
            recSize = "XL";
            confidence = Math.max(80, Math.min(97, Math.round(97 - Math.abs(finalShoulder - 50.5) * 3.8)));
          }

          const newMeasurements: BodyMeasurements = {
            shoulderWidthCm: Number(finalShoulder.toFixed(1)),
            torsoLengthCm: Number(finalTorso.toFixed(1)),
            chestEstimateCm: Number(chestEst.toFixed(1)),
            distanceMeters: distanceEst,
            recommendedSize: recSize,
            fitConfidence: confidence,
            isCalibrated: measurementSamplesRef.current > 10,
          };

          measurementsRef.current = newMeasurements;

          if (measurementSamplesRef.current % 5 === 0) {
            setMeasurements(newMeasurements);
          }
        }
      }

      // ─── Draw Skeletons ───
      if (canvasRef.current) {
        drawAllLandmarks(
          canvasRef.current,
          handResults?.landmarks || null,
          poseResults?.landmarks || null,
          videoEl.videoWidth,
          videoEl.videoHeight,
          measurementsRef.current
        );
      }

      // ─── Process Hand Tracking & Gestures ───
      if (!handResults || !handResults.landmarks || handResults.landmarks.length === 0) {
        handHistoryRef.current = [];
        gestureHoldRef.current = { type: null, start: 0 };
        stableFramesRef.current = 0;
        smoothedLandmarks = null;
        gestureVoteHistory.length = 0;
        setTracking(false);
      } else {
        stableFramesRef.current++;
        const stable = stableFramesRef.current >= 2;
        setTracking(true);

        // Gesture Detection (thumbsUp / ok)
        if (stable && !gestureCooldownRef.current) {
          const rawDetected = detectGesture(handResults.landmarks);
          const detected = stableGesture(rawDetected);

          if (detected) {
            const hold = gestureHoldRef.current;
            if (hold.type === detected) {
              if (Date.now() - hold.start > 200) {
                setGesture(detected);
                onGestureRef.current?.(detected);
                setTimeout(() => setGesture(null), 1000);

                gestureCooldownRef.current = true;
                gestureHoldRef.current = { type: null, start: 0 };
                gestureVoteHistory.length = 0;
                setTimeout(() => {
                  gestureCooldownRef.current = false;
                }, 1500);
              }
            } else {
              gestureHoldRef.current = { type: detected, start: Date.now() };
            }
          } else {
            gestureHoldRef.current = { type: null, start: 0 };
          }
        }

        // Swipe Detection (Open hand horizontal swipe)
        if (stable) {
          const hand = handResults.landmarks[0];
          const wrist = hand[WRIST];
          const now = Date.now();

          handHistoryRef.current.push({
            x: wrist.x,
            y: wrist.y,
            time: now,
          });

          handHistoryRef.current = handHistoryRef.current.filter((p) => now - p.time < 450);

          const history = handHistoryRef.current;
          if (history.length >= 2 && !cooldownRef.current) {
            const first = history[0];
            const last = history[history.length - 1];
            const dx = last.x - first.x;
            const dt = last.time - first.time;

            const fingersExtended =
              (hand[INDEX_TIP].y < hand[INDEX_PIP].y ? 1 : 0) +
              (hand[MIDDLE_TIP].y < hand[MIDDLE_PIP].y ? 1 : 0) +
              (hand[RING_TIP].y < hand[RING_PIP].y ? 1 : 0) +
              (hand[PINKY_TIP].y < hand[PINKY_PIP].y ? 1 : 0);

            // Responsive swipe: movement > 0.04 over 30-700ms with open fingers
            if (
              Math.abs(dx) > 0.04 &&
              dt > 30 &&
              dt < 700 &&
              fingersExtended >= 2
            ) {
              setDirection("right");
              onSwipeRef.current("right");
              setTimeout(() => setDirection(null), 400);

              cooldownRef.current = true;
              handHistoryRef.current = [];
              setTimeout(() => {
                cooldownRef.current = false;
              }, 750);
            }
          }
        }
      }
    } catch {
      // Continue next frame
    }

    setTimeout(() => {
      if (enabledRef.current) {
        rafRef.current = requestAnimationFrame(processFrame);
      }
    }, 33);
  }, [videoEl]);

  useEffect(() => {
    if (!videoEl || !enabled) {
      setTracking(false);
      setBodyTracking(false);
      return;
    }

    let cancelled = false;

    async function init() {
      const vision = await import("@mediapipe/tasks-vision");
      if (cancelled) return;

      const { HandLandmarker, PoseLandmarker, FilesetResolver } = vision;

      const filesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      if (cancelled) return;

      const [handLandmarker, poseLandmarker] = await Promise.all([
        HandLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 1,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        }),
        PoseLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        }),
      ]);

      if (cancelled) {
        handLandmarker.close();
        poseLandmarker.close();
        return;
      }

      handLandmarkerRef.current = handLandmarker;
      poseLandmarkerRef.current = poseLandmarker;
      rafRef.current = requestAnimationFrame(processFrame);
    }

    init();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      if (handLandmarkerRef.current) {
        handLandmarkerRef.current.close();
        handLandmarkerRef.current = null;
      }
      if (poseLandmarkerRef.current) {
        poseLandmarkerRef.current.close();
        poseLandmarkerRef.current = null;
      }
      smoothedLandmarks = null;
      gestureVoteHistory.length = 0;
      setTracking(false);
      setBodyTracking(false);
    };
  }, [videoEl, enabled, processFrame]);

  return { direction, gesture, tracking, bodyTracking, measurements };
}
