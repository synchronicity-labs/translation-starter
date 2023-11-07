# Translation AI by [Sync Labs](https://synclabs.so)

Translation AI is an open-source tool for translating spoken language in video content with accurate lip synchronization. The purpose of this repo is to help developers quickly integrate multilingual support into video-based apps. This project provides essential APIs and documentation to facilitate the development of applications requiring video translation with lip-sync capabilities.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnozma-knows%2Ftranslation&env=SYNC_LABS_API_KEY,OPENAI_API_KEY,ELEVEN_LABS_API_KEY,NEXT_PUBLIC_S3_ACCESS_KEY,NEXT_PUBLIC_S3_SECRET_ACCESS_KEY,NEXT_PUBLIC_S3_BUCKET_NAME,NEXT_PUBLIC_S3_REGION,NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,STRIPE_SECRET_KEY&envDescription=API%20Keys%20and%20other%20environement%20variables%20required%20for%20this%20app%20to%20function%20correctly.&envLink=https%3A%2F%2Fgithub.com%2Fnozma-knows%2Ftranslation%231-initiate-deployment&project-name=translation-starter&repository-name=translation-starter&integration-ids=oac_VqOgBHqhEoFTPzGkPd7L0iH6&external-id=https%3A%2F%2Fgithub.com%2Fnozma-knows%2Ftranslation%2Ftree%2Fmain)


## How it works

