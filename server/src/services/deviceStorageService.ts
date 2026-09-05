import path from "path";
import { storageDir } from "../config/storage";
import { readJSON, writeJSON } from "../utils/jsonFile";
import { DeviceInfo, DeviceSchedule } from "../models/device";

const devicesFile = path.join(storageDir, "devices.json");

export const getAllDevices = (): DeviceInfo[] => {
  return readJSON<DeviceInfo[]>(devicesFile, []);
};

export const getDeviceById = (id: string): DeviceInfo | undefined => {
  const devices = getAllDevices();
  return devices.find(d => d.id === id);
};

export const saveDevice = (device: DeviceInfo): DeviceInfo => {
  const devices = getAllDevices();
  const index = devices.findIndex(d => d.id === device.id);
  
  const updatedDevice = {
    ...device,
    lastUpdated: new Date().toISOString()
  };

  if (index >= 0) {
    devices[index] = updatedDevice;
  } else {
    devices.push(updatedDevice);
  }

  writeJSON(devicesFile, devices);
  return updatedDevice;
};

export const deleteDeviceLocal = (id: string): boolean => {
  const devices = getAllDevices();
  const filtered = devices.filter(d => d.id !== id);
  if (filtered.length === devices.length) return false;
  
  writeJSON(devicesFile, filtered);
  return true;
};

export const validateDeviceData = (data: any): string | null => {
  if (!data.id) return "ID perangkat diperlukan";
  if (!data.name) return "Nama perangkat diperlukan";
  if (!Array.isArray(data.schedules)) return "Jadwal harus berupa array";
  
  for (const schedule of data.schedules) {
    if (!schedule.day || !schedule.startTime || !schedule.endTime) {
      return "Format jadwal tidak valid";
    }
  }
  
  return null;
};

export const isDeviceInSchedule = (device: DeviceInfo): boolean => {
  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = days[now.getDay()];
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  return device.schedules.some(s => {
    const isDayMatch = s.day === 'Everyday' || s.day === currentDay;
    if (!isDayMatch) return false;
    
    return currentTime >= s.startTime && currentTime <= s.endTime;
  });
};
