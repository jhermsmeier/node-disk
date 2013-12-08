var repl = require( 'repl' )
var Disk = require( '../' )

var cli = repl.start({
  terminal: true,
  ignoreUndefined: true
})

cli.context.disk = Disk
cli.context.Disk = Disk
