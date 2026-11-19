import type { Incident } from '../types/incident.types.js';

const incidentServiceUrl = process.env.INCIDENT_SERVICE_URL;

//Incident Service protects its incident endpoints with JWT authentication, so the internal request also needs a valid token.
//So also need to pass the verified JWT from the original request through the Assignment Service to the Incident Service.
// export const findIncidentById = async (
//   incidentId: string,
//   accessToken: string,
// ): Promise<Incident | null> => {
//   if (!incidentServiceUrl) {
//     throw new Error('INCIDENT_SERVICE_URL is not configured.');
//   }

//   const response = await fetch(
//     `${incidentServiceUrl}/api/v1/incidents/${incidentId}`,
//     {
//         headers:{
//             Authorization: `Bearer ${accessToken}`,
//         }
//     }
//   );

//   if (response.status === 404) {
//     return null;
//   }

//   if (!response.ok) {
//     throw new Error(
//       `Incident Service request failed with status ${response.status}.`,
//     );
//   }

//   const data = (await response.json()) as { incident?: Incident };

//   return data.incident ?? (data as unknown as Incident);
// };

export const findIncidentById = async (
  incidentId: string,
  accessToken: string,
): Promise<Incident | null> => {
  if (!incidentServiceUrl) {
    throw new Error('INCIDENT_SERVICE_URL is not configured.');
  }

  const response = await fetch(
    `${incidentServiceUrl}/api/v1/incidents/${incidentId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      `Incident Service request failed with status ${response.status}.`,
    );
  }

  const data = (await response.json()) as { data: Incident };

  return data.data;
};