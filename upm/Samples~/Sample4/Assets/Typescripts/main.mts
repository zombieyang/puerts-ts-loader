import { OpenAI } from 'langchain/llms/openai'
import { Database } from 'sqlite3'

console.log(OpenAI)
console.log(Database)
const db = new Database(":memory:")
console.log(db);