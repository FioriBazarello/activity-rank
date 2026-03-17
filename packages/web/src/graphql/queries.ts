import { gql } from "@apollo/client";

export const ACTIVITY_RANKING_QUERY = gql`
  query ActivityRanking($city: String!) {
    activityRanking(city: $city) {
      location {
        name
        country
        latitude
        longitude
      }
      forecast {
        date
        weather {
          temperatureMax
          temperatureMin
          precipitationSum
          snowfallSum
          windSpeedMax
          precipitationProbabilityMax
          weatherCode
          sunshineDuration
          uvIndexMax
        }
        rankings {
          activity
          score
        }
      }
    }
  }
`;
