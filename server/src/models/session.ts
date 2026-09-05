export interface Session {
  authenticated: boolean;
  username?: string;
  deviceId?: string | null;
}

