
import type {
  ResponderRecommendation as ResponderRecommendationType,
} from '../types/assignment.types';

interface ResponderSelectorProps {
  responders: ResponderRecommendationType[];
  selectedResponderId: string;
  onSelect: (responderId: string) => void;
  loading: boolean;
}

export default function ResponderSelector({
  responders,
  selectedResponderId,
  onSelect,
  loading,
}: ResponderSelectorProps) {
  if (loading) {
    return (
      <p className="text-sm text-gray-500">
        Loading recommended responders...
      </p>
    );
  }

  if (responders.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No available responders found.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-900">
        Select a Responder
      </h3>

      {responders.map((responder, index) => {
        const isSelected =
          selectedResponderId === responder.responder_id;

        const hasSkillMatch =
          responder.score_breakdown.skill_match > 0;

        return (
          <button
            key={responder.responder_id}
            type="button"
            onClick={() => onSelect(responder.responder_id)}
            className={`w-full rounded-lg border p-4 text-left transition ${
              isSelected
                ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                : 'border-gray-200 bg-white hover:border-blue-300'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-gray-900">
                  {index === 0 ? '★ ' : ''}
                  {responder.responder_name}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {responder.active_assignments} active assignment(s)
                </p>
              </div>

              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                {responder.total_score.toFixed(2)} / 100
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  hasSkillMatch
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {hasSkillMatch ? '✓ Skill match' : 'No skill match'}
              </span>

              <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                Available
              </span>

              <span className="rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-700">
                {responder.distance_km !== null
                  ? `${responder.distance_km} km away`
                  : 'Distance unavailable'}
              </span>
            </div>

            <p className="mt-2 text-xs text-gray-600">
              <strong>Reason:</strong>{' '}
              {responder.recommendation_reason}
            </p>

            <p className="mt-2 text-xs text-gray-500">
              Skills: {responder.skills.join(', ') || 'None assigned'}
            </p>
          </button>
        );
      })}
    </div>
  );
}
