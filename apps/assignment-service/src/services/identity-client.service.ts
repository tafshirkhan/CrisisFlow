import type {
  ActiveRespondersResponse,
  ResponderEligibilityResponse,
} from '../types/identity.types.js';

const identityServiceUrl = process.env.IDENTITY_SERVICE_URL;
const identityServiceApiKey = process.env.IDENTITY_SERVICE_API_KEY;


export const isEligibleResponder = async (
  responderId: string,
): Promise<boolean> => {
  if (!identityServiceUrl || !identityServiceApiKey) {
    throw new Error(
      'Identity Service URL or internal API key is not configured.',
    );
  }

  const response = await fetch(
    `${identityServiceUrl}/api/v1/internal/users/${responderId}/assignment-eligibility`,
    {
      headers: {
        'x-internal-api-key': identityServiceApiKey,
      },
    },
  );

  if (response.status === 404) {
    return false;
  }

  if (!response.ok) {
    throw new Error(
      `Identity Service request failed with status ${response.status}.`,
    );
  }

  const data =
    (await response.json()) as ResponderEligibilityResponse;

  return data.user.isEligible;
};

export const findActiveResponders = async (): Promise<
  ActiveRespondersResponse['responders']
> => {
  if (!identityServiceUrl || !identityServiceApiKey) {
    throw new Error(
      'Identity Service URL or internal API key is not configured.',
    );
  }

  const response = await fetch(
    `${identityServiceUrl}/api/v1/internal/responders`,
    {
      headers: {
        'x-internal-api-key': identityServiceApiKey,
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Identity Service request failed with status ${response.status}.`,
    );
  }

  const data = (await response.json()) as ActiveRespondersResponse;

  return data.responders;
};