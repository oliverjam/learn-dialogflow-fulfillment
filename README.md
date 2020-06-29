# Learn Google Dialogflow fulfillment

Learn how to integrate a Google Dialogflow chatbot with your own backend using a fulfillment webhook.

## Before you start

Make sure you have git, Node and npm installed on your machine. Complete the [Appointment Scheduler](https://codelabs.developers.google.com/codelabs/chatbots-dialogflow-appointment-scheduler/#0) Google Codelab, which will walk you through setting up a basic chatbot with Dialogflow.

## Run this project locally

1. For this repo, clone the fork, then `cd` into the cloned directory
1. Run `npm install` to install project dependencies
1. Run `npm run dev` to start the development server

It's important to fork the repo as you'll need to push your own version to GitHub to deploy it.

## Project setup

There is an existing Node server that persists data to the file system using [lowdb](https://github.com/typicode/lowdb/). The home route (`/`) reads all the saved appointments and returns them as JSON.

You can run the tests with `npm test`. Only the first will pass for now.

## Dialogflow fulfillment

Chatbots aren't very useful if they can't talk to any other systems. For example a booking agent needs to be able to _save_ appointments somewhere so your organisation knows about them.

Dialogflow has a feature called "fulfillment" for this. You can tell your agent to send a POST request to a specific URL with all the info from a specific intent. The bot will then show your response to the user.

## Workshop

We're going to configure the existing agent from the [Appointment Scheduler](https://codelabs.developers.google.com/codelabs/chatbots-dialogflow-appointment-scheduler/#0) Google Codelab to use a custom Express server for fulfillment.

### Part one: add a POST route

Our agent is going to send POST requests to our server, so we need to add a new route for this.

<details>
<summary>
Click to see an example POST body
</summary>

```json
{
  "responseId": "4130f4e2-fa42-4022-ab21-abcdcab62e8d-e13762d2",

  "queryResult": {
    "queryText": "Book an appointment for 12 o clock tuesday",

    "parameters": {
      "date-time": {
        "date_time": "2020-06-30T00:00:00+01:00"
      }
    },

    "allRequiredParamsPresent": true,

    "fulfillmentText": "You are all set for 2020-06-30T00:00:00. See you then!",

    "fulfillmentMessages": [
      {
        "text": {
          "text": ["You are all set for 2020-06-30T00:00:00. See you then!"]
        }
      }
    ],

    "outputContexts": [
      {
        "name": "projects/appointments-sdwfgt/agent/sessions/deafe4eb-75ae-3e03-503f-29d09ffbb54f/contexts/__system_counters__",

        "parameters": {
          "no-input": 0,

          "no-match": 0,

          "date-time": {
            "date_time": "2020-06-30T00:00:00+01:00"
          },

          "date-time.original": "12 o clock tuesday"
        }
      }
    ],

    "intent": {
      "name": "projects/appointments-sdwfgt/agent/intents/3595f5e6-7b52-4836-9b7e-6a58edf1ebcd",

      "displayName": "Book appointment"
    },

    "intentDetectionConfidence": 0.8385972,

    "languageCode": "en"
  },

  "originalDetectIntentRequest": {
    "payload": {}
  },

  "session": "projects/appointments-sdwfgt/agent/sessions/deafe4eb-75ae-3e03-503f-29d09ffbb54f"
}
```

</details>

The bit we're interested in is `queryResult`. This contains the parameters our agent extracted from the user's statement. It's awkwardly nested but we want to grab the `date_time` value and add it to the `appointments` array in our database. Each item in the array should be an object with a `date_time` property.

**Hint**: you can add an item to an array in lowdb using:

```js
db.get("keyName").push({ some: "stuff" }).write(); // .write ensures it is actually saved
```

1. Open `src/server.js`
1. Add a new `POST /appointments` route handler
1. Grab the `date_time` parameter from the request body
1. Insert a new object containing the `date_time` into the db
1. Send a JSON response with an empty object for now (we'll fix this in part 2)

<details>
<summary>Solution</summary>

```js
app.post("/appointments", (req, res) => {
  const parameters = req.body.queryResult.parameters;
  const newAppointment = {
    date_time: parameters["date-time"].date_time,
  };
  // save the new time in the db
  db.get("appointments").push(newAppointment).write();
  res.json({});
});
```

</details>

If you run the tests you should now see 2 out of 3 passing.

## Part two: sending a response

Dialogflow fulfillment requires a specific type of response. It must be a JSON object describing the details of the response. The most basic type, a text response, looks like this:

```json
{
  "fulfillmentMessages": [
    {
      "text": {
        "text": ["Text response from your app"]
      }
    }
  ]
}
```

You have two choices here: either define your own custom logic for determining how to respond to the user (based on all the info in the POST body), _or_ reuse the response Dialogflow already created.

If you look at the example POST body above you can see a `fulfillmentMessages` property containing a response of `"You are all set for 2020-06-30T00:00:00. See you then!"`. This is the response defined in the Diagflow console for this specific intent.

1. Send a JSON response after adding the new appointment to the db
1. Re-use the `fulfillmentMessages` property from the request body

<details>
<summary>Solution</summary>

```js
app.post("/appointments", (req, res) => {
  const parameters = req.body.queryResult.parameters;
  const newAppointment = {
    date_time: parameters["date-time"].date_time,
  };
  db.get("appointments").push(newAppointment).write();
  const fulfillmentMessages = req.body.queryResult.fulfillmentMessages;
  res.json({ fulfillmentMessages });
});
```

</details>

Run the tests again and all three should be passing.

## Part three: deploying to Glitch

You could deploy this server to any Node host, but we're going to use Glitch. This is because our database saves data in a JSON file. Hosts like Heroku periodically wipe your server's file system, so you can't use a db like this with them.

We're going to use Glitch's "import from GitHub" feature to save copy/pasting our code over via the Glitch editor.

1. Commit your changes, then push to your fork on GitHub
1. Go to https://glitch.com and sign in using your GitHub account
1. Click the "New Project" button in the top right
1. Select "Import from GitHub", then paste in the URL of your forked repo

Glitch should open your project in their browser-based editor. Give it a minute to finish installing dependencies and starting the server. Click the "Tools" button at the bottom left, then "Logs" to see if it's finished.

You can view your server's responses by clicking "Show" at the top left, then "Next to the code". This should open a mini-browser pointed at your app's home route. Right now this should show `{ message: "No appointments found" }`.

## Part four: configure your agent

Now that we have a deployed server we can finally hook up our Dialogflow agent.

Open the Dialogflow console and view your "appointments" agent. Select the "Fulfillment" option in the sidebar.

![](https://user-images.githubusercontent.com/9408641/85956082-11dc7d00-b97b-11ea-845b-1cda7c6e5298.png)

Then click the "Webhook" toggle to enable it.

![](https://user-images.githubusercontent.com/9408641/85956095-3df7fe00-b97b-11ea-90bd-5a1889563cb3.png)

You now need to provide Dialogflow with the `POST` endpoint of your server. You can find this by going back to Glitch and clicking the "Change URL" button above the preview browser. This will show you the deployed URL of your project; it'll be something like `https://oliverjam-learn-dialogflow-fulfillment.glitch.me`.

Paste this into the Dialogflow Webhook field, and add "/appointments" on to the end, since that's the route for POST requests.

![](https://user-images.githubusercontent.com/9408641/85956138-ae068400-b97b-11ea-83fd-cade9336e650.png)

Don't worry about securing the endpoint with an authorization header yet.

Click the "Save" button right at the bottom to save your webhook. Finally we need to go back to our "appointment" intent, scroll to the bottom, expand the "Fulfillment" section and toggle "Enable webhook call for this intent".

![](https://user-images.githubusercontent.com/9408641/86001131-60832900-ba06-11ea-8bc3-a2fbca5e6eea.png)

You can now send a test query to your agent using the "Try it now sidebar" on the right. Enter something like "book an appointment for 12 o clock tomorrow". Hopefully you see the same response from the bot you were seeing before.

You can check if your webhook request worked by clicking the "Diagnostic Info" button at the bottom. This has tabs to show the "Fulfillment response" and "Fulfillment status". If there was a problem with the request you'll see the errors here.

![](https://user-images.githubusercontent.com/9408641/85956202-400e8c80-b97c-11ea-8052-1b43665bf32a.png)

Go back to your Glitch app and refresh the home route view. You should see it now displays an array containing the appointment you just created.

![](https://user-images.githubusercontent.com/9408641/85956376-5bc66280-b97d-11ea-89f4-b34c65fecf5b.png)

## Next steps

Well done on building a custom backend for your agent. You now have the building blocks to go and create your own interesting integrations. You could try connecting the same appointments agent up to the Google Calendar API, or you could create a whole new bot that does something totally random. I would recommend reading the [docs for fulfillment webhooks](https://cloud.google.com/dialogflow/docs/fulfillment-webhook), since there's more to it than just basic text responses.
