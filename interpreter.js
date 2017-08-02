const tokenizer = require("./tokenizer")

var inp = `
when fib is *{
	if fib <= 1
		fibout = 1
	else if fib != 1{
	 	local n = fib;
	 	fib = n - 1;
	 	local a = fibout;
	 	fib = n - 2;
	 	local b = fibout;
	 	fibout = a + b;
	}
};

fib = 5;
print fibout;
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
	if(!scope){
		throw new Error("I dropped my scope...");
	}
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
	if(typ == "arithmatic")
		return parseArithmatic(ent, scope);
	
	if(typ == "assignment")
		return assignment(ent, scope);
	
	if(typ == "event")
		return parseEvent(ent, scope);
	
	if(typ == "ifblock")
		return ifblock(ent[1], scope);

	throw new Error("Cannot Parse Expression for type: "+typ)
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

var parseEvent = function(evnt, scope){
	evnt = evnt[1][0];
	var typ = evnt[0];
	if(typ == "is"){
		var dat = evnt[1];

		var v = dat[0][1][0][1];
		var exp = dat[2]
		var event = newEvent({type : "onChange", any: false, var: v})
		if(exp[0]=="\\*")
			event.any = true;
		else
			event.target = parseExpression(exp, scope)
		event.scope = scope;
		while(event.scope.parent && event.scope.vars[v]==undefined)
			event.scope = event.scope.parent
		return event;
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
	if(oper == "equals")
		return left == right?1:0
	if(oper == "lessthan")
		return left < right?1:0
	if(oper == "greaterthan")
		return left > right?1:0
	if(oper == "lessthanequals")
		return left <= right?1:0
	if(oper == "greaterthanequals")
		return left >= right?1:0
	if(oper == "notequals")
		return left != right?1:0
	console.error("Unknown operator token provided: "+oper)
}

var assignment = function(assign,scope){
	var dat = assign[1];
	var t = dat[0][0];
	if(t == "var"){
		var v = dat[0][1][0][1]
		var val = parseExpression(dat[2],scope)
		return assignTo(scope, false, v, val);
	}else if(t == "local"){
		var v = dat[1][1][0][1]
		var val = parseExpression(dat[3],scope)
		return assignTo(scope, true, v, val);
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
	return {vars: {}, parent: parent, events: []};
}

var newEvent = function(dat){
	dat = dat || {};
	dat.toString = ()=>`EVENT: ${dat.type}`;
	return dat;
}

var cloneEvent = function(event){
	var nEvent = {};
	for(n in event){
		nEvent[n] = event[n];
	}
	return nEvent;
}

var assignTo = function(scope, local, key, value){
	if(!local && !!scope.parent && scope.vars[key]==undefined)
		return assignTo(scope.parent, local, key, value)

	scope.vars[key] = value;
	scope.events.forEach(event=>{
		if(event.type == "onChange"){
			if(event.var == key){
				if(event.any || event.target == value){
					var nScope = newscope(event.myscope)
					runProgram(event.block, nScope);
				}
			}
		}
	});
	return scope.vars[key];
}

var ifblock = function(ifbl, scope){
	var exp = ifbl[1];
	var block = ifbl[2];
	var elif = ifbl[3];
	var res = parseExpression(exp, scope);
	if(res){
		var onTrue = block[1];
		if(block[0] == "block"){
			var nScope = newscope(scope);
			runProgram(onTrue[1][1], nScope);
		}else{
			return parseExpression(onTrue[0], scope);
		}
	}else if(elif){
		var other = elif[1][1];
		if(other[0] == "block"){
			var nScope = newscope(scope);
			runProgram(other[1][1][1], nScope);
		}
		else{
			return parseExpression(other, scope);
		}
	}
}

var getVar = function(scope, name){
	if(scope.vars[name]!=undefined)
		return scope.vars[name]
	if(scope.parent)
		return getVar(scope.parent, name)
}

var runProgram = function(tokens, p){
	var scope = p || newscope();
	var statement = tokens[0][1][0];
	var typ = statement[0];
	var dat = statement[1];
	if(typ == "assignment"){
		assignment(statement,scope)
	}else if(typ == "io"){
		io(statement,scope);
	}else if(typ == "eventblock"){
		var exp = statement[1][1];
		var block = statement[1][2][1][1][1];
		var event = parseExpression(exp, scope);
		if(event && event.scope){
			event = cloneEvent(event);
			event.block = block;
			event.myscope = scope;
			event.scope.events.push(event);
		}
	}else if(typ == "ifblock"){
		ifblock(dat, scope);
	}else{
		console.log(tokens);
		throw new Error("Unknown statement type: "+typ)
	}
	if(tokens[2])
		runProgram(tokens[2][1], scope);
}
runProgram(tokens[0])