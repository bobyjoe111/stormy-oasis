const express = require("express");
const app = express();
const {MongoClient} = require('mongodb');
const path = require('path');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.json());
var client;
var uri = "mongodb+srv://voteme:Sweatpeaandlando@cluster0.cdqqm.mongodb.net/?retryWrites=true&w=majority";
var usernames = [];
var passwords = [];
async function main(){
    /**
     * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
     * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
     */
    uri = "mongodb+srv://voteme:Sweatpeaandlando@cluster0.cdqqm.mongodb.net/?retryWrites=true&w=majority";
 

    client = new MongoClient(uri);
 
    try {
        // Connect to the MongoDB cluster
        await client.connect();

				usernames = await readDoc(client, 'usernames');
				passwords = await readDoc(client, 'passwords');
				usernames = await usernames.usernames;
				passwords = await passwords.passwords;
			
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

main().catch(console.error);

async function updateDoc(client, name, updatedDoc) {
	await client.db('test').collection('posts').updateOne({name: name}, {$set: updatedDoc});	
}

async function readDoc(client, name) {
	var result = await client.db('test').collection('posts').findOne({name: name});	
	if (result) {
		return result;
	}
}

async function createDoc(client, newDoc) {
	await client.db('test').collection('posts').insertOne(newDoc);
}

app.post('/read', async function(req, res) {
	var { name } = req.body;
	if (client) {
		var doc = await readDoc(await client.connect(), name);
		console.log(doc)
		res.send(doc);
	}
});

app.post('/create', async function(req, res) {
	var { info } = req.body;
	if (client) {
		await createDoc(await client.connect(), info);
		res.send({success: true});
	}
});

app.post('/upDate', async function(req, res) {
	var { name, info } = req.body;
	if (client) {
		await updateDoc(await client.connect(), name, info);
		res.send({success: true});
	}
});

app.post('/login', function(req, res) {
	var { username, password } = 	req.body;
	if (usernames.includes(username) && passwords.includes(password)) {
		res.send({success: true});
	} else {
		res.send({success: false});
	}
});

app.post('/vote', async function(req, res) {
	var { data } = req.body;
	if (client) {
		var people = await readDoc(await client.connect(), "people");
		people = await people.people;
		for (var i = 0; i < data.length; i++) {
			people[i].rating += data[i].rating;
		}
		await updateDoc(await client.connect(), 'people', {people: people});
		res.send({success: true});
	}
});

app.post("/", async (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});



app.listen(process.env.PORT || 3000, () => {
  console.log("Listening at port 3000");
});