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
  Carousel,
  Image,
  MediaObject,
  MediaResponse,
  Permission,
} = require('actions-on-google');

// Import the necessary internationalization library
// this will be used to return strings depending on the language of the user
const i18n = require('i18n');

// Import the path module for reading local files (the translated strings)
const path = require('path');

// Instantiate the Dialogflow client.
const app = dialogflow({debug: true});

// Configure the internationalization options
i18n.configure({
  'directory': path.join(__dirname, '/locales'),
  'objectNotation': true,
  'fallbacks': {
    'fr-FR': 'fr',
    'fr-CA': 'fr',
  },
});

// For convienience and readability, alias the internationalization function
const localize = i18n.__;

// Add the internalization helper as a middleware
app.middleware((conv) => {
  i18n.setLocale(conv.user.locale);
});

// Define a mapping of fake color strings to basic card objects.
const colorMap = {
  'indigo taco': new BasicCard({
    title: 'Indigo Taco',
    image: {
      url: 'https://storage.googleapis.com/material-design/publish/material_v_12/assets/0BxFyKV4eeNjDN1JRbF9ZMHZsa1k/style-color-uiapplication-palette1.png',
      accessibilityText: 'Indigo Taco Color',
    },
    display: 'WHITE',
  }),
  'pink unicorn': new BasicCard({
    title: 'Pink Unicorn',
    image: {
      url: 'https://storage.googleapis.com/material-design/publish/material_v_12/assets/0BxFyKV4eeNjDbFVfTXpoaEE5Vzg/style-color-uiapplication-palette2.png',
      accessibilityText: 'Pink Unicorn Color',
    },
    display: 'WHITE',
  }),
  'blue grey coffee': new BasicCard({
    title: 'Blue Grey Coffee',
    image: {
      url: 'https://storage.googleapis.com/material-design/publish/material_v_12/assets/0BxFyKV4eeNjDZUdpeURtaTUwLUk/style-color-colorsystem-gray-secondary-161116.png',
      accessibilityText: 'Blue Grey Coffee Color',
    },
    display: 'WHITE',
  }),
};

// In the case the user is interacting with the conversation on a screened device
// The Fake Color Carousel will display a carousel of color cards
const fakeColorCarousel = () => {
  const carousel = new Carousel({
    items: {
      'indigo taco': {
        title: 'Indigo Taco',
        description: 'Indigo Taco',
        synonyms: ['indigo', 'taco'],
        image: new Image({
          url: 'https://storage.googleapis.com/material-design/publish/material_v_12/assets/0BxFyKV4eeNjDN1JRbF9ZMHZsa1k/style-color-uiapplication-palette1.png',
          alt: 'Indigo Taco Color',
        }),
      },
      'pink unicorn': {
        title: 'Pink Unicorn',
        description: 'Pink Unicorn',
        synonyms: ['pink', 'unicorn'],
        image: new Image({
          url: 'https://storage.googleapis.com/material-design/publish/material_v_12/assets/0BxFyKV4eeNjDbFVfTXpoaEE5Vzg/style-color-uiapplication-palette2.png',
          alt: 'Pink Unicorn Color',
        }),
      },
      'blue grey coffee': {
        title: 'Blue Grey Coffee',
        description: 'Blue Grey Coffee',
        synonyms: ['blue', 'grey', 'coffee'],
        image: new Image({
          url: 'https://storage.googleapis.com/material-design/publish/material_v_12/assets/0BxFyKV4eeNjDZUdpeURtaTUwLUk/style-color-colorsystem-gray-secondary-161116.png',
          alt: 'Blue Grey Coffee Color',
        }),
      },
  }});
  return carousel;
};

// Handle the Dialogflow intent named 'Default Welcome Intent'.
app.intent('Default Welcome Intent', (conv) => {
  if (conv.user.storage.userName) {
    // Instead of returning the raw string, this will return the language appropriate string.
    const message = localize(
        'Hi again {{name}}. What was your favorite color again?',
        {name: conv.user.storage.userName});
    return conv.ask(message);
  }
  // Asks the user's permission to know their name, for personalization.
  conv.ask(new Permission({
    context: localize('Hi there, to get to know you better'),
    permissions: 'NAME',
  }));
});

