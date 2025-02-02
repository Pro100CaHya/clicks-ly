import { createClient, QueryParams } from "@clickhouse/client";
import { ConfigService } from "../config/config.service";

export class ClickhouseService {
  private client;

  constructor(private readonly configService: ConfigService) {
    this.client = createClient({
      url: this.configService.get("CLICKHOUSE_URL"),
    });
  }

  public async query(query: QueryParams) {
    return this.client.query(query);
  }

  async insert(insert: any) {
    return this.client.insert(insert);
  }
}