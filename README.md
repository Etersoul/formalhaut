# Welcome to the formalhaut wiki!

Formalhaut is a Web Front-end Javascript framework developed with aim to improve the system development by let the developer focus on the business logic.

# Modules

## Formatting (formatting.js)

Formatting module is used to convert a typeof data, like date or numerical value to the formatted data.

### $F.format.shortDate(date)

Returns <string>:
dd MMM yyyy format date (e.g: 28 Feb 2015)

Parameter:
* date <string>: the database formatted date in yyyy-mm-dd

### $F.format.longDate(date)

Returns <string>:
dd MMMM yyyy format date (e.g: 28 February 2015)

Parameter:
* date <string>: the database formatted date in yyyy-mm-dd

### $F.format.shortTime(time)

Returns <string>:
HH:mm format time (e.g: 23:59)

Parameter:
* time <string>: time in HH:mm:ss.uuuuuu (optional without u microsecond)

### $F.format.longTime(time)

Returns <string>:
HH:mm:ss format time (e.g: 23:59:59)

Parameter:
* time <strig>: time in HH:mm:ss.uuuuuu (optional without u microsecond)

##