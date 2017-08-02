const fs = require("fs")

var dat = fs.readFileSync("tokens.js", ()=>{})

var tokens = eval(dat.toString())

var parseToken = function(s){
	var t = {optional: false, name: "", type: "token"}
	s = s.replace(/\?$/, ()=>{
		t.optional = true;
		return "";
	})
	s = s.replace(/^(['"])(.*)\1$/, (all,qoute,str)=>{
		t.type = "rawtext";
		return str;
	})
	t.name = s;
	if(!tokens[s] && t.type == "token"){
		console.error("Warning: Token of name '"+s+"' requested with no matching token.")
	}
	return t;
}

var tokenify = function(s){
	var tokenMap = [];
	var curTokens = [];
	while (s.length){
		s = s.replace(/^\s*/, "") // Remove initial whitespace.
		s = s.replace(/^\s*((?:[^"']|(["']).*?\2)*?)\s*([,|]|$)/, (j,text,useless,special)=>{	// As few characters as posibile until the next special character.
			if(special == "|" || special===""){
				if(text.length > 0)
					curTokens.push(parseToken(text));
				if(curTokens.length > 0)
					tokenMap.push(curTokens);
				curTokens = [];
				return "";
			}
			if(special == ","){
				if(text.length > 0)
					curTokens.push(parseToken(text));
				return "";
			}
			return "";
		})
	}
	return tokenMap;
}

for(var name in tokens){
	tokens[name] = tokenify(tokens[name])
}

var matchToken = function(token, text){
	text = text.replace(/^\s*/,"")
	if(!token)
		return false;
	for(var i=0; i < token.length; i++){	// For each optional token.
		var t = text;
		var out = [];
		var options = token[i]
		var success = true;
		for(var c=0; c < options.length; c++){
			var tok = options[c];
			if(tok.type == "rawtext"){
				var m;
				if(m = t.match("^"+tok.name)){
					out.push([tok.name, m[0]])
					t = t.replace(new RegExp("^"+tok.name), "").replace(/^\s*/,"");
				}else if(!tok.optional){
					success = false;
					break;
				}
			}else{
				var sub = matchToken(tokens[tok.name], t)
				if(sub == false){
					if(!tok.optional){
						success = false;
						break;
					}
					continue;
				}

				out.push([tok.name, sub[0]]);
				t = sub[1];
				
			}
		}
		if(success)
			return [out, t];

	}
	return false
}

module.exports = {matchToken: matchToken, tokens: tokens, tokenize: prog=>matchToken(tokens.program, prog)}