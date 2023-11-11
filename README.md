# `@icntower/telegraf-session-dynamodb`

This package provides dynamodb storage adapter for Telegraf v4.12+ sessions.

## DynamoDB

Install the official DynamoDB driver alongside this module.

```shell
npm i @icntower/telegraf-session-dynamodb @aws-sdk/client-dynamodb
```

Usage:

```TS
import { DynamoDB } from "@icntower/telegraf-session-dynamodb";

const store = DynamoDB({
  config: {
    region: process.env.AWS_DEFAULT_REGEON,
    endpoint: process.env.DOCUMENT_API_ENDPOINT,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  },
});

const bot = new Telegraf(token, opts);
bot.use(session({ store }));

// the rest of your bot
```

To reuse an existing DynamoDB client, use `DynamoDB({ client })` instead.
