export interface AutoReplyRule {
  id: string;
  contains: string;
  reply: string;
}

export interface AutoReplySettings {
  globalEnabled: boolean;
  disabledDevices: string[];
  disabledNumbers: string[];
}

export interface AutoReplyConfig {
  rules: AutoReplyRule[];
  settings: AutoReplySettings;
}