// Handle the Dialogflow intent named 'actions_intent_PERMISSION'. If user
// agreed to PERMISSION prompt, then boolean value 'permissionGranted' is true.
app.intent('actions_intent_PERMISSION', (conv, params, permissionGranted) => {
  if (!permissionGranted) {
    // If the user denied our request, go ahead with the conversation.
    const message = localize(`Okay, no worries. What's your favorite color?`);
    conv.ask(message);
  } else {
    // If the user accepted our request, store their name in
    // the 'conv.user.storage' object for repeat uses of the conversation.
    conv.user.storage.userName = conv.user.name.display;
    conv.ask(
         localize(`Thanks, {{name}}. What's your favorite color?`,
          {name: conv.user.storage.userName})
    );
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
    conv.ask(`<speak>${conv.user.storage.userName}, your lucky number is ` +
      `${luckyNumber}<audio src='${audioSound}'></audio>.` +
      `Would you like to hear some fake colors?</speak>`);
  } else {
    conv.ask(`<speak>Your lucky number is ${luckyNumber}` +
      `<audio src='${audioSound}'></audio>.` +
      `Would you like to hear some fake colors?</speak>`);
  }
});

// Handle the Dialogflow intent named 'Favorite Color Intent'
app.intent('Favorite Color Intent - yes', (conv) => {
  // TODO(lukedavis) translate this
  conv.ask('Which color, indigo taco, pink unicorn or blue grey coffee?');
  // If the user is using a screened device, display the carousel
  if (conv.screen) return conv.ask(fakeColorCarousel());
});

// Handle the Dialogflow intent named 'favorite fake color'.
// The intent collects a parameter named 'fakeColor'.
app.intent('favorite fake color', (conv, {fakeColor}) => {
  // Present user with the corresponding basic card and end the conversation.
  const message = localize(`Here's the color`);
  conv.close(message, colorMap[fakeColor]);
});

const playSong = (conv, option) => {
  // All audio files have the same root. This will save some typing
  const baseUrl = 'https://storage.googleapis.com/automotive-media/';
  if (option === 'indigo taco') {
    const url = baseUrl + 'The_Messenger.mp3';
    const name = 'Omega';
    // TODO(lukedavis): internationalize this
    conv.ask('That reminds me of a song');
    conv.close(new MediaResponse(new MediaObject({name, url})));
  } else if (option === 'pink unicorn') {
    const url = baseUrl + 'The_Story_Unfolds.mp3';
    const name = 'Gamma';
    // TODO(lukedavis): internationalize this
    conv.ask('That reminds me of a song');
    conv.close(new MediaResponse(new MediaObject({name, url})));
  } else if (option === 'blue grey coffee') {
    const url = baseUrl + 'Talkies.mp3';
    const name = 'Delta';
    // TODO(lukedavis): internationalize this
    conv.ask('That reminds me of a song');
    conv.close(new MediaResponse(new MediaObject({name, url})));
  } else {
    // TODO(lukedavis): internationalize this
    conv.close('It was fun chatting with you. Until next time.');
  }
};

// Handle the Dialogflow OPTION intent.
// Used for selecting one option from a list.
app.intent('actions_intent_OPTION', (conv, params, option) => {
  if (!option) return conv.ask('You did not select an option');
  // TODO(lukedavis): internationalize this
  conv.ask('You selected ' + option);
  const hasMedia = conv.surface.capabilities.has(
      'actions.capability.MEDIA_RESPONSE_AUDIO');
  if (hasMedia) {
    playSong(conv, option);
  } else {
    // TODO(lukedavis): internationalize this
    conv.close('It was fun chatting with you. Until next time.');
  }
});

// Handle the Dialogflow NO_INPUT intent.
// Used when the user doesn't select one of the appropriate color options
app.intent('actions_intent_NO_INPUT', (conv) => {
  // Use the number of reprompts to vary response
  const repromptCount = parseInt(conv.arguments.get('REPROMPT_COUNT'));
  if (repromptCount === 0) {
    // TODO(lukedavis): internationalize this
    conv.ask(`What was that? I was hoping for a color.`);
  } else if (repromptCount === 1) {
    // TODO(lukedavis): internationalize this
    conv.ask(`Last chance. I'm just asking for a color. Please.`);
  } else if (conv.arguments.get('IS_FINAL_REPROMPT')) {
    // TODO(lukedavis): internationalize this
    conv.close(`Okay let's try this again later.`);
  }
});

// Export the app to be consumed in the index.js file
module.exports = app;
