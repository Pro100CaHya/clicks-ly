import { Elysia } from "elysia";
import { KafkaService } from "./kafka/kafka.service";
import { ConfigService } from "./config/config.service";
import { CouchdbService } from "./couchdb/couchdb.service";
import { ClickhouseService } from "./clickhouse/clickhouse.service";
import { ClickRepository } from "./click/click.repository";
import { ClickService } from "./click/click.service";
import { ClickController } from "./click/click.controller";
import { logger } from "./logger/logger";
import swagger from "@elysiajs/swagger";

export const startApp = async () => {
    const configService = new ConfigService();
  
    const couchdbService = new CouchdbService(configService)
  
    await couchdbService.authorize();
  
    const clickhouseService = new ClickhouseService(configService);
  
    const clickRepository = new ClickRepository(clickhouseService, couchdbService);
  
    const kafkaService = new KafkaService(configService, clickRepository);
    
    await kafkaService.connect();
    await kafkaService.consumeFromClicks();
  
    const clickService = new ClickService(clickRepository, kafkaService);
    const clickController = ClickController(clickService);
  
    const app = new Elysia()
      .use(swagger({
        documentation: {
          info: {
            title: "Clicksly API Documentation",
            version: "1.0.0",
          }
        }
      }))
      .use(clickController)
      .listen(configService.get("PORT"));
    
    logger.info(
      `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
    );
}