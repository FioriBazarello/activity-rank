export interface ScoreRange {
  min: number;
  max: number;
  score: number;
}

export interface VariableConfig {
  variable: string;
  weight: number;
  ranges: ScoreRange[];
}

export interface ActivityConfig {
  name: ActivityType;
  variables: VariableConfig[];
}

export enum ActivityType {
  SKIING = "SKIING",
  SURFING = "SURFING",
  OUTDOOR_SIGHTSEEING = "OUTDOOR_SIGHTSEEING",
  INDOOR_SIGHTSEEING = "INDOOR_SIGHTSEEING",
}
