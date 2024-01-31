<h1>Setting up Github as an OAuth Provider</h1>

- [Part 1 - Create an OAuth App in your Github account](#part-1---create-an-oauth-app-in-your-github-account)
- [Part 2 - Add Github as  Provider in Supabase](#part-2---add-github-as--provider-in-supabase)

### Part 1 - Create an OAuth App in your Github account

1. Navigate to your profile settings and click the `Developer settings` option at the bottom of the left side bar.
2. Go to the `OAuth Apps` tab and click on `New OAuth App`
3. Fill out the `Register a new OAuth application` form and click `Register application`
4. In the screen that appears, find the `Client secrets` section and click on `Generate a new client secret`
   - This will generate a new `Client secret` that you can use for setting up  Github as a provider in Supabase. You'll need this `Client secret` and the `Client ID` for the next step

### Part 2 - Add Github as  Provider in Supabase

1. From the home screen of your Supabase project, navigate to the `Authentication` tab and click `Providers` from the `Configuration` section
2. Find `GitHub` from the list of providers and click on it to open the dropdown list.
3. Add the `Client ID` and `Client Secret` generated when creating the OAuth App in Github and click Save.