- [Sync Labs](https://synclabs.so) for perfectly synchronized lip movements
- [Open AI](https://openai.com/)'s [Whisper](https://openai.com/research/whisper) for translation
- [Eleven Labs](https://elevenlabs.io/) for voice synthesis
- [AWS](https://aws.amazon.com/) S3 for file hosting
- [Next.js](https://nextjs.org) for web app
- [Vercel](https://vercel.com) for deployment
- [Supabase](https://supabase.io) for db and auth
- [Stripe](https://stripe.com) for billing


### [Live demo](https://translation-phi.vercel.app/)

[![Screenshot of demo](./public/demo.png)](https://translation-phi.vercel.app/)

## Getting set up

To successfully deploy the template, execute the following steps in order:

### 1. Initiate Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnozma-knows%2Ftranslation&env=SYNC_LABS_API_KEY,OPENAI_API_KEY,ELEVEN_LABS_API_KEY,NEXT_PUBLIC_S3_ACCESS_KEY,NEXT_PUBLIC_S3_SECRET_ACCESS_KEY,NEXT_PUBLIC_S3_BUCKET_NAME,NEXT_PUBLIC_S3_REGION,NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,STRIPE_SECRET_KEY&envDescription=API%20Keys%20and%20other%20environement%20variables%20required%20for%20this%20app%20to%20function%20correctly.&envLink=https%3A%2F%2Fgithub.com%2Fnozma-knows%2Ftranslation%231-initiate-deployment&project-name=translation-starter&repository-name=translation-starter&integration-ids=oac_VqOgBHqhEoFTPzGkPd7L0iH6&external-id=https%3A%2F%2Fgithub.com%2Fnozma-knows%2Ftranslation%2Ftree%2Fmain)

Clicking the Deploy button will open up a browser tab with instructions on generating a new GitHub repository from this template and creating a corrseponding project in Supabase for `auth` and `storage`. Below are the steps you'll walk through:

1. Create Git Repository

    - Under `Git Scope` select the account you'd like to deploy the repo to.
    - Under `Repository Name` give your new repo a name.

2. Add Integrations

    The [Supabase Vercel Deploy Integration](https://vercel.com/integrations/supabase-v2) handles configuration of environment variables and initiates the [SQL migrations](./supabase/migrations/20230530034630_init.sql) to construct your database schema. You can view the resulting tables in your project's [Table editor](https://app.supabase.com/project/_/editor).

    - Click `Add` in the Supabase integration and fill out the form that pops up.

3. Configure Project

    Enter the environment variables required for this project. Below are links to documentation on how to obtain an API key for each of the required services to ensure full functionality.

    - [Sync Labs API Key](https://docs.synclabs.so/authentication)
    - [Open AI](https://platform.openai.com/docs/api-reference/authentication)
    - [Eleven Labs](https://elevenlabs.io/docs/api-reference/authentication)
    - [Stripe](https://stripe.com/docs/api/authentication)

### 2. Configure Auth

You'll need to configure your Supabase project's site URL and Vercel's `NEXT_PUBLIC_SITE_URL` environment variable to secure and streamline authentication.

1. In your Supabase project, navigate to `auth` > [URL configuration](https://app.supabase.com/project/_/auth/url-configuration) and enter your production URL (for example, https://your-deployment-url.vercel.app) as the site URL.

2. In Vercel, under your project's deployment settings, create a new Production environment variable called `NEXT_PUBLIC_SITE_URL` and set it to your production URL. Make sure you uncheck the options for preview and development environments to maintain the correct operation for preview branches and local development.

### 3. Configure Stripe

Next, you'll need to configure [Stripe](https://stripe.com/) in order to handle test payments.

#### Initial setup

1. Create a [Stripe](https://stripe.com/) account if you don't have one yet
2. Ensure you are in ["Test Mode"](https://stripe.com/docs/testing) by toggling the `Test Mode` switch at the top of the dashboard to the `ON` position.
  
#### Create a webhook

1. In Stripe's `Developers` section, navigate to the [Webhooks](https://dashboard.stripe.com/test/webhooks) tab and click `Add endpoint`
2. Under `Endpoint URL` enter your deployment URL with `/api/webhooks` appended to the end (e.g., `https://your-deployment-url.vercel.app/api/webhooks`).
3. Under `Select events to listen to` choose `Select events`, toggle on `Select all events` and then click `Add events`
4. Scroll to the bottom of the form and select `Add endpoint`
5. In the page that appears, under `Signing secret` click `reveal` and copy the secret.
6. Add this `Signing secret` as the `STRIPE_WEBHOOK_SECRET` environment variable in your Vercel settings.

#### Redeploy with Updated Environment Variables

Redeploy your application in Vercel for the new environment variables to activate. Go to your `Vercel Dashboard`, find the `Deployments` section, and choose `Redeploy` from the overflow menu. Ensure "Use existing Build Cache" is not selected.

#### Create product(s)

With the Stripe webhook setup, you can start creating your products in the [Stripe Dashboard](https://dashboard.stripe.com/test/products). Stripe Checkout supports billing a set amount at regular intervals. It does not support complex pricing structures like tiered pricing or per-seat billing.

#### Configure the customer portal

- Set up branding in the [Branding settings](https://dashboard.stripe.com/settings/branding)
- Set up the customer portal in the [Customer Portal settings](https://dashboard.stripe.com/test/settings/billing/portal)

## Running locally

### 1. Clone your GitHub repository to your local machine 

### 2. Link your project using the `Vercel CLI`

In a terminal navigate to your project's root directory and enter the following command.

```bash
vercel login
vercel link
```

### 3. Set up local environment variables

### Setting up the env vars locally

In a terminal navigate to your project's root directory and enter the following command.

```bash
vercel env pull .env.local
```
This command will create a new `.env.local` file in your project folder.

### 4. Test webhooks using the `Stripe CLI`

- Install the [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Link](https://stripe.com/docs/stripe-cli#login-account) your Stripe account.

In a seperate terminal, run the below command to initiate local webhook forwarding

```bash
stripe listen --forward-to=localhost:3000/api/webhooks
```

Running this Stripe command will print a webhook secret (`whsec_***`), to the console. Set `STRIPE_WEBHOOK_SECRET` to this value in your `.env.local` file.

### 5. Install dependencies and run the project

In a separate terminal, navigate to your project's root directory and run the following commands to install dependencies and start the dev server

```bash
yarn
yarn dev
```

### 6. You've done it!

Open your web browser and visit http://localhost:3000 to view your application.

## How to Contribute

We embrace the collaborative spirit of the open-source community.

To suggest enhancements or submit changes:

1. Fork the repository.
2. Create a new branch from `dev` for your changes.
3. Commit your updates and push to your fork.
4. Submit a pull request back to the `dev` branch of the original repository.

Your contributions are highly appreciated!

## Resources

- Sync Labs [Slack Community](https://syncbetatesters.slack.com/ssb/redirect#/shared-invite/email)
- Sync Labs [Docs](https://docs.synclabs.so/)

## License

Translation AI is released under the [MIT License](https://choosealicense.com/licenses/mit/).
