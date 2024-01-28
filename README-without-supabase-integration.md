# Translation AI by [Sync Labs](https://synclabs.so)

Translation AI is an open-source tool for translating spoken language in video content with accurate lip synchronization. The purpose of this repo is to help developers quickly integrate multilingual support into video-based apps. This project provides essential APIs and documentation to facilitate the development of applications requiring video translation with lip-sync capabilities.
<!-- 
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsynchronicity-labs%2Ftranslation-starter&env=SYNC_LABS_API_KEY,OPENAI_API_KEY,GLADIA_API_KEY,ELEVEN_LABS_API_KEY,NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,STRIPE_SECRET_KEY&envDescription=API%20Keys%20and%20other%20environement%20variables%20required%20for%20this%20app%20to%20function%20correctly.&envLink=https%3A%2F%2Fgithub.com%2Fsynchronicity-labs%2Ftranslation-starter%231-initiate-deployment&project-name=translation-starter&repository-name=translation-starter&integration-ids=oac_VqOgBHqhEoFTPzGkPd7L0iH6&external-id=https%3A%2F%2Fgithub.com%2Fsynchronicity-labs%2Ftranslation-starter%2Ftree%2Fmain) -->

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsynchronicity-labs%2Ftranslation-starter&env=SYNC_LABS_API_KEY,GLADIA_API_KEY,ELEVEN_LABS_API_KEY,NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,STRIPE_SECRET_KEY,NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY&envDescription=API%20Keys%20and%20other%20environement%20variables%20required%20for%20this%20app%20to%20function%20correctly.&envLink=https%3A%2F%2Fgithub.com%2Fsynchronicity-labs%2Ftranslation-starter%231-initiate-deployment&project-name=translation-starter&repository-name=translation-starter&external-id=https%3A%2F%2Fgithub.com%2Fsynchronicity-labs%2Ftranslation-starter%2Ftree%2Fmain)

## How it works

