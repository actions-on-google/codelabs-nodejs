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

const {
  dialogflow,
  BasicCard,
  Permission
} = require('actions-on-google');
const functions = require('firebase-functions');

const app = dialogflow({ debug: true });

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

app.intent('Default Welcome Intent', (conv) => {
  conv.ask(new Permission({
    context: 'Hi there, to get to know you better',
    permissions: 'NAME',
  }));
});

app.intent('actions_intent_PERMISSION', (conv, params, permissionGranted) => {
  if (!permissionGranted) {
    conv.ask(`That's not nice. What's your favorite color?`);
  } else {
    conv.data.userName = conv.user.name.display;
    conv.ask(`Thanks, ${conv.data.userName}. What's your favorite color?`);
  }
});

app.intent('favorite color', (conv, { color }) => {
  const luckyNumber = color.length;
  const audioSound = 'https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg';
  if (conv.data.userName) {
    conv.ask(`<speak>${conv.data.userName}, your lucky number is ` +
      `${luckyNumber}<audio src="${audioSound}"></audio>.` +
      `Would you like to hear some fake colors?</speak>`);
  } else {
    conv.ask(`<speak>Your lucky number is ${luckyNumber}` +
      `<audio src="${audioSound}"></audio>.` +
      `Would you like to hear some fake colors?</speak>`);
  }
});

app.intent('favorite fake color', (conv, { fakeColor }) => {
  conv.close(`Here's the color`, colorMap[fakeColor]);
});

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
