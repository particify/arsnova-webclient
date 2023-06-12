import { HealthStatus } from '@app/admin/_models/health-status.enum';

export class SystemHealth {
  details: HealthDetails;
  status: HealthStatus;
}

class HealthDetails {
  diskSpace: DiskSpace;
  ping: Ping;
  rabbit: Rabbit;
}

class DiskSpace {
  details: DiskSpaceDetails;
  status: HealthStatus;
}

class DiskSpaceDetails {
  exists: boolean;
  free: number;
  path: string;
  threshold: number;
  total: number;
}

class Ping {
  status: HealthStatus;
}

class Rabbit {
  details: RabbitDetails;
  status: HealthStatus;
}

class RabbitDetails {
  version: string;
}
