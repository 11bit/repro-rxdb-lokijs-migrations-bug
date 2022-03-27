import { createRxDatabase, addRxPlugin } from "rxdb";
import { getLokiDatabase, getRxStorageLoki } from "rxdb/plugins/lokijs";
import { RxDBMigrationPlugin } from "rxdb/plugins/migration";

addRxPlugin(RxDBMigrationPlugin);
const LokiIncrementalIndexedDBAdapter = require("lokijs/src/incremental-indexeddb-adapter");

export async function createDb(version = 0) {
  console.log("Init db with version", version);
  const db = await createRxDatabase({
    name: "exampledb",
    storage: getRxStorageLoki({
      adapter: new LokiIncrementalIndexedDBAdapter(),
    }),
  });

  const heroes: any = {
    schema: {
      version,
      title: "test schema",
      type: "object",
      required: ["id", "name"],
      primaryKey: "id",
      properties: {
        id: {
          type: "string",
        },
        name: {
          type: "string",
        },
      },
    },
  };

  if (version === 1) {
    heroes.schema.properties.color = {
      type: "string",
    };

    heroes.migrationStrategies = {
      1: (oldDoc) => {
        oldDoc.color = "red";
        oldDoc.name += "v1";
        console.log("migrate", oldDoc);
        return oldDoc;
      },
    };
  }

  await db.addCollections({
    heroes,
  });

  const dbState = await getLokiDatabase("exampledb", {});
  window.loki = dbState.database;

  return db;
}

export function clearIdb() {
  return window.indexedDB.databases().then((r) => {
    for (var i = 0; i < r.length; i++)
      window.indexedDB.deleteDatabase(r[i].name);
  });
}
