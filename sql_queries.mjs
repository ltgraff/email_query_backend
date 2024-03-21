// sql_queries.js

/*

select * from (select sms_message.readable_date as received, sms_message.phone from sms_message union select email_message.received, email_message.em_from from email_message) as first order by received desc limit 2200;

*/

/*
import pg from 'pg';
pg.types.setTypeParser(1114, function (stringValue) {
  return stringValue;
});
*/


/*

combine emails with messages by date:


works:

select sms_message.readable_date, sms_message.phone, email_message.received, email_message.em_from from sms_message left join email_message on sms_message.readable_date=email_message.received union select email_message.received, sms_message.phone, sms_message.readable_date, email_message.em_from from sms_message right join email_message on sms_message.readable_date=email_message.received order by readable_date desc limit 1240;


works:
select sms_message.phone as from, email_message.em_to as to, sms_message.readable_date, sms_message.mid as id from sms_message left join email_message on sms_message.readable_date=email_message.received union select email_message.em_from, email_message.em_to, email_message.received, email_message.eid from sms_message right join email_message on sms_message.readable_date=email_message.received order by readable_date desc limit 1240;

at time zone 'UTC' at time zone 'America/New_York'
*/

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

const display_contacts = () => {
	return new Promise(function(resolve, reject) {
		pool.query('SELECT * FROM CONTACT_EMAIL ORDER BY email', (error, results) => {
			if (error) {
				reject(error)
			}
			resolve(results.rows);
		})
	})
}

function is_date_valid(q) {
	let count = 0;
	if (!q || q.length < 10)
		return 0;
	count = Array.from(q).filter((item) => item === "-").length;
	if (count != 2)
		return 0;
	return 1;
}

// action or command: return -failure, 0 on success

// predicate pci_dev_present() 1 if found, 0 if not

function build_prev_next(cmd, first, last, r_query) {
	if (r_query.where_flag) {
		r_query.qstr += " AND ";
	} else {
		r_query.qstr += " WHERE ";
		r_query.where_flag = 1;
	}
	if (cmd === "prev") {
		if (!is_date_valid(last))
			return err_set("date is invalid: "+last);
		r_query.qstr += "received <= '"+last+"'";
	} else {
		if (!is_date_valid(first))
			return err_append("date is invalid: "+first);
		r_query.qstr += "received >= '"+first+"'";
	}
	return 0;
}
//2024-01-01T05:00:00.000Z
function format_date(date_str) {
	let ret = "";

	ret = date_str.substring(0, 10);

	console.log("original: *"+date_str+"*");
	console.log("converted: *"+ret+"*");
	return ret;
}

// When either a specific message or email is selected
async function select_item(pool, func_arg) {
		let db_query = { qstr: "", where_flag: 0};

}

