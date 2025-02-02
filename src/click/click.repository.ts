import { ClickhouseService } from "../clickhouse/clickhouse.service";
import { CouchdbService } from "../couchdb/couchdb.service";
import { logger } from "../logger/logger";

export class ClickRepository {
  constructor(
    private readonly clickhouseService: ClickhouseService,
    private readonly couchdbService: CouchdbService,
  ) {}

  async insert(userId: string, points: number, eventId: string) {
    return this.clickhouseService.insert({
      table: "clicks",
      values: [
        {
          userId,
          points,
          eventId,
        }
      ],
      format: "JSONEachRow",
    });
  }

  async getLeaderboard(limit: number) {
    const res = await this.clickhouseService.query({
      query: `
        SELECT * FROM default.leaderboard_mv ORDER BY totalPoints DESC LIMIT ${limit};
      `,
      format: "JSONEachRow",
    });

    const data = await res.json();

    return data;
  }

  async getClickFromCouchDb(eventId: string) {
    try {
      await this.couchdbService.get("clicksly", eventId);

      return true;
    } catch (error: any) {
      if (error.statusCode === 404) {
        logger.debug(`Click ${eventId} not found in CouchDB (not a duplicate)`);

        return false;
      }

      logger.error({ eventId, error }, "Error checking CouchDB for duplicate click");

      throw error;
    }
  }

  async insertClickToCouchDb(document: any) {
    return this.couchdbService.insert("clicksly", document);
  }
}