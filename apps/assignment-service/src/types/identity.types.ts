export interface ResponderEligibilityResponse {
  user: {
    id: string;
    role: string;
    isActive: boolean;
    isEligible: boolean;
  };
}

export interface ActiveRespondersResponse {
  count: number;
  responders: {
    id: string;
    full_name: string;
    profile: {
      latitude: number | null;
      longitude: number | null;
      is_available: boolean;
    };
    skills: string[];
  }[];
}