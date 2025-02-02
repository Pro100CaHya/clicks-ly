import { cleanEnv, num, str } from "envalid";

export class ConfigService {
  private config;

  constructor() {
    this.config = cleanEnv(process.env, {
      PORT: num({ default: 3000}),
      CLICKHOUSE_URL: str({ default: "http://default:password@localhost:8123" }),
      KAFKA_BROKERS: str({ default: "localhost:9092" }),
      COUCHDB_HOST: str({ default: "http://localhost:5984" }),
      COUCHDB_USER: str({ default: "admin" }),
      COUCHDB_PASSWORD: str({ default: "admin" }),
      LOG_LEVEL: str({ default: "debug", choices: ["trace", "debug", "info", "warn", "error", "fatal"] }),
    });
  }

  public get<K extends keyof typeof this.config>(key: K): typeof this.config[K] {
    return this.config[key];
  }
}