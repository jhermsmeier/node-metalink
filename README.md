# Metalink
[![npm](https://img.shields.io/npm/v/metalink.svg?style=flat-square)](https://npmjs.com/package/metalink)
[![npm license](https://img.shields.io/npm/l/metalink.svg?style=flat-square)](https://npmjs.com/package/metalink)
[![npm downloads](https://img.shields.io/npm/dm/metalink.svg?style=flat-square)](https://npmjs.com/package/metalink)
[![build status](https://img.shields.io/travis/jhermsmeier/node-metalink/master.svg?style=flat-square)](https://travis-ci.org/jhermsmeier/node-metalink)

## Install via [npm](https://npmjs.com)

```console
$ npm install --save metalink
```

## Usage

```js
var Metalink = require( 'metalink' )
```

```js
var util = require( 'util' )
var https = require( 'https' )
var util = require( 'util' )

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
```

```js
Metalink {
  generator: 'curl Metalink Generator',
  origin: {
    dynamic: true,
    value: 'https://curl.haxx.se/metalink.cgi?curl=tar.gz'
  },
  published: Date( '2019-09-11T05:52:52.000Z' ),
  updated: Date( '2019-10-29T13:09:08.000Z' ),
  publisher: null,
  files: [
    File {
      name: 'curl-7.66.0.tar.gz',
      copyright: null,
      description: 'curl Generic source tar, gzip',
      identity: null,
      languages: [],
      logo: null,
      os: [],
      publisher: { name: 'curl', url: 'https://curl.haxx.se/' },
      signature: {
        mediatype: 'application/pgp-signature',
        value: '-----BEGIN PGP SIGNATURE-----\n' +
          '\n' +
          'iQEzBAABCgAdFiEEJ+3q8i86vOtQ25oSXMkI/bceEsIFAl14i3UACgkQXMkI/bce\n' +
          'EsJVqgf8CLhCqIHj43Asg/vWZ6AvhZyTHxxwiPQkBxbVWkOMxsp9hVKGgWQDkvq4\n' +
          'jhYRaA2oHfJfEZrZjSiyfCSY3KoFUWxk8SZ39lCAxxjdUIcYSLSvSboE8xHdia2w\n' +
          'i+1X5TY53H5bDYcOUuvt9mcSJ/vYLXyv11IdkQq1v7S/7+1x0Y83p85vYvaCU4Xu\n' +
          '8W30+Zf9DJItfmRm9+m3KtLYsgU4IaPmaA77ovc583ApIaUzio7JAuQW69DsGlrK\n' +
          'kXwWrvuG+ZoK9IjgMx1uCuzr9T0amdltnYrslRuSjCVrTaYTkpGFkmdKiGefkhD3\n' +
          'JvxHA3/nVVoEDY7iMQtFwf0KemOBcQ==\n' +
          '=1vyE\n' +
          '-----END PGP SIGNATURE-----'
      },
      size: 4066716,
      version: '7.66.0',
      hashes: [
        { type: 'md5', value: '8cb2898a9adc106075ac3cdc2b965bf6' },
        { type: 'sha-256', value: 'd0393da38ac74ffac67313072d7fe75b1fa1010eb5987f63f349b024a36b7ffb' }
      ],
      metaUrls: [],
      pieces: [],
      urls: [
        {
          priority: 30,
          location: '',
          value: 'https://curl.haxx.se/download/curl-7.66.0.tar.gz'
        },
        {
          priority: 30,
          location: 'de',
          value: 'https://dl.uxnr.de/mirror/curl/curl-7.66.0.tar.gz'
        },
        {
          priority: 30,
          location: 'sg',
          value: 'https://execve.net/mirror/curl/curl-7.66.0.tar.gz'
        },
        {
          priority: 10,
          location: 'us',
          value: 'https://curl.askapache.com/curl-7.66.0.tar.gz'
        }
      ]
    }
  ]
}
```

## References

- [RFC 5854 - The Metalink Download Description Format](https://tools.ietf.org/html/rfc5854)
- [RFC 6249 - Metalink/HTTP: Mirrors and Hashes](https://tools.ietf.org/html/rfc6249)
