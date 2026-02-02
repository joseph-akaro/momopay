# MTN MoMo NodeJS SDK

[](https://www.google.com/search?q=https://www.npmjs.com/package/momopay)
[](https://www.google.com/search?q=https://github.com/joseph-akaro/momopay/actions)
[](https://www.google.com/search?q=https://codecov.io/gh/joseph-akaro/momopay)
[](https://www.google.com/search?q=https://github.com/your-username/joseph-akaro/blob/main/LICENSE)

A modern, zero-dependency, fully-typed NodeJS SDK for the MTN Mobile Money (MoMo) API. This package simplifies all interactions with the MoMo API, including Collections, Disbursements, and Remittances, with a focus on great developer experience and robust error handling.

> [!WARNING]
> Package is Under development, some features may not function as expected. do not use for production.


## ✨ Features

  * **TypeScript First**: Written in TypeScript with auto-generated type definitions for superior autocompletion and type safety.
  * **Promise-based API**: Uses modern `async/await` syntax for clean, readable, and non-blocking code.
  * **Complete API Coverage**: Supports all major products: Collections, Disbursements, and Remittances.
  * **Automated Authentication**: Handles the OAuth 2.0 token generation and refresh lifecycle for you automatically.
  * **Webhook Validation**: Includes an Express.js middleware to easily and securely validate incoming webhook notifications from MTN.
  * **Robust Error Handling**: Provides custom, descriptive error classes to make debugging a breeze.
  * **Input Validation**: Validates your request data before it ever hits the MTN API, providing instant, clear feedback.

## Prerequisites

Before you start, you need to have an active MTN MoMo Developer account. You can get one from the [MTN MoMo Developer Portal](https://momodeveloperportal.mtn.com/).

You will need the following credentials from your developer portal dashboard:

  * **Primary/Secondary Subscription Keys**: For general API access.
  * **API User & API Key**: For generating your access tokens.
  * **Target Product Subscription Key**: The specific key for either Collections or Disbursements.

## 🚀 Installation

```bash
npm install momo-nodejs-sdk
```

## Quick Start: Receiving a Payment (Collections)

Here is a simple example of how to initialize the client and request a payment from a customer.

```javascript
import { MomoClient } from 'momo-nodejs-sdk';
import { v4 as uuidv4 } from 'uuid'; // Recommended for generating unique IDs

// 1. Configure your client
const client = new MomoClient({
  environment: 'sandbox', // or 'production'
  primarySubscriptionKey: 'YOUR_PRIMARY_KEY',
  secondarySubscriptionKey: 'YOUR_SECONDARY_KEY',
  apiUser: 'YOUR_GENERATED_API_USER',
  apiKey: 'YOUR_GENERATED_API_KEY',
  // Your callback URL where MTN will send transaction status updates
  callbackUrl: 'https://your-domain.com/momo-callback' 
});

// 2. Request a payment
async function requestPayment() {
  try {
    const transaction = {
      amount: '500', // Amount in UGX
      currency: 'UGX',
      externalId: uuidv4(), // A unique ID for your internal reference
      partyId: '256772123456', // Phone number to charge, with country code
      partyIdType: 'MSISDN',
      payerMessage: 'Payment for Order #123',
      payeeNote: 'Thank you for your purchase'
    };

    // The Collections product requires its own subscription key
    const collectionSubKey = 'YOUR_COLLECTIONS_SUBSCRIPTION_KEY';
    
    console.log('Requesting payment...');
    const transactionReference = await client.collections.requestToPay(transaction, collectionSubKey);

    console.log('✅ Payment request successful! Transaction Reference:', transactionReference);
    console.log('Check the customer\'s phone for a USSD push to approve.');

    // You can now poll for the status or wait for the webhook
    // For this example, we'll poll after 10 seconds
    setTimeout(async () => {
        const status = await client.collections.getTransactionStatus(transactionReference, collectionSubKey);
        console.log('Transaction Status:', status);
    }, 10000);

  } catch (error) {
    console.error('❌ Payment failed:', error.message);
    if (error.apiResponse) {
      console.error('API Response:', error.apiResponse);
    }
  }
}

requestPayment();
```

-----

## Usage & API Reference

### Collections API

Used for requesting payments from customers.

#### `getTransactionStatus(referenceId, subscriptionKey)`

Checks the status of a transaction initiated by `requestToPay`.

```javascript
const referenceId = 'e2f1b1b0-1b1b-1b1b-1b1b-1b1b1b1b1b1b'; // From requestToPay
const status = await client.collections.getTransactionStatus(referenceId, collectionSubKey);

console.log(status); 
// {
//   amount: '500',
//   currency: 'UGX',
//   status: 'SUCCESSFUL',
//   financialTransactionId: '123456789',
//   ...
// }
```

### Disbursements API

Used for sending money to customers (payouts, refunds, etc.).

#### `transfer(transferDetails, subscriptionKey)`

Initiates a transfer to a customer's MoMo account.

```javascript
const disbursementSubKey = 'YOUR_DISBURSEMENTS_SUBSCRIPTION_KEY';

const transferDetails = {
    amount: '1000',
    currency: 'UGX',
    externalId: uuidv4(),
    partyId: '256772123456',
    partyIdType: 'MSISDN',
    payerMessage: 'Your weekly payout',
    payeeNote: 'From Company Inc.'
};

const transactionReference = await client.disbursements.transfer(transferDetails, disbursementSubKey);
console.log('Transfer initiated. Reference:', transactionReference);
```

#### `getAccountBalance(subscriptionKey)`

Fetches the balance of your merchant account.

```javascript
const balance = await client.disbursements.getAccountBalance(disbursementSubKey);
console.log(`Current Balance: ${balance.availableBalance} ${balance.currency}`);
```

#### `validateAccountHolder(partyId, subscriptionKey)`

Verifies that an account holder is active and registered before sending money.

```javascript
const isValid = await client.disbursements.validateAccountHolder('256772123456', 'MSISDN', disbursementSubKey);
console.log('Is account holder valid?', isValid); // true or false
```

## Handling Webhooks with Express.js

MTN uses webhooks to notify your application of the final transaction status asynchronously. This is more reliable than polling. This SDK provides a middleware to secure your webhook endpoint.

The middleware does one critical thing: **It verifies the `X-Callback-Signature` header to ensure the request is genuinely from MTN.**

```javascript
import express from 'express';
import { MomoClient } from 'momo-nodejs-sdk';

const app = express();

// IMPORTANT: The MTN webhook does NOT send JSON. 
// You need to use the text parser to get the raw body for signature validation.
app.use(express.text({ type: 'application/json' })); // Use text parser for this route

const client = new MomoClient({
  // ... your config here
});

app.post(
  '/momo-callback', 
  client.createWebhookMiddleware(), // This middleware validates the signature
  (req, res) => {
    // If the code reaches here, the webhook is verified and authentic.
    // The raw text body is in req.body. You must parse it yourself.
    const transaction = JSON.parse(req.body);

    console.log('✅ Verified webhook received:', transaction);

    if (transaction.status === 'SUCCESSFUL') {
      // Payment was successful!
      // Update your database, provision services, send email, etc.
      // Example: db.orders.update({ externalId: transaction.externalId }, { status: 'PAID' });
    } else {
      // Payment failed or was rejected.
      // Log the failure, notify admins, etc.
    }
    
    // VERY IMPORTANT: Acknowledge receipt of the webhook with a 202 status code.
    // If you don't, MTN will keep retrying.
    res.sendStatus(202); 
  }
);

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
```

## Error Handling

The SDK throws custom errors for easier debugging. All errors extend the base `MomoError` class.

  * `MomoValidationError`: For issues with your input (e.g., invalid phone number).
  * `MomoAuthenticationError`: For issues with your API keys or subscription keys.
  * `MomoTransactionError`: For API errors returned by MTN during a transaction.

You can catch errors and inspect their properties:

```javascript
try {
  // ... your API call
} catch (error) {
  console.error(`Error: ${error.message}`);

  // Check the type of error
  if (error instanceof MomoTransactionError) {
    console.error('Status Code:', error.statusCode);
    console.error('API Response:', error.apiResponse); // The full error object from MTN
  }
}
```

## Contributing

Contributions are welcome\! Please feel free to submit a Pull Request or open an issue.

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## License

This project is licensed under the MIT License. See the [LICENSE](https://www.google.com/search?q=LICENSE) file for details.