var path = process.argv[1].replace(/(.*?)interpreter.js$/, "$1");
const tokenizer = require("./tokenizer")(path);
const fs = require("fs");
var stdin = "";

const timeUnits = {
	millisecond: 1,
	second: 1000,
	minute: 1000 * 60,
	hour: 1000 * 60 * 60,
	day: 1000 * 60 * 60 * 24,
	month: 1000 * 60 * 60 * 24,
	year: 100 * 60 * 60 * 24 * 365,
	decade: 100 * 60 * 60 * 24 * 3652,
	century: 100 * 60 * 60 * 24 * 36520,
}

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
		return parseConstant(ent, scope)

	if(typ == "var")
		return getVar(scope, ent[1][0][1])
	
	if(typ == "arithmatic")
		return parseArithmatic(ent, scope);
	
	if(typ == "assignment")
		return assignment(ent, scope);
	
	if(typ == "event")
		return parseEvent(ent, scope);
	
	if(typ == "ifblock")
		return ifblock(ent[1], scope);

	if(typ == "eventblock")
		return eventblock(ent[1], scope);

	if(typ == "paranexp")
		return parseExpression(ent, scope);

	if(typ == "indexexp")
		return parseIndex(ent, scope);

	if(typ == "eventaction")
		return eventaction(ent[1], scope);

	throw new Error("Cannot Parse Expression for type: "+typ)
}

