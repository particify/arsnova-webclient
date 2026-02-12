import { HealthStatus } from '@app/admin/_models/health-status.enum';
export interface SystemHealth {
  components?: HealthDetails[];
  status?: HealthStatus;
}

interface HealthDetails {
  details: unknown;
  status: HealthStatus;
}
