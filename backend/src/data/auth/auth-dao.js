/**
 * This file contains a dummy DAO for the "Messages" database. You should
 * create your own DAOs for your project, and get rid of this one.
 */

import { getDatabase } from "./database.js";

export async function getMessages() {
  const db = await getDatabase();
  const messages = await db.all("SELECT * FROM 表名");
  return messages;
}
