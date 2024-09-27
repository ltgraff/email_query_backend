// index.js

import assert from 'assert';
import db_pool from './db_pool.json' assert { type: "json" };


import express from 'express'; // Importing express as an ES module

import https from 'https';
import fs from 'fs';

import cors from 'cors';


const app = express();

import * as sql from './sql_queries.mjs'; // Importing all exports from 'sql_queries' module
import pg from 'pg';

//pg.types.setTypeParser(1114, function (stringValue) {
//  return stringValue;
//});

let m_pool;

const options = {
	key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.crt')
};

import { error_throw, error_set, error_append, error_disp } from './error_handler.mjs';

function err_throw(error) {
	return error_throw(error, import.meta.url);
}

function err_set(error) {
	return error_set(error, import.meta.url);
}

function err_append(error) {
	return error_append(error, import.meta.url);
}

function err_disp(error) {
	return error_disp(error, import.meta.url);
}

var m_app_name = "message_backend";
var m_app_version = "1.0a";
var m_app_key = "2024_03_31-message_backend";
var m_command = "cur";
var m_from = null
var m_to = null
var m_subject = null
var m_date_start = null
var m_date_end = null
var m_first = null;
var m_last = null
var m_eid_list = [ ];

function set_defaults() {
	m_command = "cur";
	m_from = null;
	m_to = null;
	m_subject = null;
	m_date_start = null;
	m_date_end = null;
	m_first = null;
	m_last = null
	m_eid_list = [ ];
}

function version_string() {
	let ret = m_app_name+" version "+m_app_version;
	return ret;
}
	
function api_check_key(api_key) {
	if (m_app_key === api_key)
		return 1;
	return 0;
}

function cmd_type_is_valid(part1, part2) {
	if (!part1 || !part2)
		return 0;
	if (part1 !== "email" && part1 !== "sms") 
		return 0;
	if (part2.length < 3)
		return 0;
	return 1;
}

function cmd_parse_initial(cmd) {
	console.log("cmd_parse_initial: *"+cmd+"*");
	let i = cmd.indexOf(" ");
	console.log("found at: "+i);
	if (i < 2 || cmd.length-i < 3)
		return null;
	return [cmd.slice(0, i), cmd.slice(i+1)];
}

function check_valid_commands(msg_cmd) {
	if (msg_cmd === "cur" || msg_cmd === "prev" || msg_cmd === "next" || msg_cmd === "select")
		return 1;
	return 0;
	


/*
	if (!items || !items.body)
		return 0;
	let tmp = JSON.stringify(items.body);
	if (!tmp)
		return 0;
	tmp = tmp.replace(/:/g, ",");
	tmp = tmp.split(",");
	if (tmp.length < 10 || !tmp[1])
		return 0;
	tmp[1] = tmp[1].replace(/\"/g, "");
	if (tmp[1] === "cur" || tmp[1] === "prev" || tmp[1] === "next" || tmp[1] === "select email")
		return 1;
	return 0;
*/
}

app.use(cors());
app.use(express.json())
app.use(function (req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	//res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000, https://localhost:3000');
	res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', '*');
	res.setHeader('Access-Control-Allow-Credentials', '*');
	//res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, x-api-key');
	next();
});

app.post('/api/send-data', (req, res) => {
	console.log("in /api/send-data function");
	console.log("received: *"+JSON.stringify(req.body)+"*");

	const api_key = req.headers['x-api-key'];

	console.log("api_key: *"+api_key+"*");
	if (!api_check_key(api_key)) {
		err_disp("app.post: api key mismatch");
		res.status(500).send(version_string()+" Invalid api-key data");
		return;
	}

	let func_arg = {
		cmd:		req.body.key1,
		to:			req.body.key2,
		from:		req.body.key3,
		subject:	req.body.key4,
		date_start:	req.body.key5,
		date_end:	req.body.key6,
		first:		req.body.key7,
		last:		req.body.key8,
		eid_list:	req.body.key9,
	};

	const [msg_type, msg_cmd] = cmd_parse_initial(func_arg.cmd);

	console.log("after cmd split: *"+msg_type+"* cmd: *"+msg_cmd+"*");

	if (!cmd_type_is_valid(msg_type, msg_cmd)) {
		err_disp("app.post: cmd_type_is_valid failed");
		res.status(500).send(version_string()+" Invalid req data");
		return;
	}
	if (!check_valid_commands(msg_cmd)) {
		res.status(500).send(version_string()+" Invalid command in request data");
		err_disp("app.post: check_valid_commands failed");
		return;
	}
	func_arg.cmd = msg_cmd;

	sql.display_emails(m_pool, func_arg)
		.then(response => {
			res.status(200).send(response);
		})
		.catch(error => {
			err_append("app.post: display_emails");
			err_disp(error);
			res.status(500).send(error);
		})
})

app.get('/', (req, res) => {
	console.log("in / function");
	console.log("********************************************************");
	//res.status(200).send("Hello from the backend!");
	
	sql.display_emails(m_pool, m_command, m_first, m_last, m_eid_list)
		.then(response => {
			res.status(200).send(response);
		})
		.catch(error => {
			err_disp(error);
			res.status(500).send(error);
		})
	
});

function load_pool() {
	m_pool = new pg.Pool({
		max: 20,
		min: 10,
		user: db_pool.db_connect[0].user,
		host: db_pool.db_connect[0].host,
		database: db_pool.db_connect[0].database,
		password: db_pool.db_connect[0].password,
		port: db_pool.db_connect[0].port,
	});
	console.log("pool object: ");
	console.log(m_pool);
	console.log("-----------------\n");
	return 1;
}

app.listen(3001, () => {

//https.createServer(options, app).listen(3001, () => {
	if (! load_pool()) 
		err("Could not load data for the database connection.");
	console.log("App running on port 3001")
});
