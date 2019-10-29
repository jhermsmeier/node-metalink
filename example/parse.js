var util = require( 'util' )
var https = require( 'https' )
var Metalink = require( '..' )

https.get( 'https://curl.haxx.se/metalink.cgi?curl=tar.gz', function( res ) {

  var chunks = []

  res.on( 'readable', function() {
    var chunk = null
    while( chunk = this.read() ) {
      chunks.push( chunk )
    }
  })

  res.on( 'end', function() {
    var xml = Buffer.concat( chunks )
    console.log( util.inspect( Metalink.parse( xml ), {
      depth: null,
      colors: process.stdout.isTTY,
    }))
  })

})
