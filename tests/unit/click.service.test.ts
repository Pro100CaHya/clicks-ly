import { describe, it, expect, beforeEach, jest, mock, afterAll } from "bun:test";
import { ClickService } from "../../src/click/click.service";
import { ClickRepository } from "../../src/click/click.repository";
import { KafkaService } from "../../src/kafka/kafka.service";

mock.module("uuid", () => ({
  v4: () => "mocked-event-id",
}));

describe("ClickService", () => {
  let clickService: ClickService;
  let mockClickRepository: ClickRepository;
  let mockKafkaService: KafkaService;

  beforeEach(() => {
    mockClickRepository = {
      getLeaderboard: jest.fn(),
    } as unknown as ClickRepository;

    mockKafkaService = {
      produce: jest.fn(),
    } as unknown as KafkaService;

    clickService = new ClickService(mockClickRepository, mockKafkaService);
  });

  afterAll(() => jest.clearAllMocks());

  it("should send a click event to Kafka and return eventId", async () => {
    const userId = "test-user";
    const points = 10;

    const eventId = await clickService.insertClick(userId, points);

    expect(mockKafkaService.produce).toHaveBeenCalledWith("clicks", {
      userId,
      points,
      eventId: "mocked-event-id",
    });

    expect(eventId).toBe("mocked-event-id");
  });

  it("should get leaderboard from ClickRepository", async () => {
    const leaderboardData = [
      { userId: "user1", totalPoints: 100 },
      { userId: "user2", totalPoints: 90 },
    ];

    (mockClickRepository.getLeaderboard as jest.Mock).mockResolvedValue(leaderboardData);

    const result = await clickService.getLeaderboard(5);

    expect(mockClickRepository.getLeaderboard).toHaveBeenCalledWith(5);

    expect(result).toEqual(leaderboardData);
  });
});
