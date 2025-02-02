import { describe, it, expect, beforeEach, jest, mock} from "bun:test";
import { CouchdbService } from "../../src/couchdb/couchdb.service";
import { ConfigService } from "../../src/config/config.service";
import nano from "nano";
import { logger } from "../../src/logger/logger";

mock.module("nano", () => ({
  default: jest.fn(() => ({
    auth: jest.fn(),
    use: jest.fn(() => ({
      insert: jest.fn(),
      get: jest.fn(),
    })),
  })),
}));

mock.module("../../src/logger/logger", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe("CouchdbService", () => {
  let couchdbService: CouchdbService;
  let mockNano: any;
  let mockDb: any;
  let mockConfigService: ConfigService;

  beforeEach(() => {
    mockNano = nano as unknown as jest.Mock;
    mockDb = {
      insert: jest.fn(),
      get: jest.fn(),
    };

    (mockNano as jest.Mock).mockReturnValue({
      auth: jest.fn(),
      use: jest.fn(() => mockDb),
    });

    mockConfigService = {
      get: jest.fn((key: string) => {
        const config = {
          COUCHDB_HOST: "http://localhost:5984",
          COUCHDB_USER: "admin",
          COUCHDB_PASSWORD: "admin",
        };
        return config[key as keyof typeof config];
      }),
    } as unknown as ConfigService;

    couchdbService = new CouchdbService(mockConfigService);
  });

  it("should initialize CouchDB with correct host", () => {
    expect(mockConfigService.get).toHaveBeenCalledWith("COUCHDB_HOST");
    expect(logger.info).toHaveBeenCalledWith("CouchDB service initialized with host: http://localhost:5984");
  });

  it("should authorize with CouchDB", async () => {
    await couchdbService.authorize();

    expect(mockNano().auth).toHaveBeenCalledWith("admin", "admin");
    expect(logger.info).toHaveBeenCalledWith("CouchDB service authorization finished");
  });

  it("should insert a document into CouchDB", async () => {
    const doc = { eventId: "event-123", data: "test-data" };
    mockDb.insert.mockResolvedValue({ ok: true });

    await couchdbService.insert("clicksly", doc);

    expect(mockDb.insert).toHaveBeenCalledWith({
      ...doc,
      _id: "event-123",
    });
  });

  it("should get a document from CouchDB", async () => {
    const doc = { _id: "event-123", data: "test-data" };
    mockDb.get.mockResolvedValue(doc);

    await couchdbService.get("clicksly", "event-123");

    expect(mockDb.get).toHaveBeenCalledWith("event-123");
  });
});
