_={
	// General
	program : 'statement, ";"?, program?',
	block: '"{", program, "}" | "{", "}"',
	var: '"[a-zA-Z_]\\w*"',
	indexexp: 'var, index | paranexp, index',
	index: '"\\[", expression, "\\]"',

	// STATEMENT
	statement: 'assignment|ifblock|eventblock|io',
	assignment: '"local"?,var,"=",eitherexp | indexexp, "=", eitherexp',
	eventblock: '"when", eitherexp, block',
	ifblock: '"if", eitherexp, block, elseif? | "if", eitherexp, eitherexp, elseif?',
	elseif: '"else", block | "else", eitherexp',

	// IO
	io: 'write, eitherexp | read, "local"?, var',
	read: '"readline" | "readbyte" | "readall" | "read"',
	write: '"write" | "print"',

	// EXPRESSIONS
	expression: 'ifblock | eventblock | io | event | arithmatic | indexexp | constant | assignment| var',
	paranexp: '"\\(", expression, "\\)"',
	eitherexp: 'expression | paranexp',

	// CONSTANTS
	constant: 'numberconstant | stringconstant | tableconstant',
	numberconstant: '"\\d+"',
	stringconstant: `'".*?"' | "'.*?'"`,
	tableconstant: '"{", tablefill, "}" | "{", "}"',
	tablefill: 'expression , ",", tablefill | expression',

	// OPERATORS
	arithmatic: 'paranexp, operator, eitherexp | constant, operator, eitherexp | var, operator, eitherexp',
	operator: 'power | mod | multiply | divide | add | subtract | equals | lessthanequals | greaterthanequals | notequals | lessthan | greaterthan',
	power: '"\\^"',
	mod: '"%"',
	multiply: '"\\*"',
	divide: '"/"',
	add: '"\\+"',
	subtract: '"-"',

	// COMPARISONS
	equals: '"=="',
	lessthan: '"<"',
	greaterthan: '">"',
	lessthanequals: '"<="',
	greaterthanequals: '">="',
	notequals: '"!="',

	// EVENT BUILDERS
	event: 'is',
	is: 'var, "is", "\\*" | var, "is", expression',
}