import { CompressionTypes, Kafka, logLevel as KafkaLogLevel } from "kafkajs";
import { ConfigService } from "../config/config.service";

import { logger } from "../logger/logger";
import { ClickRepository } from "../click/click.repository";

export class KafkaService {
  private kafka;
  private producer;
  private consumer;

  constructor(
    private readonly configService: ConfigService,
    private readonly clickRepository: ClickRepository,
  ) {
    this.kafka = new Kafka({
      clientId: "clicks-ly",
      brokers: this.configService.get("KAFKA_BROKERS").split(","),
      logLevel: KafkaLogLevel.INFO,
      logCreator: (_) => ({ namespace, level, label, log }) => {
        switch (level) {
          case KafkaLogLevel.ERROR:
            logger.error({ component: namespace, ...log }, log.message);
            break;
          case KafkaLogLevel.WARN:
            logger.warn({ component: namespace, ...log }, log.message);
            break;
          case KafkaLogLevel.INFO:
            logger.info({ component: namespace, ...log }, log.message);
            break;
          case KafkaLogLevel.DEBUG:
            logger.debug({ component: namespace, ...log }, log.message);
            break;
          default:
            logger.trace({ component: namespace, ...log }, log.message);
        }
    }
    });

    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: "clicks-ly-consumer" });
  }

  async connect() {
    await this.producer.connect();
  }

  async produce(topic: string, message: Record<string, any>) {
    await this.producer.send({
      topic,
      messages: [
        {
          key: message.userId,
          value: JSON.stringify({ ...message }),
        }
      ],
      acks: -1,
      compression: CompressionTypes.GZIP,
    });
  }

  async consumeFromClicks() {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: "clicks", fromBeginning: true });

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        if (!message.value) {
          logger.warn("Empty message received");

          return;
        }

        const {
          eventId,
          userId,
          points
        } = JSON.parse(message.value.toString());

        try {
          const exists = await this.clickRepository.getClickFromCouchDb(eventId);

          if (exists) {
            logger.warn(`Duplicate click with eventId ${eventId}`);

            return;
          }

          await this.clickRepository.insert(userId, points, eventId);

          await this.clickRepository.insertClickToCouchDb({ eventId });

          await this.consumer.commitOffsets([{ topic, partition, offset: message.offset }]);

          logger.info({ eventId, userId, points }, "Click processed successfully");
        } catch (error) {
          logger.error({ eventId, userId, points }, "Error processing click");
          logger.error(error)
        }
      },
    });
  }
}