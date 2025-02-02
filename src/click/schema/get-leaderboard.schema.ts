import { t } from "elysia";

export const getLeaderboardSchema = {
  query: t.Object({
    limit: t.Union([t.Literal("5"), t.Literal("10")]),
  }),
  detail: {
    tags: ["leaderboard"],
    summary: "Get users leaderboard",
    description: "This method allows to get top users with the highest points",
  },
  response: {
    200: t.Array(t.Object({
      userId: t.String({
        pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
        examples: [
          "7863db4a-ebe2-41bf-a60b-507f2793c4ab",
          "5a02fd17-0b51-4a97-be8c-3db143ede8db"
        ]
      }),
      totalPoints: t.Number({
        minimum: 0,
        examples: [1, 2, 3, 4, 5]
      })
    }))
  }
}