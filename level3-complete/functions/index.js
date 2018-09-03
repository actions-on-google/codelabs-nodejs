// Copyright 2018, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//  http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

// Import the Dialogflow module and response creation dependencies
// from the Actions on Google client library.
const {
  dialogflow,
  BasicCard,
  Permission,
  Suggestions,
  Carousel,
  Image,
} = require('actions-on-google');

// Import the i18n-node internationalization library, which is
// used to localize prompt strings to the language of the user.
const i18n = require('i18n');

// Import the path module to help locate the locale directory.
const path = require('path');

// Import the firebase-functions package for deployment.
const functions = require('firebase-functions');

// Instantiate the Dialogflow client.
const app = dialogflow({debug: true});

// Configure the internationalization options.
i18n.configure({
  'directory': path.join(__dirname, 'locales'),
  'fallbacks': {
    'it-IT': 'it',
  }
});

// Use the Actions on Google library middleware function to
// initialize the i18n locale at the beginning of each dialog.
app.middleware((conv) => {
  i18n.setLocale(conv.user.locale);
});

// Define a mapping of fake color strings to basic card objects.
// Translate strings at runtime based on user's locale.
const colorMap = () => {
  return {
    'indigo taco': {
      title: i18n.__('Indigo Taco'),
      text: i18n.__('Indigo Taco is a subtle bluish tone.'),
      image: {
        url: 'https://storage.googleapis.com/material-design/publish/material_v_12/assets/0BxFyKV4eeNjDN1JRbF9ZMHZsa1k/style-color-uiapplication-palette1.png',
        accessibilityText: i18n.__('Indigo Taco Color'),
      },
      display: 'WHITE',
    },
    'pink unicorn': {
      title: i18n.__('Pink Unicorn'),
      text: i18n.__('Pink Unicorn is an imaginative reddish hue.'),
      image: {
        url: 'https://storage.googleapis.com/material-design/publish/material_v_12/assets/0BxFyKV4eeNjDbFVfTXpoaEE5Vzg/style-color-uiapplication-palette2.png',
        accessibilityText: i18n.__('Pink Unicorn Color'),
      },
      display: 'WHITE',
    },
    'blue grey coffee': {
      title: i18n.__('Blue Grey Coffee'),
      text: i18n.__('Calling out to rainy days, Blue Grey Coffee brings to mind your favorite coffee shop.'),
      image: {
        url: 'https://storage.googleapis.com/material-design/publish/material_v_12/assets/0BxFyKV4eeNjDZUdpeURtaTUwLUk/style-color-colorsystem-gray-secondary-161116.png',
        accessibilityText: i18n.__('Blue Grey Coffee Color'),
      },
      display: 'WHITE',
    },
  };
};

// In the case the user is interacting with the Action on a screened device
// The Fake Color Carousel will display a carousel of color cards
const fakeColorCarousel = () => {
  const carousel = new Carousel({
    items: {
      'indigo taco': {
        title: i18n.__('Indigo Taco'),
        synonyms: [i18n.__('indigo'), i18n.__('taco')],
        image: new Image({
          url: 'https://storage.googleapis.com/material-design/publish/material_v_12/assets/0BxFyKV4eeNjDN1JRbF9ZMHZsa1k/style-color-uiapplication-palette1.png',
          alt: i18n.__('Indigo Taco Color'),
        }),
      },
      'pink unicorn': {
        title: i18n.__('Pink Unicorn'),
        synonyms: [i18n.__('pink'), i18n.__('unicorn')],
        image: new Image({
          url: 'https://storage.googleapis.com/material-design/publish/material_v_12/assets/0BxFyKV4eeNjDbFVfTXpoaEE5Vzg/style-color-uiapplication-palette2.png',
          alt: i18n.__('Pink Unicorn Color'),
        }),
      },
      'blue grey coffee': {
        title: i18n.__('Blue Grey Coffee'),
        synonyms: [i18n.__('blue'), i18n.__('grey'), i18n.__('coffee')],
        image: new Image({
          url: 'https://storage.googleapis.com/material-design/publish/material_v_12/assets/0BxFyKV4eeNjDZUdpeURtaTUwLUk/style-color-colorsystem-gray-secondary-161116.png',
          alt: i18n.__('Blue Grey Coffee Color'),
        }),
      },
  }});
  return carousel;
};

