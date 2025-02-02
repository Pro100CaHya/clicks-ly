import { Elysia } from "elysia";
import { ClickService } from "./click.service";
import { insertClickSchema, getLeaderboardSchema } from "./schema";
import { UserStatistics } from "./interfaces";

export const ClickController = (clickService: ClickService) =>
  new Elysia()
    .decorate("clickService", clickService)
    .post(
      "/click",
      async ({ body: { userId, points }, clickService }) => {
        const eventId = await clickService.insertClick(userId, points);
        return { message: "Click event inserted", eventId };
      },
      insertClickSchema
    )
    .get(
      "/leaderboard",
      async ({ query: { limit }, clickService }) => {
        return (await clickService.getLeaderboard(parseInt(limit))) as UserStatistics[]
      },
      getLeaderboardSchema
    );

