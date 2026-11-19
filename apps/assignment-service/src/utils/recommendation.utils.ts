import { calculateDistance } from './geo.utils.js';

interface RecommendationInput {
  incident: {
    type: string;
    priority: string;
    latitude: number | null;
    longitude: number | null;
  };
  responder: {
    skills: string[];
    active_assignments: number;
    latitude: number | null;
    longitude: number | null;
  };
}

interface RecommendationScore {
  total_score: number;
  score_breakdown: {
    skill_match: number;
    incident_priority: number;
    workload: number;
    proximity: number;
  };
  distance_km: number | null;
}

export function calculateRecommendationScore({
  incident,
  responder,
}: RecommendationInput): RecommendationScore {
  // 1. Skill matching: 40 points
  const skillMatch = responder.skills.includes(incident.type) ? 40 : 0;

  // 2. Incident priority: 25 points
  const priorityScores: Record<string, number> = {
    CRITICAL: 25,
    HIGH: 20,
    MEDIUM: 15,
    LOW: 10,
  };

  const incidentPriority =
    priorityScores[incident.priority.toUpperCase()] ?? 0;

  // 3. Workload: 20 points
  const workload = Math.max(
    0,
    20 - responder.active_assignments * 5,
  );

  // 4. Geographical proximity: 15 points
  let distanceKm: number | null = null;
  let proximity = 0;

  const hasCoordinates =
    incident.latitude !== null &&
    incident.longitude !== null &&
    responder.latitude !== null &&
    responder.longitude !== null;

  if (hasCoordinates) {
    distanceKm = calculateDistance(
      incident.latitude!,
      incident.longitude!,
      responder.latitude!,
      responder.longitude!,
    );

    proximity = Math.max(0, 15 - distanceKm * 0.75);
    proximity = Number(proximity.toFixed(2));
  }

  const totalScore =
    skillMatch + incidentPriority + workload + proximity;

  return {
    total_score: totalScore,
    score_breakdown: {
      skill_match: skillMatch,
      incident_priority: incidentPriority,
      workload,
      proximity,
    },
    distance_km:
      distanceKm === null ? null : Number(distanceKm.toFixed(2)),
  };
}