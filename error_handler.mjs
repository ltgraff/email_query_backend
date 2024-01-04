// error_handler.js

/*
* Initially, use either err_throw or err_set
* use err_append for every instance after that
* use err_disp from final caller
*
* Will print the function stack, if it exists
* when bundled together, the error stack is not accurate
* Therefore a good description of the function and error should be used
*
* eg: return err_set("my_function file not found");
*/


/*

Paste this into the source file:


import { error_throw, error_set, error_append, error_disp } from './error_handler.js';

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


*/


var g_error_str = "";
var g_error_stack = "";

function error_throw(error, fn) {
	error_append(error, fn);
	throw new Error(error);
}

function error_set(error, fn) {
	g_error_stack = error.stack;
	if (!g_error_stack)
		g_error_stack = "";
	return error_append(error, fn);
}

function error_append(error_str, fn) {
	g_error_str += error_inner(error_str, fn);
	return -1;
}

function error_disp(error, fn) {
	if (typeof(error) === 'object' && error && error.stack) {
		if (g_error_stack.length < 1)
			g_error_stack = error.stack;
	} else if (typeof(error) === 'string') {
		error_append(error, fn);
	}
	if (g_error_stack.length > 0)
		error_append(g_error_stack, fn);
	console.log(g_error_str);
	g_error_str = "";
	g_error_stack = "";
	return -1;
}

/*
* Strip the path off of the filename
*/
function strip_prev(fn) {
	let rtn = "";
	let s = fn.lastIndexOf("/");
	let s1 = fn.lastIndexOf("\\");

	if (s1 > s)
		s = s1;
	if (s > 1)
		rtn = fn.substring(s+1);
	else
		rtn = fn;
	return rtn;
}

function error_inner(error_str, fn) {
	let tmp = "";
	let d = new Date();
	if (fn && fn.length > 2) {
		fn += ": ";
		fn = strip_prev(fn);
	} else  {
		fn = "<unknown filename>: ";
	}
	if (!error_str)
		error_str = "<unknown error>";
	tmp = d.toString().slice(4, 24)+" "+fn+error_str+"\n";
	return tmp;
}

export {
	error_throw,
	error_set,
	error_append,
	error_disp
}
