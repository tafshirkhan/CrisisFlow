
import type {
  ResponderRecommendation as ResponderRecommendationType,
} from '../types/assignment.types';

interface ResponderRecommendationProps {
  responders: ResponderRecommendationType[];
}

export default function ResponderRecommendation({
  responders,
}: ResponderRecommendationProps) {
  if (responders.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm text-gray-600">
          No available responders found.
        </p>
      </div>
    );
  }

  const recommendedResponder = responders[0];

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-blue-100 p-2">
          <span className="text-lg">★</span>
        </div>

        <div className="flex-1">
          <p className="text-sm font-semibold text-blue-900">
            Recommended Responder
          </p>

          <p className="mt-1 font-medium text-gray-900">
            {recommendedResponder.responder_name}
          </p>

          <p className="mt-1 text-lg font-bold text-blue-900">
            {recommendedResponder.total_score.toFixed(2)} / 100
          </p>

          <div className="mt-3 space-y-2 text-sm text-gray-700">
            <p>
              <strong>Availability:</strong>{' '}
              {recommendedResponder.is_available
                ? 'Available'
                : 'Unavailable'}
            </p>

            <p>
              <strong>Active assignments:</strong>{' '}
              {recommendedResponder.active_assignments}
            </p>

            <p>
              <strong>Distance:</strong>{' '}
              {recommendedResponder.distance_km !== null
                ? `${recommendedResponder.distance_km} km`
                : 'Not available'}
            </p>

            <div>
              <strong>Skills:</strong>
              <div className="mt-1 flex flex-wrap gap-2">
                {recommendedResponder.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-white px-2 py-1 text-xs text-gray-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <strong>Score breakdown:</strong>
              <ul className="mt-1 space-y-1">
                <li>Skill match: {recommendedResponder.score_breakdown.skill_match}/40</li>
                <li>Incident priority: {recommendedResponder.score_breakdown.incident_priority}/25</li>
                <li>Workload: {recommendedResponder.score_breakdown.workload}/20</li>
                <li>Proximity: {recommendedResponder.score_breakdown.proximity.toFixed(2)}/15</li>
              </ul>
            </div>

            <div>
              <strong>Why recommended?</strong>
              <p className="mt-1">
                {recommendedResponder.recommendation_reason}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
