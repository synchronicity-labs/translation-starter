<h1>Setting up Stripe to handle payments</h1>

- [Minimum Setup](#minimum-setup)
  - [Part 1 - Create an account](#part-1---create-an-account)
  - [Part 2 - Create a webhook](#part-2---create-a-webhook)
  - [Part 3 - Redeploy with Updated Environment Variables](#part-3---redeploy-with-updated-environment-variables)
  - [Part 4 - Create product(s)](#part-4---create-products)
- [Extras](#extras)
  - [Custom branding](#custom-branding)
  - [Configure the customer portal](#configure-the-customer-portal)

## Minimum Setup

In order to accept payments, you'll need to go through these steps to configure Stripe and the Translation app.

### Part 1 - Create an account

1. Create a [Stripe](https://stripe.com/) account if you don't have one yet
2. Ensure you are in ["Test Mode"](https://stripe.com/docs/testing) by toggling the `Test Mode` switch at the top of the dashboard to the `ON` position.
  
### Part 2 - Create a webhook

1. In Stripe's `Developers` section, navigate to the [Webhooks](https://dashboard.stripe.com/test/webhooks) tab and click `Add endpoint`
2. Under `Endpoint URL` enter your deployment URL with `/api/webhooks` appended to the end (e.g., `https://your-deployment-url.vercel.app/api/webhooks`).
3. Under `Select events to listen to` choose `Select events`, toggle on `Select all events` and then click `Add events`
4. Scroll to the bottom of the form and select `Add endpoint`
5. In the page that appears, under `Signing secret` click `reveal` and copy the secret.

### Part 3 - Redeploy with Updated Environment Variables

Add the `Signing secret` from step 5 as the `STRIPE_WEBHOOK_SECRET` environment variable in your Vercel settings and make sure your project redeploys.

### Part 4 - Create product(s)

With the Stripe webhook setup, you can start creating your products in the [Stripe Dashboard](https://dashboard.stripe.com/test/products). Stripe Checkout supports billing a set amount at regular intervals. It does not support complex pricing structures like tiered pricing or per-seat billing.

<!-- TODO @Noah: Lay out instructions on how to create the first product that can add a bare-minimum monetization loop to the starter project. -->


## Extras 

This section is completely optional, but can be used to make your app feel more official, and add some convenience for your users.

### Custom branding

You can **optionally ** set up custom branding in the [branding settings](https://dashboard.stripe.com/settings/branding) page to give your app a more white-labeled feeling.

### Configure the customer portal

The Stripe customer portal can give your users a way to manage their billing without you having to build and maintain any pages. Click here to setup the [Customer Portal](https://dashboard.stripe.com/test/settings/billing/portal).