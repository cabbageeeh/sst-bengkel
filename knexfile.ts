import type { Knex } from "knex";

// Update with your config settings.

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "better-sqlite3",
    connection: {
      filename: "./dev.sqlite3"
    },
    useNullAsDefault: true,
    pool: {
      afterCreate: (conn: any, cb: any) => {
        conn.pragma('foreign_keys = ON');
        cb();
      }
    }
  },

  production: {
    client: "better-sqlite3",
    connection: {
      filename: process.env.SST_DATABASE_PATH || "./production.sqlite3"
    },
    useNullAsDefault: true,
    pool: {
      afterCreate: (conn: any, cb: any) => {
        conn.pragma('foreign_keys = ON');
        cb();
      }
    }
  },
 
 

};

export default config