- [Sync Labs](https://synclabs.so) for perfectly synchronized lip movements
- [Gladia](https://www.gladia.io/) for transcribing and translating
- [Eleven Labs](https://elevenlabs.io/) for voice cloning and speech synthesis
- [Next.js](https://nextjs.org) for web app
- [Vercel](https://vercel.com) for deployment
- [Supabase](https://supabase.io) for db, auth and storage
- [Stripe](https://stripe.com) for billing

### [Live demo](https://translation-starter-khaki.vercel.app/)

[![Screenshot of demo](./public/demo.png)](https://translate.synclabs.so/)

## Getting set up

To successfully deploy the template, execute the following steps in order:

<!-- ### 1. Initiate Deployment -->

<!-- [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsynchronicity-labs%2Ftranslation-starter&env=SYNC_LABS_API_KEY,OPENAI_API_KEY,GLADIA_API_KEY,ELEVEN_LABS_API_KEY,NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,STRIPE_SECRET_KEY&envDescription=API%20Keys%20and%20other%20environement%20variables%20required%20for%20this%20app%20to%20function%20correctly.&envLink=https%3A%2F%2Fgithub.com%2Fsynchronicity-labs%2Ftranslation-starter%231-initiate-deployment&project-name=translation-starter&repository-name=translation-starter&integration-ids=oac_VqOgBHqhEoFTPzGkPd7L0iH6&external-id=https%3A%2F%2Fgithub.com%2Fsynchronicity-labs%2Ftranslation-starter%2Ftree%2Fmain) -->

<!-- [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsynchronicity-labs%2Ftranslation-starter&env=SYNC_LABS_API_KEY,GLADIA_API_KEY,ELEVEN_LABS_API_KEY,NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,STRIPE_SECRET_KEY&envDescription=API%20Keys%20and%20other%20environement%20variables%20required%20for%20this%20app%20to%20function%20correctly.&envLink=https%3A%2F%2Fgithub.com%2Fsynchronicity-labs%2Ftranslation-starter%231-initiate-deployment&project-name=translation-starter&repository-name=translation-starter&external-id=https%3A%2F%2Fgithub.com%2Fsynchronicity-labs%2Ftranslation-starter%2Ftree%2Fmain) -->

<!-- 

2. Add Integrations

    The [Supabase Vercel Deploy Integration](https://vercel.com/integrations/supabase-v2) handles configuration of environment variables and initiates the [SQL migrations](./supabase/migrations/20230530034630_init.sql) to construct your database schema. You can view the resulting tables in your project's [Table editor](https://app.supabase.com/project/_/editor).

    - Click `Add` in the Supabase integration and fill out the form that pops up.

3. Configure Project

    Enter the environment variables required for this project. Below are links to documentation on how to obtain an API key for each of the required services to ensure full functionality.

    - [Sync Labs API Key](https://docs.synclabs.so/authentication)
    - [Open AI](https://platform.openai.com/docs/api-reference/authentication)
    - [Gladia](https://docs.gladia.io/reference/overview#getting-your-api-key)
    - [Eleven Labs](https://elevenlabs.io/docs/api-reference/authentication)
    - [Stripe](https://stripe.com/docs/api/authentication) -->
### 1. Initiate Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsynchronicity-labs%2Ftranslation-starter&env=SYNC_LABS_API_KEY,GLADIA_API_KEY,ELEVEN_LABS_API_KEY,NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,STRIPE_SECRET_KEY,NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY&envDescription=API%20Keys%20and%20other%20environement%20variables%20required%20for%20this%20app%20to%20function%20correctly.&envLink=https%3A%2F%2Fgithub.com%2Fsynchronicity-labs%2Ftranslation-starter%231-initiate-deployment&project-name=translation-starter&repository-name=translation-starter&external-id=https%3A%2F%2Fgithub.com%2Fsynchronicity-labs%2Ftranslation-starter%2Ftree%2Fmain)

Clicking the Deploy button will open up a browser tab with instructions on generating a new GitHub repository from this template and deploying it to Vercel.

1. Create Git Repository

    - Under `Git Scope` select the account you'd like to deploy the repo to.
    - Under `Repository Name` give your new repo a name.
  
2. Configure Project

    Next we need to enter the environment variables we'll need for the app to function. In order to do this, we'll need to create a new Supabase project, and accounts for all the third party tools we'll be using:

    1. Head over to [Supabase](https://supabase.com/) and either create an account or sign in
   
    2. Once you are in your Supabase account, click the `New project` button and choose the organization you want this project to live under.
   
    3. Enter details for your project and click `Create new project`.

    4. Once your project is done initializing, find the environment variables we'll need to set and fill them in the `Configure Project` section of the Vercel Deployment:

      - NEXT_PUBLIC_SUPABASE_URL
      - NEXT_PUBLIC_SUPABASE_ANON_KEY
      - SUPABASE_SERVICE_ROLE_KEY

    5. Create accounts with all third party tools, and aquire API keys.

        Below are guides on how to get API keys for all the third party tools we'll be using. Once you get your API keys, come back to the `Vercel Deployment` and enter them in the remaining fields within the `Configure Project` section.

         - [Sync Labs API Key](https://docs.synclabs.so/authentication)
         - [Open AI](https://platform.openai.com/docs/api-reference/authentication)
         - [Gladia](https://docs.gladia.io/reference/overview#getting-your-api-key)
         - [Eleven Labs](https://elevenlabs.io/docs/api-reference/authentication)
         - [Stripe](https://stripe.com/docs/api/authentication)

    6. Click `Deploy` and wait for your project to deploy to Vercel

### 2. Configure Auth

You'll need to configure your Supabase project's site URL and Vercel's `NEXT_PUBLIC_SITE_URL` environment variable to secure and streamline authentication.

1. In your Supabase project, navigate to `Authentication` > [URL configuration](https://app.supabase.com/project/_/auth/url-configuration) and enter your production URL (for example, https://your-deployment-url.vercel.app) as the site URL.

2. In Vercel, under your project's deployment settings, create a new Production environment variable called `NEXT_PUBLIC_SITE_URL` and set it to your production URL. Make sure you uncheck the options for preview and development environments to maintain the correct operation for preview branches and local development.

### 3. Configure Storage

After that, you'll need to create a new storage bucket within your Supabase project to store video and audio files.

1. In your Supabase project, navigate to `Storage` and click the `New bucket` button.
   
2. Enter `translation` as the name for your new bucket and toggle `Public bucket` to on.

3. Click `Save`

4. Still in the `Storage` section of your Supabase project, click `Policies` and add the below policy:

  - Within the section called `translation` (the name of your bucket) click `New policy` then `For full costumization` and fill it in as shown below:

    [![Screenshot of translation storage bucket policy](./public/supabase-translation-bucket-policy.png)](https://translation-phi.vercel.app/)

  - Within the section called `Other policies under storage.objects` add the following three policies:

    [![Screenshot of storage bucket insert policy](./public/supabase-storage-insert-policy.png)](https://translation-phi.vercel.app/)

    [![Screenshot of storage bucket select policy](./public/supabase-storage-select-policy.png)](https://translation-phi.vercel.app/)

    [![Screenshot of storage bucket update policy](./public/supabase-storage-update-policy.png)](https://translation-phi.vercel.app/)

### 4. Run migration file to set up tables and permissions in Supabase

1. Head to your new Github repo and find the migrations file (supabase > migrations > 20230530034630_init.sql)
  
2. Copy the contents of the migrations file and head back to Supabase.

3. From your projects home page, navigate to the `SQL Editor` and paste in the contents of the migrations file.

### 5. Configure Stripe

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

Note - When creating products in Stripe, make sure you add a key/value pair with a key of `credits` and a value equal to the credit allowance for this product.


#### Configure the customer portal

- Set up branding in the [Branding settings](https://dashboard.stripe.com/settings/branding)
- Set up the customer portal in the [Customer Portal settings](https://dashboard.stripe.com/test/settings/billing/portal)


### 6. (Optional) Set up Github as a OAuth provider in Supabase

### 7. (Optional) Set up Upload from Youtube

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