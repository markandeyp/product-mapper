import DBDetails from "../models/DBDetails";
import { Connection, ConnectionConfig, Request } from "tedious";

export default class DBService {
  config: ConnectionConfig = {
    options: {
      rowCollectionOnDone: true,
      camelCaseColumns: true,
    },
    authentication: {
      type: "default",
      options: {},
    },
  };
  connection: Connection = null;

  constructor(details: DBDetails) {
    this.config.server = details.server;
    this.config.options.database = details.database;
    this.config.authentication.options.userName = details.user;
    this.config.authentication.options.password = details.password;
  }

  connect(): Promise<boolean> {
    if (this.connection == null) {
      this.connection = new Connection(this.config);
    }

    return new Promise((resolve, reject) => {
      this.connection.connect((err: Error) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  disconnect() {
    if (this.connection != null) {
      this.connection.close();
      this.connection = null;
    }
  }

  query(sql: string, type: any): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const request = new Request(sql, (err) => {
        if (err) {
          reject(err);
        }
      });

      const rows: typeof type[] = [];

      request.on("row", (cols) => {
        const row: typeof type = {};
        cols.forEach((col) => {
          if (type.hasOwnProperty(col.metadata.colName)) {
            row[col.metadata.colName] = col.value;
          }
        });

        rows.push(row);
      });

      request.on("doneProc", (_) => {
        resolve(rows);
      });

      request.on("error", (err) => {
        reject(err);
      });

      this.connection.execSql(request);
    });
  }
}
