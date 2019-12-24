# Actions on Google: Codelabs
test
These samples serve as the completed source code for
[Actions on Google codelabs](https://codelabs.developers.google.com/?cat=Assistant).
The `level1-complete` directory should be used as a reference for the
Level 1 codelab, and as a starting point for the Level 2 codelab. The
`level2-complete` directory can be used as a reference for the Level 2 
codelab, and as a starting point for the Level 3 codelab. The 
`level3-complete` directory can be used as a reference for the Level 3 codelab.

## Setup Instructions

For detailed instructions on using this code, refer to the
[Actions on Google codelabs](https://codelabs.developers.google.com/?cat=Assistant),
Level 1, 2 and 3. Below are steps to deploy the code for any directory
(i.e. `level1-complete`, `level2-complete`, or `level3-complete`).

### Steps

1. Use the [Actions on Google Console](https://console.actions.google.com) to add a new project with a name of your choosing and click *Create Project*.
1. Scroll down to the *More Options* section, and click on the *Conversational* card.
1. On the left navigation menu under *BUILD*, click on *Actions*. Click on *Add Your First Action* and choose your app's language(s).
1. Select *Custom intent*, click *BUILD*. This will open a Dialogflow console. Click *CREATE*.
1. Click on the gear icon to see the project settings.
1. Select *Export and Import*.
1. Select *Restore from zip*. Follow the directions to restore from the `codelab-level-<one/two>.zip` file in this repo.
1. Deploy the fulfillment webhook provided in the `functions` folder using [Google Cloud Functions for Firebase](https://firebase.google.com/docs/functions/):
    1. Follow the instructions to [set up and initialize Firebase SDK for Cloud Functions](https://firebase.google.com/docs/functions/get-started#set_up_and_initialize_functions_sdk). Make sure to select the project that you have previously generated in the Actions on Google Console and to reply `N` when asked to overwrite existing files by the Firebase CLI.
    1. Run `firebase deploy --only functions` and take note of the endpoint where the fulfillment webhook has been published. It should look like `Function URL : https://${REGION}-${PROJECT}.cloudfunctions.net/dialogflowFirebaseFulfillment`.  If the Function URL doesn't show, you can always check at the [Firebase console](https://console.firebase.google.com/).
1. Go back to the Dialogflow console and select *Fulfillment* from the left navigation menu. Enable *Webhook*, set the value of *URL* to the `Function URL` from the previous step, then click *Save*.
1. Select *Integrations* from the left navigation menu and open the *Integration Settings* menu for Actions on Google.
1. Enable *Auto-preview changes* and Click *Test*. This will open the Actions on Google simulator.
1. Type `Talk to my test app` in the simulator, or say `OK Google, talk to my test app` to any Actions on Google enabled device signed into your developer account.

For more detailed information on deployment, see the [documentation](https://developers.google.com/actions/dialogflow/deploy-fulfillment).

## References & Issues
+ Questions? Go to [StackOverflow](https://stackoverflow.com/questions/tagged/actions-on-google), [Assistant Developer Community on Reddit](https://www.reddit.com/r/GoogleAssistantDev/) or [Support](https://developers.google.com/actions/support/).
+ For bugs, please report an issue on Github.
+ Actions on Google [Documentation](https://developers.google.com/actions/extending-the-assistant)
+ [Webhook Boilerplate Template](https://github.com/actions-on-google/dialogflow-webhook-boilerplate-nodejs) for Actions on Google.
 
## Make Contributions
Please read and follow the steps in the [CONTRIBUTING.md](CONTRIBUTING.md).
 
## License
See [LICENSE](LICENSE).
 
## Terms
Your use of this sample is subject to, and by using or downloading the sample files you agree to comply with, the [Google APIs Terms of Service](https://developers.google.com/terms/).