//SELECT '2023-03-15 12:00:00'::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York' AS est_timestamp;
async function display_emails(pool, func_arg) {
//const display_emails = async (pool, func_arg) => {
//	return new Promise(function(resolve, reject) {
		let tmp_str = "";
		let db_query = { qstr: "", where_flag: 0};

		let cmd = func_arg.cmd;
		let to = func_arg.to;
		let from = func_arg.from;
		let subject = func_arg.subject;
		let date_start = func_arg.date_start;
		let date_end = func_arg.date_end;
		let first = func_arg.first;
		let last = func_arg.last;
		let eid_list = func_arg.eid_list;

		//cmd, to, from, subject, date_start, date_end, first, last, eid_list

		if (cmd === "") {
			return;
		} else if (cmd === "select email") {
			console.log("command: select email");

			db_query.qstr = "select em_from, em_to, em_subject, received at time zone \'UTC\' at time zone \'America/New_York\' as received, em_body from email_message where eid='"+eid_list+"'";

			console.log(db_query.qstr);


			//db_query.qstr = "select "+eid_list+" as id, em_from as from, em_to as to, em_subject as subject, received at time zone \'UTC\' at time zone \'America/New_York\' as received from email_message";

			let results = await pool.query(db_query.qstr);

			return results.rows;

		} else if (cmd === "select message") {
			console.log("command: select message");
			return;
		} else {
			db_query.qstr = "select eid as id, em_from as from, em_to as to, em_subject as subject, received at time zone \'UTC\' at time zone \'America/New_York\' as received from email_message";
		}

	/*
	select sms_message.phone as from, email_message.em_to as to, sms_message.readable_date at time zone 'UTC' at time zone 'America/New_York' as readable_date, sms_message.mid as id from sms_message left join email_message on sms_message.readable_date=email_message.received union select email_message.em_from, email_message.em_to, email_message.received at time zone 'UTC' at time zone 'America/New_York', email_message.eid from sms_message right join email_message on sms_message.readable_date=email_message.received order by readable_date desc limit 1250;
*/

		console.log("command: "+cmd+", to: "+to+", from: "+from+", subject: "+subject+", date_start: "+date_start+", date_end: "+date_end+", first: "+first+", last: "+last+", eid_list: "+eid_list)

		eid_list = [ ];

		//db_query.qstr = "select eid as id, em_from as from, em_to as to, em_subject as subject, received at time zone \'UTC\' at time zone \'America/New_York\' as received from email_message";

		//db_query.qstr = "select sms_message.phone as from, email_message.em_to as to, sms_message.phone as subject, sms_message.readable_date at time zone 'UTC' at time zone 'America/New_York' as readable_date, sms_message.mid as id from sms_message left join email_message on sms_message.readable_date=email_message.received union select email_message.em_from, email_message.em_to, email_message.em_subject, email_message.received at time zone 'UTC' at time zone 'America/New_York', email_message.eid from sms_message right join email_message on sms_message.readable_date=email_message.received";


	/*

select sms_message.mid, sms_message.phone as from, email_message.em_to as to, sms_message.phone as subject, sms_message.readable_date at time zone 'UTC' at time zone 'America/New_York' as readable_date, sms_message.mid as id from sms_message left join email_message on sms_message.readable_date=email_message.received where readable_date < '2023-10-07T09:41:50.000Z' union select email_message.eid, email_message.em_from, email_message.em_to, email_message.em_subject, email_message.received at time zone 'UTC' at time zone 'America/New_York', email_message.eid from sms_message right join email_message on sms_message.readable_date=email_message.received WHERE readable_date < '2023-10-07T09:41:50.000Z' order by readable_date desc limit 70;

	*/
		if (eid_list !== null && eid_list.length > 0) {
			var i;
			tmp_str=" where eid not in ( ";
			for (i=0;i<eid_list.length-1;i++)
				tmp_str+=eid_list[i]+", ";
			tmp_str+=eid_list[i]+")";
			db_query.qstr += tmp_str;
			db_query.where_flag = 1;
		}

		if (cmd === "prev" || cmd === "next") {
			if (build_prev_next(cmd, first, last, db_query) < 0)
				return err_throw("build_prev_next failed");
		}

		// to, from, subject
		if (to) {
			if (db_query.where_flag)
				db_query.qstr += " and";
			else {
				db_query.qstr += " where";
				db_query.where_flag = 1;
			}
			db_query.qstr += " em_to like '%"+to+"%'";
		}
		if (from) {
			if (db_query.where_flag)
				db_query.qstr += " and";
			else {
				db_query.qstr += " where";
				db_query.where_flag = 1;
			}
			db_query.qstr += " em_from like '%"+from+"%'";
		}
		if (subject) {
			if (db_query.where_flag)
				db_query.qstr += " and";
			else {
				db_query.qstr += " where";
				db_query.where_flag = 1;
			}
			db_query.qstr += " em_subject like '%"+subject+"%'";
		}

		if (date_start && is_date_valid(date_start)) {
			if (db_query.where_flag) {
				db_query.qstr += " and";
			} else {
				db_query.qstr += " where";
				db_query.where_flag = 1;
			}
			db_query.qstr += " received > '"+format_date(date_start)+"'";
		}
		if (date_end && is_date_valid(date_end)) {
			if (db_query.where_flag) {
				db_query.qstr += " and";
			} else {
				db_query.qstr += " where";
				db_query.where_flag = 1;
			}
			db_query.qstr += " received < '"+format_date(date_end)+"'";
		}
		
		if (cmd === "next") {
			db_query.qstr +=" order by received asc limit 70";
					console.log("next");
		} else {
			db_query.qstr +=" order by received desc limit 70";
					console.log("cur/prev");
		}

		console.log("first: "+first);
		console.log("last: "+last);
		console.log("original command: "+cmd);
		console.log(db_query.qstr);
		console.log(" ");
		console.log(" ");

		let results = await pool.query(db_query.qstr);

		return results.rows;

/*
		pool.query(db_query.qstr, function(error, results)  {
			if (!results || error) {
				console.log("Error with database pool connection: "+error);
				results.client.release();
				return 1;
			}
			resolve(results.rows);
		})
		.catch((error) => {
			console.log("Error in promise chain: "+err(error));
		});*/
	//})
//	.catch(error => {
//		console.log("Error in promise chain: "+err(error));
//	});
}

export {
	display_contacts,
	display_emails
}
