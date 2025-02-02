import nano from "nano";

import { ConfigService } from "../config/config.service";
import { logger } from "../logger/logger";

export class CouchdbService {
  private couchdb;

  private host;
  private user;
  private password;
  
  constructor(private readonly configService: ConfigService) {
    logger.info("CouchDB service initialization started");

    this.host = this.configService.get("COUCHDB_HOST");
    this.user = this.configService.get("COUCHDB_USER");
    this.password = this.configService.get("COUCHDB_PASSWORD");

    this.couchdb = nano(this.host);

    logger.info(`CouchDB service initialized with host: ${this.host}`);
  }

  async authorize() {
    logger.info("CouchDB service authorization started");

    await this.couchdb.auth(this.user, this.password);

    logger.info("CouchDB service authorization finished");
  }

  async insert(database: string, document: any) {
    return this.couchdb.use(database).insert({
      ...document,
      _id: document.eventId,
    });
  }

  async get(database: string, id: string) {
    return this.couchdb.use(database).get(id);
  }
}