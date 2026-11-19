export interface Incident {
  id: string;
  reference_number: string;
  type: string;
  priority: string;
  status: string;
  latitude: number | null;
  longitude: number | null;
}