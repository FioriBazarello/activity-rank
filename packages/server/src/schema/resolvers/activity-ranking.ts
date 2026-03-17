import { GraphQLError } from "graphql";
import type { GraphQLContext } from "../../types/graphql.js";

export const resolvers = {
  Query: {
    activityRanking: async (
      _parent: unknown,
      { city }: { city: string },
      context: GraphQLContext
    ) => {
      if (!city.trim()) {
        throw new GraphQLError("City name is required", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      try {
        const location = await context.services.geocoding.search(city);
        const forecast = await context.services.weather.getForecast(
          location.latitude,
          location.longitude
        );
        const rankings = context.services.scoring.rankActivities(forecast);

        return { location, forecast: rankings };
      } catch (error) {
        if (error instanceof GraphQLError) throw error;

        const message =
          error instanceof Error ? error.message : "Unknown error";

        if (message.includes("City not found")) {
          throw new GraphQLError(message, {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }

        throw new GraphQLError(message, {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
  },
};
