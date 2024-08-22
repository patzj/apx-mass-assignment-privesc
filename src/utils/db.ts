import { MongoClient, ServerApiVersion } from "mongodb";
import { User } from "../models/user";

const host = process.env.MONGO_HOST ?? "localhost";
const port = process.env.MONGO_PORT ?? "27017";
const uri = `mongodb://${host}:${port}/`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export async function initialize() {
  await client.connect();
  const dbo = client.db("demo");
  await dbo.collection("users").drop();
  await dbo.collection("users").insertOne({
    username: "john",
    password: "ripper",
    name: "John Doe",
    age: 24,
    role: "standard",
  });
  await client.close();
}

export async function loginUser(
  username: string,
  password: string
): Promise<Pick<User, "username" | "role"> | null> {
  await client.connect();
  const dbo = client.db("demo");
  const document = await dbo.collection("users").findOne({
    username,
    password,
  });

  let user: Pick<User, "username" | "role"> | null = null;
  if (document !== null) {
    user = {
      username: document["username"],
      role: document["role"],
    };
  }

  await client.close();
  return user;
}

export async function fetchUser(
  username: string
): Promise<Omit<User, "password"> | null> {
  await client.connect();
  const dbo = client.db("demo");
  const document = await dbo.collection("users").findOne({
    username,
  });

  let user: Omit<User, "password"> | null = null;
  if (document !== null) {
    user = {
      username: document["username"],
      name: document["name"],
      age: document["age"],
      role: document["role"],
    };
  }

  await client.close();
  return user;
}

export async function updateUser(
  username: string,
  updates: Pick<User, "name" | "age">
): Promise<void> {
  await client.connect();
  const dbo = client.db("demo");
  await dbo.collection("users").updateOne({ username }, { $set: updates });
  await client.close();
}
