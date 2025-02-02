import { t } from "elysia";

export const insertClickSchema = {
  body: t.Object({
    userId: t.String({
      pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
      examples: [
        "7863db4a-ebe2-41bf-a60b-507f2793c4ab"
      ]
    }),
    points: t.Number({
      minimum: 1,
      default: 1,
      examples: [1, 2, 3, 4, 5]
    }),
  }),
  detail: {
    tags: ["click"],
    summary: "Insert a click event",
    description: "This method allows to insert a click event",
  },
  response: {
    200: t.Object({
      message: t.String({
        pattern: "Click event inserted"
      }),
      eventId: t.String({
        pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
      })
    })
  }
}