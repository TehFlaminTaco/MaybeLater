_={
	// General
	program : 'statement, ";"?, program?',
	block: '"{", program?, "}"',
	var: '"[a-zA-Z_]\\w*"',
	indexexp: 'var, index | paranexp, index',
	index: '"\\[", eitherexp, "\\]"',

	// STATEMENT
	statement: 'assignment|eventaction|ifblock|eventblock',
	assignment: '"local"?,var,"=",eitherexp | indexexp, "=", eitherexp',
	containedassignment: 'index, "=", eitherexp',
	eventblock: '"when", eitherexp, block | "when", eitherexp, eitherexp',
	ifblock: '"if", eitherexp, block, elseif? | "if", eitherexp, eitherexp, elseif?',
	elseif: '"else", block | "else", eitherexp',

	// EXPRESSIONS
	expression: 'ifblock | eventblock | eventaction | event | arithmatic | indexexp | constant | assignment| var | paranexp',
	paranexp: '"\\(", expression, "\\)"',
	eitherexp: 'expression | paranexp',
	listexp : '"\\(", expression?, expressioncont?, "\\)"',
	expressioncont: '",", expression, expressioncont?',

	// CONSTANTS
	constant: 'numberconstant | stringconstant | tableconstant',
	numberconstant: '"\\d+"',
	stringconstant: `'".*?"' | "'.*?'"`,
	tableconstant: '"{", tablefill, "}" | "{", "}"',
	tablefill: 'containedassignment, conttablefill? | assignment, conttablefill? | eitherexp, conttablefill?',
	conttablefill: '",", tablefill',

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
	event: 'is | timepassed',
	is: 'var, "is", "\\*" | var, "is", expression',
	timepassed: 'constant, timeunit, "pass" | paranexp, timeunit, "pass"',

	// EVENT ACTIONS
	eventaction: 'action, listexp | action, expression',
	action: 'destroy | read | write',
	destroy: '"destroy"',
	write: '"write" | "writebyte" | "print" | "printline"',
	read: '"read" | "readbyte" | "readall" | "readline"',

	// TIME
	// The great and powerful TACO knows only overkill.
	timeunit: 'millisecond | second | minute | hour | day | month | year | decade | century',
	millisecond: '"millisecond" | "milliseconds"',
	second: '"second" | "seconds"',
	minute: '"minute" | "minutes"',
	hour: '"hour" | "hours"',
	day: '"day" | "days"',
	month: '"month" | "months"',
	year: '"year" | "years"',
	decade: '"decade" | "decades"',
	century: '"century" | "centuries"',

}