// Handle the Dialogflow intent named 'Default Welcome Intent'.
app.intent('Default Welcome Intent', (conv) => {
  const name = conv.user.storage.userName;
  if (!name) {
    // Asks the user's permission to know their name, for personalization.
    return conv.ask(new Permission({
      context: i18n.__('Hi there, to get to know you better'),
      permissions: 'NAME',
    }));
  } else {
    const message = i18n.__(
      'Hi again {{userName}}. What was your favorite color?',
      {userName: name});
    return conv.ask(message);
  }
});

// Handle the Dialogflow intent named 'actions_intent_PERMISSION'. If user
// agreed to PERMISSION prompt, then boolean value 'permissionGranted' is true.
app.intent('actions_intent_PERMISSION', (conv, params, permissionGranted) => {
  if (!permissionGranted) {
    // If the user denied our request, go ahead with the conversation.
    conv.ask(i18n.__(`OK, no worries. What's your favorite color?`));
    conv.ask(new Suggestions(i18n.__('Blue'), i18n.__('Red'), i18n.__('Green')));
  } else {
    // If the user accepted our request, store their name in
    // the 'conv.user.storage' object for the future conversations.
    conv.user.storage.userName = conv.user.name.display;
    conv.ask(i18n.__(`Thanks, {{name}}. What's your favorite color?`,
      {name: conv.user.storage.userName}));
    conv.ask(new Suggestions(i18n.__('Blue'), i18n.__('Red'), i18n.__('Green')));
  }
});

// Handle the Dialogflow intent named 'favorite color'.
// The intent collects a parameter named 'color'.
app.intent('favorite color', (conv, {color}) => {
  const luckyNumber = color.length;
  const audioSound = 'https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg';
  if (conv.user.storage.userName) {
    // If we collected user name previously, address them by name and use SSML
    // to embed an audio snippet in the response.
    conv.ask(i18n.__(`<speak>{{name}}, your lucky number is {{number}}.` +
      `<audio src='{{sound}}'></audio> Would you like to hear some fake colors?</speak>`,
      {name: conv.user.storage.userName, number: luckyNumber, sound: audioSound}
    ));
    conv.ask(new Suggestions(i18n.__('Yes'), i18n.__('No')));
  } else {
    conv.ask(i18n.__(`<speak>Your lucky number is {{number}}.<audio src='{{sound}}'></audio>` +
      ` Would you like to hear some fake colors?</speak>`,
      {number: luckyNumber, sound: audioSound}
    ));
  }
});

// Handle the Dialogflow intent named 'favorite fake color'.
// The intent collects a parameter named 'fakeColor'.
app.intent('favorite fake color', (conv, {fakeColor}) => {
  fakeColor = conv.arguments.get('OPTION') || fakeColor;
  // Present user with the corresponding basic card and end the conversation.
  conv.ask(i18n.__(`Here's the color.`), new BasicCard(colorMap()[fakeColor]));
  let prompt = i18n.__('Do you want to hear about another fake color?');
  if (!conv.screen) {
    prompt = colorMap()[fakeColor].text + ' ' + prompt;
  }
  conv.ask(prompt);
  conv.ask(new Suggestions(i18n.__('Yes'), i18n.__('No')));
});

// Handle the Dialogflow NO_INPUT intent.
// Used when the user doesn't select one of the appropriate color options
app.intent('actions_intent_NO_INPUT', (conv) => {
  // Use the number of reprompts to vary response
  const repromptCount = parseInt(conv.arguments.get('REPROMPT_COUNT'));
  if (repromptCount === 0) {
    conv.ask(i18n.__(`What was that? I was hoping for a color.`));
  } else if (repromptCount === 1) {
    conv.ask(i18n.__(`Last chance. I'm just asking for a color. Please.`));
  } else if (conv.arguments.get('IS_FINAL_REPROMPT')) {
    conv.close(i18n.__(`Okay let's try this again later.`));
  }
});

// Handle the Dialogflow intent named 'favorite color - yes'
app.intent(['favorite color - yes', 'favorite fake color - yes'], (conv) => {
  conv.ask(i18n.__('Which color, indigo taco, pink unicorn or blue grey coffee?'));
  // If the user is using a screened device, display the carousel
  if (conv.screen) return conv.ask(fakeColorCarousel());
});

// Set the DialogflowApp object to handle the HTTPS POST request.
exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
