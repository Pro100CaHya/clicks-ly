import pino from "pino";
import { ConfigService } from "../config/config.service";

const configService = new ConfigService();

export const logger = pino({
  level: configService.get("LOG_LEVEL") || "debug",
  transport: {
    target: "pino-pretty",
    options: { colorize: true }
  },
  formatters: {
    level(label) {
      return { level: label };
    }
  },
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
});