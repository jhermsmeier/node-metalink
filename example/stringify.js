var Metalink = require( '..' )

var metalink = new Metalink()

metalink.origin = { dynamic: true, value: 'https://example.com/example.meta4' }
metalink.published = new Date()
metalink.updated = new Date()

var file = new Metalink.File()

file.name = 'example.txt'
file.copyright = 'Copysweet (s) 2019, Nobody'
file.description = 'An example to behold'
file.logo = 'https://example.com/logo?type=png&size=128'
file.publisher = { name: 'The Computer', url: 'https://example.com' }
file.signature = null
file.size = 1234567890
file.version = '4.6.8'

file.urls.push({
  priority: 1,
  location: 'de',
  value: 'https://example.com/example.txt',
})

metalink.files.push( file )

console.log( metalink.toString() )
