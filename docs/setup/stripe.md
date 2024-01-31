<h1>Setting up Stripe to handle payments</h1>

- [Minimum Setup](#minimum-setup)
  - [Part 1 - Create an account](#part-1---create-an-account)
  - [Part 2 - Add environment variables to Vercel](#part-2---add-environment-variables-to-vercel)
  - [Part 3 - Create a webhook](#part-3---create-a-webhook)
  - [Part 4 - Redeploy with Updated Environment Variables](#part-4---redeploy-with-updated-environment-variables)
  - [Part 5 - Create product(s)](#part-5---create-products)
- [Extras](#extras)
  - [Custom branding](#custom-branding)
  - [Configure the customer portal](#configure-the-customer-portal)

## Minimum Setup

In order to accept payments, you'll need to go through these steps to configure Stripe in the Translation app.

### Part 1 - Create an account

1. Create a [Stripe](https://stripe.com/) account if you don't have one yet

### Part 2 - Add environment variables to Vercel

1. From the Stripe Dashboard, navigate to the Developers page by clicking `Developers` at the top of the screen
2. Click the `API keys` tab and find the `Publishable key` and `Secret key`
3. Navigate to your `Vercel` deployment and click the `Settings` tab.
4. Click the `Environment Variables` option in the side bar.
5. Add the `Publishable key` as the `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` environment variable in your Vercel settings and make sure your project redeploys.
6. Add the `Secret key` as the `STRIPE_SECRET_KEY` environment variable in your Vercel settings and make sure your project redeploys.
7. Redeploy your project


  
### Part 3 - Create a webhook

1. Head back to the [Stripe Dashboard](https://dashboard.stripe.com/dashboard) and ensure you are in ["Test Mode"](https://stripe.com/docs/testing) by toggling the `Test Mode` switch at the top of the dashboard to the `ON` position.
2. In Stripe's `Developers` section, navigate to the [Webhooks](https://dashboard.stripe.com/test/webhooks) tab and click `Add endpoint`
3. Under `Endpoint URL` enter your deployment URL with `/api/webhooks` appended to the end (e.g., `https://your-deployment-url.vercel.app/api/webhooks`).
4. Under `Select events to listen to` choose `Select events`, toggle on `Select all events` and then click `Add events`
5. Scroll to the bottom of the form and select `Add endpoint`
6. In the page that appears, under `Signing secret` click `reveal` and copy the secret.

### Part 4 - Redeploy with Updated Environment Variables

Add the `Signing secret` from part 3 as the `STRIPE_WEBHOOK_SECRET` environment variable in your Vercel settings and make sure your project redeploys.

### Part 5 - Create product(s)

With the Stripe webhook setup, you can start creating your products in the [Stripe Dashboard](https://dashboard.stripe.com/test/products). Stripe Checkout supports billing a set amount at regular intervals. It does not support complex pricing structures like tiered pricing or per-seat billing.

<!-- TODO @Noah: Lay out instructions on how to create the first product that can add a bare-minimum monetization loop to the starter project. -->


## Extras 

This section is completely optional, but can be used to make your app feel more official, and add some convenience for your users.

### Custom branding

You can **optionally ** set up custom branding in the [branding settings](https://dashboard.stripe.com/settings/branding) page to give your app a more white-labeled feeling.

### Configure the customer portal

The Stripe customer portal can give your users a way to manage their billing without you having to build and maintain any pages. Click here to setup the [Customer Portal](https://dashboard.stripe.com/test/settings/billing/portal).