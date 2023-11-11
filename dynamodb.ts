import {
  DeleteItemCommand,
  DynamoDBClient,
  DynamoDBClientConfig,
  GetItemCommand,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb";
import { defaults } from "./defaults";
import { SessionStore } from "./types";

interface NewClientOpts {
  /**
   * DynamoDB DynamoDBClientConfig; required.
   *
   * Remember to install the db driver `'dynamodb'`.
   *
   * */
  config: DynamoDBClientConfig;
  /** DynamoDB table name to use for sessions. Defaults to "telegraf-sessions". */
  table?: string;
  /** Called on fatal connection or setup errors */
  onInitError?: (err: unknown) => void;
}

interface ExistingClientOpts {
  /** If passed, we'll reuse this client instead of creating our own. */
  client: DynamoDBClient;
  /** DynamoDB table name to use for sessions. Defaults to "telegraf-sessions". */
  table?: string;
  /** Called on fatal connection or setup errors */
  onInitError?: (err: unknown) => void;
}

/** @unstable */
export function DynamoDB<Session>(opts: NewClientOpts): SessionStore<Session>;
export function DynamoDB<Session>(
  opts: ExistingClientOpts
): SessionStore<Session>;
export function DynamoDB<Session>(
  opts: NewClientOpts | ExistingClientOpts
): SessionStore<Session> {
  let client: DynamoDBClient;

  if ("client" in opts) client = opts.client;
  else {
    try {
      client = new DynamoDBClient(opts.config);
    } catch (error) {
      if (!opts.onInitError) {
        throw error;
      }

      opts.onInitError(error);
    }
  }

  const tableName = opts.table ?? defaults.table;

  return {
    async get(key) {
      const sessionItem = await client.send(
        new GetItemCommand({
          TableName: tableName,
          Key: {
            key: { S: key },
          },
        })
      );

      const value = sessionItem.Item?.session.S;

      return value ? JSON.parse(value) : undefined;
    },
    async set(key: string, session: Session) {
      const putItemCommand = new PutItemCommand({
        TableName: tableName,
        Item: {
          key: { S: key },
          session: {
            S: JSON.stringify(session),
          },
        },
      });

      await client.send(putItemCommand);
    },
    async delete(key: string) {
      const deleteItemCommand = new DeleteItemCommand({
        TableName: tableName,
        Key: { key: { S: key } },
      });

      await client.send(deleteItemCommand);
    },
  };
}
