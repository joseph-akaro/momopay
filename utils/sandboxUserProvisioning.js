// Class to provision Sandbox User and API Key
import axios from "axios"
import { v4 as uuidv4 } from "uuid"

export class Provisioning{
    constructor(userId, subscriptionKey, baseUrl, callbackUrl, targetEnvironment){
        this.userId = userId,
        this.subscriptionKey = subscriptionKey
        this.baseUrl = baseUrl
        this.callbackUrl = callbackUrl
        this.targetEnvironment = targetEnvironment
    }

    // TODO: Create API user API
    async apiUser(){
        try{

            // Get Callback Url from this website (https://webhook.site/)
            const body = {
                    "providerCallbackHost": this.callbackUrl,
                    "targetEnvironment": this.targetEnvironment
            }

            const header = {
                "X-Reference-Id": this.userId,
                "Content-Type" : "application/json",
                "Ocp-Apim-Subscription-Key": this.subscriptionKey
            }

            const createUser = await axios({
                method: "POST",
                url: `${this.baseUrl}/v1_0/apiuser`,
                headers: header,
            })

            console.log(createUser)

        }catch(err){
            if(err.status == 404)
                console.log(`${err.status}: Not found, reference id not found or closed in sandbox`)
            else if (err.status == 400)
                console.log(`${err.status}: Bad request, e.g. invalid data was sent in the request.`)
            else if (err.status == 500)
                console.log(`${err.status}: Internal error. Check log for information.`)
            else
                console.log("Something when worning!")
        }
    }

    // TODO: Create API Key
    async apiKey(){
        try {

            const apiKey = await axios({
                method: 'POST',
                url: `${this.baseUrl}/v1_0/apiuser/${this.userId}/apikey`,
                headers: {
                    "Content-Type" : "application/json",
                    "Ocp-Apim-Subscription-Key": this.subscriptionKey
                }
            })

            return apiKey.data.apiKey

        } catch (error) {
            console.log(error.message)
        }
    }
    
    // TODO: Generate Access Token
    async token(){
        try {
            // Assign API from the value generate in apiKey Method (function)
            const apiKey = await this.apiKey()

            const header = {
                    "Content-Type" : "application/json",
                    "Ocp-Apim-Subscription-Key": this.subscriptionKey
                }

            const token = await axios({
                method: 'POST',
                url: `${this.baseUrl}/collection/token/`,
                auth: {
                    username: this.userId,
                    password: apiKey
                },
                headers: header
            })

            console.log(token.data.access_token)
            
        } catch (error) {
            throw new Error("Error:", error)
        }
    }
}