var parseConstant = function(exp, scope){
	var typ = exp[1][0][0];
	var dat = exp[1][0][1];
	if(typ == "numberconstant"){
		return Number(dat[0][1])
	}else if(typ == "stringconstant"){
		return dat[0][1].replace(/^(['\"])(.*)\1$/,"$2")
	}else if(typ == "tableconstant"){
		// I know for a fact I'm doing something wrong... I'll work out what...
		var tableFill = dat[1];
		var dat = newTable();
		var i = 0;
		while(tableFill[0] == "tablefill"){
			var exp = tableFill[1][0]
			if(exp[0] == "eitherexp"){
				dat[i] = parseExpression(exp, scope);
				i++;
			}
			if(exp[0] == "assignment"){
				assignmentTable(exp,dat,scope);
			}
			if(exp[0] == "containedassignment"){
				var ind = parseExpression(exp[1][0][1][1], scope);
				var expr = parseExpression(exp[1][2], scope);
				dat[ind] = expr;

			}

			if(!tableFill[1][1])
				break;

			tableFill = tableFill[1][1][1][1];
		}

		return dat;
	}else{
		console.error("Unknown constant type: "+typ)
	}
}

var parseListExp = function(exp, scope){
	if(exp[0]!="listexp" && exp[0]!="expressioncont")
		return [parseExpression(exp, scope)];
	var subexp = exp[1][1];
	if(subexp[0]!="expression")
		return [];
	var contexp = exp[1][2];
	var res1 = parseExpression(subexp, scope);
	var rest = [res1];
	if(contexp && contexp[0] == "expressioncont"){
		rest = rest.concat(parseListExp(contexp, scope));
	}
	return rest
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
	if(typ == "timepassed"){
		var dat = evnt[1];
		var n = dat[0];
		var unit = dat[1][1][0][0];
		if(n[0] == "constant")
			n = parseConstant(n, scope);
		else
			n = parseExpression(n, scope);
		var event = newEvent({type: "timePassed", time: n * timeUnits[unit]});
		return event;
	}
	throw new Error("Unknown event type: "+typ);
}

var parseIndex = function(ind, scope){
	var v = ind[1][0];
	if(v[0] == "var"){
		v = getVar(scope,v[1][0][1]);
	}else{
		v = parseExpression(v, scope);
	}
	var ind = parseExpression(ind[1][1][1][1], scope);
	try{
		return v[ind];
	}catch(e){

	}
}

var parseArithmatic = function(mth, scope){
	var equa = mth[1]
	var left = equa[0];
	var oper = equa[1][1][0][0];
	var right = parseExpression(equa[2],scope); // We know _exactly_ what that is, don't waste any time.
	
	var lType = left[0];
	if(lType == "constant")
		left = parseConstant(left, scope);
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
		var v = getVar(scope, dat[0][1][0][1][0][1]);
		var ind = parseExpression(dat[0][1][1][1][1],scope);
		var val = parseExpression(dat[2],scope);
		try{
			v[ind] = val;
		}catch(e){}
	}
}

var assignmentTable = function(assign,table,scope){
	var dat = assign[1];
	var t = dat[0][0];
	if(t == "var"){
		var v = dat[0][1][0][1]
		var val = parseExpression(dat[2],scope)
		return table[v] = val;
	}else if(t == "local"){
		var v = dat[1][1][0][1]
		var val = parseExpression(dat[3],scope)
		return table[v] = val;
	}else if(t == "indexexp"){

	}
}

var newscope = function(parent){
	return {vars: {}, parent: parent, events: []};
}

var newEvent = function(dat){
	dat = dat || {};
	dat.toString = ()=>`EVENT: ${dat.type}`;
	dat.valid = true;
	return dat;
}

var newTable = function(dat){
	dat = dat || {};
	dat.toString = ()=>JSON.stringify(dat);
	return dat;
}

var cloneEvent = function(event){
	var nEvent = {};
	for(n in event){
		nEvent[n] = event[n];
	}
	nEvent.master = event;
	return nEvent;
}

var assignTo = function(scope, local, key, value){
	if(!local && !!scope.parent && scope.vars[key]==undefined)
		return assignTo(scope.parent, local, key, value)

	scope.vars[key] = value;
	scope.events.forEach(event=>{
		if(!event.valid || (event.master && !event.master.valid))
			return;
		if(event.type == "onChange"){
			if(event.var == key){
				if(event.any || event.target == value){
					event.call();
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

var eventblock = function(evntblock, scope){
	var exp = evntblock[1];
	var block = evntblock[2];
	var event = parseExpression(exp, scope);
	var blockCall = ()=>{
		if(block[0] == "block"){
			var prgrm = block[1][1];
			if(prgrm[0] == "}")
				return;
			var nScope = newscope(scope);
			return runProgram(prgrm[1], nScope);
		}else{
			return parseExpression(block, scope);
		}
	}
	if(event){
		if(event.type == "onChange" && event.scope){
			event = cloneEvent(event);
			if(block[0] != "}"){
				event.call = blockCall;
				event.scope.events.push(event);
			}
		}else if(event.type == "timePassed"){
			setTimeout(()=>{
				if(!event.valid || (event.master && !event.master.valid))
					return;
				var nScope = newscope(scope);
				if(block[0] !== "}")
					blockCall();
			}, event.time);
		}
	}
	return event;
}

var eventaction = function(action, scope){
	var act = action[0][1][0];
	var a = act[0];
	var val = parseListExp(action[1], scope);
	if(a == "destroy"){
		val = val[0]
		if(!val || typeof val != "object")
			return;
		val.valid = false;
		return val;
	}
	if(a == "write"){
		var outType = act[1][0][0];
		var txt = "";
		for(var i=0; i<val.length; i++){
			txt += val[i].toString();
		}
		if(outType == "print" || outType == "printline"){
			process.stdout.write(txt+"\n");
			return val[0];
		}
		if(outType == "writebyte"){
			process.stdout.write(String.fromCharCode(val[0]));
			return val[0]
		}
		process.stdout.write(txt);
		return val[0];
	}
	if(a == "read"){
		var inType = act[1][0][0];
		if(inType == "read" || inType == "readall"){
			var ret = stdin;
			stdin = "";
			return ret;
		}else if(inType == "readbyte"){
			stdin = stdin.split("");
			var ret = stdin.splice(0,1);
			stdin = stdin.join("");
			return ret.charCodeAt(0);
		}else{
			stdin = stdin.split(/\n/)
			var ret = stdin.splice(0,1);
			stdin = stdin.join("\n");
			return ret;
		}
	}
	throw new Error("Unknown event action: " + a);
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
	}else if(typ == "eventblock"){
		eventblock(dat, scope);
	}else if(typ == "ifblock"){
		ifblock(dat, scope);
	}else if(typ == "eventaction"){
		eventaction(dat, scope);
	}else{
		console.log(tokens);
		throw new Error("Unknown statement type: "+typ)
	}
	if(tokens[1]){
		if(tokens[1][0]==";"){
			if(tokens[2])
				runProgram(tokens[2][1], scope);
		}else{
			runProgram(tokens[1][1], scope);
		}
	}
}


var codeFile = process.argv[2];
if(!codeFile){
	console.log(`MaybeLater v0.0.1
Call with:
	node interpreter.js <file>`)
}else{
	fs.readFile(process.argv[2], (err,data)=>{
		if(err){
			console.error("No file \""+process.argv[2]+"\" found.");
			return;
		}
		var inp = data.toString();

		var tokens = tokenizer.tokenize(inp);
		if(!tokens[0])
			throw new Error("INVALID..?!");
		if(tokens[1])
			console.error(JSON.stringify(tokens[1]))

		process.stdin.on('readable', ()=>{
			var chunk = process.stdin.read();
			if(chunk !== null)
				stdin += chunk
		})

		process.stdin.on('end', ()=>{
			runProgram(tokens[0])
		});
	})
}