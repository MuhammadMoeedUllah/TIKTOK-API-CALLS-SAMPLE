# SAMPLE TIKTOK API CALLS

Hello dear Reader, I have added some examples for interacting with Tiktok

- Create Ad with Business Tiktok Account provided a video to upload
- Create Ad with authorisation token form a creator's creative
- Get Video details from provided auth code of a creative
- linkTiktok Business Account and fetches auth_token (exchanges code from authorisation flow)
    - You can get the initial auth_code by visiting
    - `https://ads.tiktok.com/marketing_api/auth?app_id={YOUR_APP_ID}&state={YOUR_STATE_VARIABLES}&redirect_uri={REDIRECT_TO_YOUR_DOMAIN}`
    - MAKE SURE TO FILL THE PLACE HOLDERS IN ABOVE URL

- List all the Ad Groups
- List all the Campaigns


##### TIK TOK official documentation is not much readable and pratically not consistent with the actual behviour

Here I compile few of the tiktok api interactions and flows as described above to skip the hassel where you can. 
Enjoy coding!