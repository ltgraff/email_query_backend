// index.js

import assert from 'assert';
import db_pool from './db_pool.json' assert { type: "json" };


import express from 'express'; // Importing express as an ES module
const app = express();
const port = 3001;

import * as sql from './sql_queries.mjs'; // Importing all exports from 'sql_queries' module
import pg from 'pg';

//pg.types.setTypeParser(1114, function (stringValue) {
//  return stringValue;
//});

let m_pool;


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

function check_valid_keys(func_arg) {
	if (func_arg.cmd && func_arg.cmd.length > 9999)
		return 0;
	return 1;
}

function check_valid(q) {
	return (q.length > 0 && q.length < 999999)
}

app.use(express.json())
app.use(function (req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
	res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers');
	next();
});

app.post('/api/send-data', (req, res) => {
	console.log("in /api/send-data function");

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

	if (!check_valid_keys(func_arg)) {
		err_disp("app.post: check_valid_keys failed");
		res.status(500).send("Invalid key data");
		return;
	}

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

app.listen(port, () => {
	if (! load_pool()) 
		err("Could not load data for the database connection.");
	console.log(`App running on port ${port}.`)
});
