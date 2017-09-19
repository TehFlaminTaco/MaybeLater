_={
	// General
	program : 'statement, ";"?, program?',
	block: '"{", program?, "}"',
	var: '"[a-zA-Z_]\\w*"',
	indexexp: 'var, index | paranexp, index',
	index: '"\\[", eitherexp, "\\]"',

	// STATEMENT
	statement: 'assignment|incrementer|eventaction|ifblock|eventblock',
	assignment: '"local"?,var,"=",eitherexp | indexexp, "=", eitherexp',
	containedassignment: 'index, "=", eitherexp',
	eventblock: '"when", eitherexp, block | "when", eitherexp, eitherexp',
	ifblock: '"if", eitherexp, block, elseif? | "if", eitherexp, eitherexp, elseif?',
	elseif: '"else", block | "else", eitherexp',

	// EXPRESSIONS
	expression: 'ifblock | eventblock | eventaction | event | arithmatic | indexexp | constant | assignment| incrementer| var | paranexp',
	paranexp: '"\\(", expression, "\\)"',
	eitherexp: 'expression | paranexp',
	listexp : '"\\(", expression?, expressioncont?, "\\)"',
	expressioncont: '",", expression, expressioncont?',

	// INCREMEMTERS
	// +=, ++, -=, --
	incrementer: 'var, plspls | var, plseq, eitherexp',
	plspls: '"\\+\\+" | "--"',
	plseq: '"\\+=" | "-="',

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
	action: 'destroy | read | write | ord | chr | eval',
	destroy: '"destroy"',
	write: '"writebyte" | "write" | "printline" | "print"',
	read: '"readbyte" | "readall" | "readline" | "read"',
	ord: '"ord" | "ordinal" | "byte"',
	chr: '"chr" | "character"',
	eval: '"eval" | "exec" | "run" | "do"',

	// TIME
	// The great and powerful TACO knows only overkill.
	timeunit: 'millisecond | second | minute | hour | day | month | year | decade | century',
	millisecond: '"millisecond" | "milliseconds" | "ms"',
	second: '"second" | "seconds" | "s"',
	minute: '"minute" | "minutes" | "m"',
	hour: '"hour" | "hours" | "h"',
	day: '"day" | "days" | "d"',
	month: '"month" | "months" | "M"',
	year: '"year" | "years" | "Y"',
	decade: '"decade" | "decades" | "D"',
	century: '"century" | "centuries" | "C"',

}