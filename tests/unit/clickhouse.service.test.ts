import { describe, it, expect, beforeEach, mock, jest } from "bun:test";
import { ClickhouseService } from "../../src/clickhouse/clickhouse.service";
import { ConfigService } from "../../src/config/config.service";
import { createClient } from "@clickhouse/client";

mock.module("@clickhouse/client", () => ({
  createClient: jest.fn(() => ({
    query: jest.fn(),
    insert: jest.fn(),
  })),
}));

describe("ClickhouseService", () => {
  let clickhouseService: ClickhouseService;
  let mockClient: any;
  let mockConfigService: ConfigService;

  beforeEach(() => {
    mockClient = {
      query: jest.fn(),
      insert: jest.fn(),
    };

    (createClient as jest.Mock).mockReturnValue(mockClient);

    mockConfigService = {
      get: jest.fn().mockReturnValue("http://localhost:8123"),
    } as unknown as ConfigService;

    clickhouseService = new ClickhouseService(mockConfigService);
  });

  it("should execute a query", async () => {
    const queryParams = { query: "SELECT * FROM clicks" };
    mockClient.query.mockResolvedValue({ data: [{ userId: "test", points: 10 }] });

    const result = await clickhouseService.query(queryParams);

    expect(mockClient.query).toHaveBeenCalledWith(queryParams);
  });

  it("should insert data", async () => {
    const insertParams = { table: "clicks", values: [{ userId: "test", points: 10 }] };
    mockClient.insert.mockResolvedValue({ success: true });

    const result = await clickhouseService.insert(insertParams);

    expect(mockClient.insert).toHaveBeenCalledWith(insertParams);
  });

  it("should use ConfigService to get ClickHouse URL", () => {
    expect(mockConfigService.get).toHaveBeenCalledWith("CLICKHOUSE_URL");
  });
});
