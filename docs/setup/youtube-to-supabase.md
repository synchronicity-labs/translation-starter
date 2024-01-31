<h1>Setting up Lambda function for uploading YouTube videos to Supabase</h1>

- [Part 1 - Create an AWS account](#part-1---create-an-aws-account)
- [Part 2 - Create the Lambda function](#part-2---create-the-lambda-function)
- [Part 3 - Add the function URL to your environment variables in Vercel](#part-3---add-the-function-url-to-your-environment-variables-in-vercel)


### Part 1 - Create an AWS account

1. Create an [AWS](https://aws.amazon.com/) account if you don't have one yet

### Part 2 - Create the Lambda function

1. Within your AWS account, search `Lambda` in the search bar at the top of the screen and click the `Lambda` Service from the dropdown menu
2. Click `Create function`
3. Fill out the `Create function` form
     - Make sure `Author from scratch` is selected
     - Give your lambda function a name
     - Choose `Node.js 20.x` for the Runtime
     - Choose `x86_64` for the Architecture
     - Click `Create function`
4. Once the function is initialized, in the `Code` tab within the `Code source` section, click `Upload from` and select `.zip file` in the dropdown menu
5. Upload the `lambda-deployment.zip` found in the `/utils` folder of this project and click `Save`
6. Navigate to the `Configuration` tab and select `Function URL` from the side bar
7. Click `Create function URL` and press `Save` in the page that opens up.

### Part 3 - Add the function URL to your environment variables in Vercel
1. Navigate to your `Vercel` deployment and click the `Settings` tab.
2. Click the `Environment Variables` option in the side bar.
3. Add the `Function URL` as the `NEXT_PUBLIC_AWS_LAMBDA_UPLOAD_YOUTUBE_TO_SUPABASE_URL` environment variable in your Vercel settings and make sure your project redeploys.
4. Redeploy your project in Vercel
