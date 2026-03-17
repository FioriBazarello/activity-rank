import type { ActivityConfig, ScoreRange } from "../domain/types/scoring.js";
import type { DailyForecast } from "../domain/types/weather.js";

interface DayResult {
  date: string;
  weather: DailyForecast;
  rankings: Array<{ activity: string; score: number }>;
}

export class ScoringService {
  constructor(private config: ActivityConfig[]) {}

  rankActivities(forecast: DailyForecast[]): DayResult[] {
    return forecast.map((day) => {
      const rankings = this.config
        .map((activity) => ({
          activity: activity.name,
          score: this.calculateScore(day, activity),
        }))
        .sort((a, b) => b.score - a.score);

      return { date: day.date, weather: day, rankings };
    });
  }

  private calculateScore(day: DailyForecast, activity: ActivityConfig): number {
    let totalScore = 0;

    for (const variable of activity.variables) {
      const value = day[variable.variable as keyof DailyForecast] as number;
      const variableScore = this.getVariableScore(value, variable.ranges);
      totalScore += variableScore * variable.weight;
    }

    return Math.round(totalScore * 10) / 10;
  }

  getVariableScore(value: number, ranges: ScoreRange[]): number {
    for (const range of ranges) {
      if (value >= range.min && value < range.max) {
        return range.score;
      }
    }
    return 0;
  }
}
