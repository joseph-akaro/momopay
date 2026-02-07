import dotenv from "dotenv"

import { Provisioning } from "./utils/sandboxUserProvisioning.js";

dotenv.config()

const userId  = process.env.UUID
const subscriptionKey = process.env.SANDBOX_PRIMARY_KEY
const requestUrl = process.env.BASE_URL
const webhookUrl = process.env.CALLBACK_URL
const targetEnvironment = "sandbox"

const newUser = new Provisioning(userId, subscriptionKey, requestUrl, webhookUrl, targetEnvironment)

const createUser = newUser.token()

console.log(createUser)

// console.log("============= Credentials ============")
// console.log(userId)
// console.log(requestUrl)
// console.log(subscriptionKey)
// console.log(webhookUrl)
// console.log(targetEnvironment)
// console.log("======================================")
console.log("============= FETCH OUTPUT =================")