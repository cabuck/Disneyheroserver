  
let express = require('express'),
bodyParser = require('body-parser'),
port = process.env.PORT || 3000,
app = express();
let alexaVerifier = require('alexa-verifier-middleware');

// create a router and attach to express before doing anything else
var alexaRouter = express.Router();
app.use('/', alexaRouter)
//app.use('/alexa', alexaRouter);

var isFisrtTime = true;
const SKILL_NAME = 'Disney Heroes';
const GET_HERO_MESSAGE = "Here's your hero: ";
const HELP_MESSAGE = 'You can say please fetch me a hero, or, you can say exit... What can I help you with?';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Enjoy the day...Goodbye!';
const MORE_MESSAGE = 'Do you want more?'
const PAUSE = '<break time="0.3s" />'
const WHISPER = '<amazon:effect name="whispered"/>'

const data = [
'Aladdin  ',
'Cindrella ',
'Bambi',
'Bella ',
'Bolt ',
'Donald Duck',
'Genie ',
'Goofy',
'Mickey Mouse',
];

alexaRouter.use(alexaVerifier);
alexaRouter.use(bodyParser.json());

function log() {
if (true) {
  console.log.apply(console, arguments);
}
}

alexaRouter.post('/disneyheroes', function(req, res) {

if (req.body.request.type === 'LaunchRequest') {
  res.json(getNewHero());
  isFisrtTime = false
} else if (req.body.request.type === 'SessionEndedRequest') { /* ... */
  log("Session End")
} else if (req.body.request.type === 'IntentRequest') {
  switch (req.body.request.intent.name) {
    case 'AMAZON.YesIntent':
      res.json(getNewHero());
      break;
    case 'AMAZON.NoIntent':
      res.json(stopAndExit());
      break;
    case 'AMAZON.HelpIntent':
      res.json(help());
      break;
    default:

  }
}
});

function handleDataMissing() {
return buildResponse(MISSING_DETAILS, true, null)
}

function stopAndExit() {

const speechOutput = STOP_MESSAGE
var jsonObj = buildResponse(speechOutput, true, "");
return jsonObj;
}

function help() {

const speechOutput = HELP_MESSAGE
const reprompt = HELP_REPROMPT
var jsonObj = buildResponseWithRepromt(speechOutput, false, "", reprompt);

return jsonObj;
}

function getNewHero() {

var welcomeSpeechOutput = 'Welcome to Disney heroes<break time="0.3s" />'
if (!isFisrtTime) {
  welcomeSpeechOutput = '';
}

const heroArr = data;
const heroIndex = Math.floor(Math.random() * heroArr.length);
const randomHero = heroArr[heroIndex];
const tempOutput = WHISPER + GET_HERO_MESSAGE + randomHero + PAUSE;
const speechOutput = welcomeSpeechOutput + tempOutput + MORE_MESSAGE
const more = MORE_MESSAGE


return buildResponseWithRepromt(speechOutput, false, randomHero, more);

}

function buildResponse(speechText, shouldEndSession, cardText) {

const speechOutput = "<speak>" + speechText + "</speak>"
var jsonObj = {
  "version": "1.0",
  "response": {
    "shouldEndSession": shouldEndSession,
    "outputSpeech": {
      "type": "SSML",
      "ssml": speechOutput
    },
    "card": {
      "type": "Simple",
      "title": SKILL_NAME,
      "content": cardText,
      "text": cardText
    }
  }
}
return jsonObj
}

function buildResponseWithRepromt(speechText, shouldEndSession, cardText, reprompt) {

const speechOutput = "<speak>" + speechText + "</speak>"
var jsonObj = {
   "version": "1.0",
   "response": {
    "shouldEndSession": shouldEndSession,
     "outputSpeech": {
       "type": "SSML",
       "ssml": speechOutput
     },
   "card": {
     "type": "Simple",
     "title": SKILL_NAME,
     "content": cardText,
     "text": cardText
   },
   "reprompt": {
     "outputSpeech": {
       "type": "PlainText",
       "text": reprompt,
       "ssml": reprompt
     }
   }
 }
}
return jsonObj
}

// simple request url logger

module.exports = (express, alexaAppServer) => {
  express.use('/', (req, res, next) => {
      if (req.connection.ssl) {
          console.warn('**** server: ssl request', req.url);
          next();
      } else {
          console.warn('**** server: non-ssl request', req.url);
          next();
      }
  });
};

app.listen(port);

console.log('Alexa list RESTful API server started on: ' + port);