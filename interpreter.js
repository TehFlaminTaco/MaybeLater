const tokenizer = require("./tokenizer")

var inp = `
when (x is 3){

}
`

var tokens = tokenizer.tokenize(inp);
if(!tokens[0])
	throw new Error("INVALID..?!");
if(tokens[1])
	console.error(tokens[1])

/*var fs = require("fs");
var s = fs.fstatSync(process.stdin.fd).size;
var stdin = new Buffer(s)
fs.readSync(process.stdin.fd, stdin, 0, s)
stdin = stdin.toString();*/
var stdin = "Default STDIN";

// When executed, take an expression, return a value.
var parseExpression = function(exp,scope){
	var typ = exp[0];

	if(typ == "eitherexp")
		return parseExpression(exp[1][0],scope)

	if(typ == "paranexp")
		return parseExpression(exp[1][1],scope)

	var ent = exp[1][0];
	typ = ent[0];

	if(typ == "constant")
		return parseConstant(ent)

	if(typ == "var")
		return getVar(scope, ent[1][0][1])
	
	if(typ == "io"){
		var o = io(ent, scope);
		return o;
	}
	if(typ == "arithmatic"){
		return parseArithmatic(ent, scope);
	}
	if(typ == "assignment"){
		return assignment(ent, scope);
	}
	console.error("Cannot Parse Expression for type: "+typ)
}

var parseConstant = function(exp){
	var typ = exp[1][0][0];
	var dat = exp[1][0][1];
	if(typ == "numberconstant"){
		return Number(dat[0][1])
	}else if(typ == "stringconstant"){
		return dat[0][1].replace(/^(['\"])(.*)\1$/,"$2")
	}else if(typ == "tableconstant"){

	}else{
		console.error("Unknown constant type: "+typ)
	}
}

var parseArithmatic = function(mth, scope){
	var equa = mth[1]
	var left = equa[0];
	var oper = equa[1][1][0][0];
	var right = parseExpression(equa[2],scope); // We know _exactly_ what that is, don't waste any time.
	
	var lType = left[0];
	if(lType == "constant")
		left = parseConstant(left);
	if(lType == "var")
		left = getVar(scope, left[1][0][1]);
	if(lType == "paranexp")
		left = parseExpression(left,scope);
	if(oper == "power")
		return left ^ right
	if(oper == "mod")
		return left % right
	if(oper == "multiply")
		return left * right
	if(oper == "divide")
		return left / right
	if(oper == "add")
		return left + right
	if(oper == "subtract")
		return left - right
	console.error("Unknown operator token provided: "+oper)
}

var assignment = function(assign,scope){
	var dat = assign[1];
	var t = dat[0][0];
	if(t == "var"){
		var v = dat[0][1][0][1]
		var val = parseExpression(dat[2],scope)
		assignTo(scope, false, v, val);
		return val;
	}else if(t == "local"){
		var v = dat[1][1][0][1]
		var val = parseExpression(dat[3],scope)
		assignTo(scope, true, v, val);
		return val;
	}else if(t == "indexexp"){

	}
}

var io = function(io,scope){
	var dat = io[1];
	if(dat[0][0] == "write"){
		var nl = dat[0][1][0][1] == "print" ? "\n" : ""
		var val = parseExpression(dat[1],scope);
		process.stdout.write(val+nl)
		return val;
	}else{
		var readMethod = dat[0][1][0][0];
		var v;
		var local = false;
		if(dat[1][0] == "local"){
			local = true;
			v = dat[2][1][0][1];
		}else{
			v = dat[1][1][0][1];
		}
		if(readMethod == "readall" || readMethod == "read"){
			assignTo(scope, local, v, stdin);
			var ret = stdin;
			stdin = "";
			return ret;
		}else if(readMethod == "readline"){
			var stt = stdin.split("\n");
			var ret = stt.splice(0,1);
			assignTo(scope, local, v, ret);
			stdin = stt.join("\n");
			return ret;
		}else if(readMethod == "readbyte"){
			var stt = stdin.split("");
			var ret = stt.splice(0,1);
			assignTo(scope, local, v, ret);
			stdin = stt.join("");
			return ret;
		}
	}
}

var newscope = function(parent){
	return {vars: {}, parent: parent};
}

var assignTo = function(scope, local, key, value){
	if(!local && !!scope.parent && scope.vars[key]=="undefined")
		return assignTo(scope.parent, local, key, value)
	scope.vars[key] = value;
}

var getVar = function(scope, name){
	if(scope.vars[name])
		return scope.vars[name]
	if(scope.parent)
		return getVar(scope.parent, name)
}

var runProgram = function(tokens, p){
	scope = p || newscope();
	var statement = tokens[0][1][0];
	var typ = statement[0];
	var dat = statement[1];
	if(typ == "assignment"){
		assignment(statement,scope)
	}else if(typ == "io"){
		io(statement,scope);
	}else if(typ == "eventblock"){
		var exp = statement[1][1];
		var block = statement[1][1];
		var event = parseExpression(exp, scope);
		
	}else{
		console.log("Unknown statement type: "+typ)
	}
	if(tokens[2])
		runProgram(tokens[2][1], scope);
}
runProgram(tokens[0])