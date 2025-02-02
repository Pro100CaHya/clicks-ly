import { describe, it, expect, beforeEach, jest, mock, afterAll } from "bun:test";
import { ClickRepository } from "../../src/click/click.repository";
import { ClickhouseService } from "../../src/clickhouse/clickhouse.service";
import { CouchdbService } from "../../src/couchdb/couchdb.service";
import { logger } from "../../src/logger/logger";

mock.module("../../src/logger/logger", () => ({
  logger: {
    debug: jest.fn(),
    error: jest.fn(),
  },
}));

describe("ClickRepository", () => {
  let clickRepository: ClickRepository;
  let mockClickhouseService: ClickhouseService;
  let mockCouchdbService: CouchdbService;

  beforeEach(() => {
    mockClickhouseService = {
      insert: jest.fn(),
      query: jest.fn(),
    } as unknown as ClickhouseService;

    mockCouchdbService = {
      get: jest.fn(),
      insert: jest.fn(),
    } as unknown as CouchdbService;

    clickRepository = new ClickRepository(mockClickhouseService, mockCouchdbService);
  });

  afterAll(() => jest.clearAllMocks());

  it("should insert a click into ClickHouse", async () => {
    await clickRepository.insert("user-1", 10, "event-1");

    expect(mockClickhouseService.insert).toHaveBeenCalledWith({
      table: "clicks",
      values: [{ userId: "user-1", points: 10, eventId: "event-1" }],
      format: "JSONEachRow",
    });
  });

  it("should get leaderboard from ClickHouse", async () => {
    const leaderboardData = [
      { userId: "user1", totalPoints: 100 },
      { userId: "user2", totalPoints: 90 },
    ];

    (mockClickhouseService.query as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValueOnce(leaderboardData),
    });

    const result = await clickRepository.getLeaderboard(5);

    expect(mockClickhouseService.query).toHaveBeenCalledWith({
      query: `
        SELECT * FROM default.leaderboard_mv ORDER BY totalPoints DESC LIMIT 5;
      `,
      format: "JSONEachRow",
    });

    expect(result).toEqual(leaderboardData);
  });

  it("should detect existing click in CouchDB", async () => {
    (mockCouchdbService.get as jest.Mock).mockResolvedValue({ _id: "event-1" });

    const result = await clickRepository.getClickFromCouchDb("event-1");

    expect(result).toBe(true);
  });

  it("should return false if click does not exist in CouchDB", async () => {
    (mockCouchdbService.get as jest.Mock).mockRejectedValue({ statusCode: 404 });

    const result = await clickRepository.getClickFromCouchDb("event-1");

    expect(result).toBe(false);
    expect(logger.debug).toHaveBeenCalledWith("Click event-1 not found in CouchDB (not a duplicate)");
  });

  it("should insert a click into CouchDB", async () => {
    await clickRepository.insertClickToCouchDb({ eventId: "event-1" });

    expect(mockCouchdbService.insert).toHaveBeenCalledWith("clicksly", { eventId: "event-1" });
  });
});
