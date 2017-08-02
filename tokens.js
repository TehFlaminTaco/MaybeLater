_={
	// General
	program : 'statement, ";"?, program?',
	block: '"{", program, "}" | "{", "}"',
	var: '"[a-zA-Z_]\\w*"',
	indexexp: 'var, index | paranexp, index',
	index: '"\\[", expression, "\\]"',

	// STATEMENT
	statement: 'assignment|eventblock|io',
	assignment: '"local"?,var,"=",eitherexp | indexexp, "=", eitherexp',
	eventblock: '"when", eitherexp, block',

	// IO
	io: 'write, expression | read, "local"?, var',
	read: '"readline" | "readbyte" | "readall" | "read"',
	write: '"write" | "print"',

	// EXPRESSIONS
	expression: 'io | event | arithmatic | indexexp | constant | assignment| var',
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
	operator: 'power | mod | multiply | divide | add | subtract',
	power: '"\\^"',
	mod: '"%"',
	multiply: '"\\*"',
	divide: '"/"',
	add: '"\\+"',
	subtract: '"-"',

	// EVENT BUILDERS
	event: 'is',
	is: 'var, "is", "\\*" | var, "is", expression',
}