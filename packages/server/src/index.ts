import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs } from "./schema/type-defs.js";
import { resolvers } from "./schema/resolvers/activity-ranking.js";
import { OpenMeteoGeocodingAdapter } from "./infrastructure/geocoding/open-meteo-geocoding.adapter.js";
import { OpenMeteoWeatherAdapter } from "./infrastructure/weather/open-meteo-weather.adapter.js";
import { ScoringService } from "./application/scoring.service.js";
import { scoringConfig } from "./config/scoring.config.js";
import type { GraphQLContext } from "./types/graphql.js";

const server = new ApolloServer<GraphQLContext>({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async (): Promise<GraphQLContext> => ({
    services: {
      geocoding: new OpenMeteoGeocodingAdapter(),
      weather: new OpenMeteoWeatherAdapter(),
      scoring: new ScoringService(scoringConfig),
    },
  }),
});

console.log(`Server ready at ${url}`);
