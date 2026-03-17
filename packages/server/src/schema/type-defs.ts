import gql from "graphql-tag";

export const typeDefs = gql`
  type Query {
    activityRanking(city: String!): ActivityRankingResult!
  }

  type ActivityRankingResult {
    location: Location!
    forecast: [DayForecast!]!
  }

  type Location {
    name: String!
    country: String!
    latitude: Float!
    longitude: Float!
  }

  type DayForecast {
    date: String!
    weather: WeatherSummary!
    rankings: [ActivityScore!]!
  }

  type WeatherSummary {
    temperatureMax: Float!
    temperatureMin: Float!
    precipitationSum: Float!
    snowfallSum: Float!
    windSpeedMax: Float!
    precipitationProbabilityMax: Float!
    weatherCode: Int!
    sunshineDuration: Float!
    uvIndexMax: Float!
  }

  type ActivityScore {
    activity: ActivityType!
    score: Float!
  }

  enum ActivityType {
    SKIING
    SURFING
    OUTDOOR_SIGHTSEEING
    INDOOR_SIGHTSEEING
  }
`;
