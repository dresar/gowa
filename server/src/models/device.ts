export interface DeviceSchedule {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday' | 'Everyday';
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
}

export interface DeviceSpecs {
  platform?: string;
  manufacturer?: string;
  model?: string;
  osVersion?: string;
  batteryLevel?: number;
}

export interface DeviceInfo {
  id: string;
  name: string;
  specs: DeviceSpecs;
  status: 'active' | 'inactive';
  schedules: DeviceSchedule[];
  lastUpdated: string; // ISO Timestamp
}
