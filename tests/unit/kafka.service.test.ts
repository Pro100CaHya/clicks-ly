import { KafkaService } from "../../src/kafka";
import { ConfigService } from "../../src/config";
import { describe, it, expect, beforeAll, spyOn } from "bun:test";
import { ClickRepository } from "../../src/click";
import { ClickhouseService } from "../../src/clickhouse";
import { CouchdbService } from "../../src/couchdb";

describe("KafkaService", () => {
  let kafkaService: KafkaService;
  let configService: ConfigService;
  let clickRepository: ClickRepository;
  let clickhouseService: ClickhouseService;
  let couchdbService: CouchdbService;

  beforeAll(() => {
    configService = new ConfigService();
    couchdbService = new CouchdbService(configService);
    clickhouseService = new ClickhouseService(configService);
    clickRepository = new ClickRepository(clickhouseService, couchdbService)
    kafkaService = new KafkaService(configService, clickRepository);
  });

  it("should send a message successfully", async () => {
    const produceMock = spyOn(kafkaService, "produce").mockResolvedValue();

    const topic = "test-topic";
    const message = { userId: "123", points: 10 };

    await kafkaService.produce(topic, message);

    expect(produceMock).toHaveBeenCalledWith(topic, message);

    produceMock.mockRestore();
  });
});
