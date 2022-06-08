//Final index.js code
var randomstring = require("randomstring"); 
const express = require('express');
const { google } = require('googleapis');
const {GoogleAuth} = require('google-auth-library');
const { OAuth2Client } = require('google-auth-library');

const { WebhookClient } = require("dialogflow-fulfillment");
const { Payload } =require("dialogflow-fulfillment");
const app = express();

const MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

var randomstring = require("randomstring"); 



var appointment_ticket=randomstring.generate(9);
app.post("/dialogflow", express.json(), (req, res) => {
    const agent = new WebhookClient({ 
		request: req, response: res 
		});

		const SCOPES = 'https://www.googleapis.com/auth/calendar';
		const GOOGLE_PRIVATE_KEY=//Key
		const GOOGLE_CLIENT_EMAIL =//"<client-email>"
		const GOOGLE_PROJECT_NUMBER = //"<project-number>"
		const GOOGLE_CALENDAR_ID = //"<calender-id>"
		
		const jwtClient = new google.auth.JWT(
		GOOGLE_CLIENT_EMAIL,
		null,
		GOOGLE_PRIVATE_KEY,
		SCOPES
		);
		
		const calendar = google.calendar({
		version: 'v3',
		project: 345380292925,
		auth: jwtClient
		});


		function deleteEvent(eventId) {
			var params = {
			  calendarId:'v100sdgeik1rum4pf50q1s4tv8@group.calendar.google.com',// 'primary',
			  eventId: eventId,
			};
		
			calendar.events.delete(params, function(err) {
			  if (err) {
				  console.log(eventId)
				console.log('The API returned an error: ' + eventId);
				return;
			  }
			  console.log('Event deleted.');
			});
		  }


var date="";
function Schedule_Appointment_Date(agent){
	agent.add("Great! We will have your appointment scheduled!");
	agent.add("Can we get your name please?")
	dt=agent.parameters.datetime;
	var date=Object.values(dt)
	console.log(date);
	return date;
}
async function delete_appointment(agent){
	agent.add("Your appointment is successfully deleted.")
    cid=agent.parameters.any;

	var client = new MongoClient(url);
	await client.connect();
	var snap = await client.db("Chatbot_MajorProject").collection("booking").findOne({appointment_ticket:cid});
	deleteEvent(snap.EventId);
}
function custom_payload(agent){
	var payLoadData={
		"richContent":[
			[
			{
			"type":"link",
			"text":"Your appointment is all booked! Your customer id is :"+appointment_ticket,
			"icon":{
				"type":"text",
				"color":"#ADD8E6"
			},
			"type":"button"
			}

		]
	]
	}
	agent.add(new Payload(agent.UNSPECIFIED,payLoadData,{sendAsMessage:true, rawPayload:true }));
}
var intentMap = new Map();
intentMap.set("Schedule_Appointment_Date",Schedule_Appointment_Date);
intentMap.set("Schedule_Appointment_Age",custom_payload);
intentMap.set("Delete_Appointment",delete_appointment);
agent.handleRequest(intentMap);


app.get('/', (req, res) => {
calendar.events.list({
	calendarId://"<calender-id>",
	timeMin: (new Date()).toISOString(),
	maxResults: 10,
	singleEvents: true,
	orderBy: 'startTime',
}, (error, result) => {
	if (error) {
	res.send(JSON.stringify({ error: error }));
	} else {
	if (result.data.items.length) {
		res.send(JSON.stringify({ events: result.data.items }));
	} else {
		res.send(JSON.stringify({ message: 'No upcoming events found.' }));
	}
	}
});
});
app.get("/createEvent",(req,res)=>{
	//console.log(date);
var event = {
	'summary': 'Appointment booked!',
	'location': 'Hyderabad,India',
	'description': "",
	'start': {
	'dateTime': Schedule_Appointment_Date(agent),
	'timeZone': 'Asia/Dhaka',
	},
	'end': {
	'dateTime': Schedule_Appointment_Date(agent),
	'timeZone': 'Asia/Dhaka',
	},
	'attendees': [],
	'reminders': {
	'useDefault': false,
	'overrides': [
		{'method': 'email', 'minutes': 24 * 60},
		{'method': 'popup', 'minutes': 10},
	],
	},
};

	
const auth = new google.auth.GoogleAuth({
    keyFile: 'demo1-daljlc-d88d16d69fec.json',
    scopes: 'https://www.googleapis.com/auth/calendar',
  });
  auth.getClient().then(a=>{
    calendar.events.insert({
      auth:a,
      calendarId: "v100sdgeik1rum4pf50q1s4tv8@group.calendar.google.com",
      resource: event,
    }, function(err, event) {
      if (err) {
          //console.log(date)
        console.log('There was an error contacting the Calendar service: ' + err);
        return;
      }
	  MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		var dbo = db.db("Chatbot_MajorProject");
	  	var date=Schedule_Appointment_Date(agent);
		  console.log(date);
		var eid=event.data["id"];
		var myobj = {date_time:date,appointment_ticket:appointment_ticket,EventId:eid };
		dbo.collection("booking").insertOne(myobj, function(err, res) {
			if (err) throw err;
			console.log("1 document inserted");
			db.close();
		  });
		});
      console.log('Event created: %s', event.data);
      res.jsonp("Event successfully created!");
    });
  })

	});
});

app.listen(process.env.PORT || 8080);

