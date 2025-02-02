import { v4 } from "uuid";

import { KafkaService } from "../kafka/kafka.service";
import { ClickRepository } from "./click.repository";

export class ClickService {
  constructor(
    private readonly clickRepository: ClickRepository,
    private readonly kafkaService: KafkaService,
  ) {}

  async insertClick(userId: string, points: number) {
    const eventId = v4();

    await this.kafkaService.produce("clicks", { userId, points, eventId });

    return eventId;
  }

  async getLeaderboard(limit: number) {
    return this.clickRepository.getLeaderboard(limit);
  }
}