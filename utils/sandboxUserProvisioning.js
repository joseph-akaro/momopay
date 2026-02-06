// Class to provision Sandbox User and API Key
import axios from "axios"

export class Provisioning{
    constructor(userId, secondaryKey, requestUrl, webhookUrl){
        this.userId = userId,
        this.secondaryKey = secondaryKey
        this.requestUrl = requestUrl
        this.webhookUrl = webhookUrl
    }

    // TODO: Create API user API
    async apiUser(){
        try{

            // Get Webhook Url from this website (https://webhook.site/)
            const body = {
                 "providerCallbackHost": this.webhookUrl
            }

            const header = {
                "X-Reference-Id": this.userId,
                "Content-Type": "application/json",
                "Cache-Control": "no-cache",
                "Ocp-Apim-Subscription-Key": this.secondaryKey
            }

            const createUser = await axios(this.requestUrl, {
                method: "POST",
                headers: header,
                body : JSON.stringify(body)
            })

            console.log(createUser)

        }catch(err){
            console.log(err)
        }
    }

    // TODO: Create API user
    async apiKey(){
        try {

        } catch (error) {
            throw new Error("Error:", error)
        }
    }
    
    // TODO: Generate Access Token
    async token(){
        try {
            
        } catch (error) {
            throw new Error("Error:", error)
        }
    }
}