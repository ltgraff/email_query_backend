// sql_queries.js


/*
import pg from 'pg';
pg.types.setTypeParser(1114, function (stringValue) {
  return stringValue;
});
*/

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
	if (!q) {
		console.log("q is not");
		return 0;
	}
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
			return -1;
		r_query.qstr += "received <= '"+last+"'";
	} else {
		if (!is_date_valid(first))
			return -1;
		r_query.qstr += "received >= '"+first+"'";
	}
	return 0;
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

		if (cmd === "")
			return

		console.log("command: "+cmd+", to: "+to+", from: "+from+", subject: "+subject+", date_start: "+date_start+", date_end: "+date_end+", first: "+first+", last: "+last+", eid_list: "+eid_list)

		eid_list = [ ];

		db_query.qstr = "select eid, em_body, em_from, em_to, em_subject, received at time zone \'UTC\' at time zone \'America/New_York\' as received from email_message";

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
			if (build_prev_next(cmd, first, last, db_query) < 0) {
				console.log("build_prev_next failed");
				return -1;
			}
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
