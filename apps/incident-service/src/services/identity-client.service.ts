const identityServiceUrl = process.env.IDENTITY_SERVICE_URL;
const internalApiKey = process.env.IDENTITY_SERVICE_API_KEY;

export interface ResponderEligibility {
  id: string;
  role: string;
  isActive: boolean;
  isEligible: boolean;
}

export const validateResponder = async (
  responderId: string,
): Promise<ResponderEligibility> => {
  if (!identityServiceUrl || !internalApiKey) {
    throw new Error('Identity Service configuration is missing.');
  }

  const response = await fetch(
    `${identityServiceUrl}/api/v1/internal/users/${responderId}/assignment-eligibility`,
    {
      method: 'GET',
      headers: {
        'x-internal-api-key': internalApiKey,
      },
      signal: AbortSignal.timeout(5000),
    },
  );

  if (response.status === 404) {
    throw new Error('RESPONDER_NOT_FOUND');
  }

  if (!response.ok) {
    throw new Error('Unable to validate responder account.');
  }

  const result = await response.json() as {
    user: ResponderEligibility;
  };

  return result.user;
};