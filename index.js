import {v4 as uuidv4} from "uuid"
import dotenv from "dotenv"

import { Provisioning } from "./utils/sandboxUserProvisioning.js";

dotenv.config()

const userId  = process.env.UUID
const subscriptionKey = process.env.SANDBOX_SECONDARY_KEY
const requestUrl = process.env.SANDBOX_URL
const webhookUrl = process.env.WEBHOOK_URL

const newUser = new Provisioning(userId, subscriptionKey, requestUrl, webhookUrl)

const createUser = newUser.apiUser()

console.log(createUser)

console.log("============= Credentials ============")
console.log(userId)
console.log(subscriptionKey)
console.log(webhookUrl)