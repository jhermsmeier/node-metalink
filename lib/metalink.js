var pkg = require( '../package.json' )

// TODO: Check paths in `metaUrl.name` for:
// @see https://tools.ietf.org/html/rfc5854#section-4.2.8.3
//   The path MUST NOT contain any directory traversal directives or information.
//   The path MUST be relative. The path MUST NOT begin with a "/", "./", or "../"; contain "/../"; or end with "/..".

class Metalink {

  constructor( options ) {

    options = options || {}

    /** @type {String} Generating agent name and version */
    this.generator = options.generator || Metalink.GENERATOR
    /**
     * URI where the Metalink Document was originally published.
     * If the `dynamic` attribute is `true`,
     * updated versions of the Metalink can be found at this URI.
     * @type {Object}
     * @property {Boolean|null} dynamic
     * @property {String} value
     */
    this.origin = options.origin || null
    /** @type {Date} Time the Metalink was initially created / published */
    this.published = options.published || null
    /** @type {Date} Time when the Metalink was modified in a way considered significant */
    this.updated = options.updated || null
    /** @type {Object} Publisher name & url */
    this.publisher = options.publisher || null
    /** @type {Array<Metalink.File>} File entries of the Metalink */
    this.files = options.files ?
      [].concat( options.files ).map( Metalink.File.from ) : []

  }

  static from( value ) {
    return new Metalink( value )
  }

  /**
   * Stringify a Metalink as XML
   * @param {String} [version='4.0']
   * @returns {String}
   */
  toString( version ) {
    return Metalink.encode( this, version )
  }

}

Metalink.File = class File {

  constructor( options ) {

    options = options || {}

    this.name = options.name || null
    /** @type {String} Human-readable copyright for the file */
    this.copyright = options.copyright || null
    /** @type {String} Human-readable file description */
    this.description = options.description || null
    /** @type {String} Human-readable identity of the file (i.e. "Firefox" for Firefox 70.0) */
    this.identity = options.identity || null
    /** @type {Array<String>} Code for the language(s) of the file. */
    this.languages = options.languages ? [].concat( options.languages ) : []
    /** @type {String} URI reference to an image that provides visual identification */
    this.logo = options.logo || null
    /** @type {Array<String>} Operating System that a file is suitable for. The IANA registry named "Operating System Names" defines values for OS types. */
    this.os = options.os ? [].concat( options.os ) : []
    /** @type {String} Human-readable group or other entity that has published the file */
    this.publisher = options.publisher || null
    /** @type {String} Digital signature for the file */
    this.signature = options.signature || null
    /** @type {String} Length of the linked content in octets (bytes) */
    this.size = options.size != null ? options.size : null
    /** @type {String} Human-readable version for a file (i.e. 2.8.6) */
    this.version = options.version || null

    /** @type {Array} Cryptographic hash for the file */
    this.hashes = options.hashes ? options.hashes.map(( hash ) => {
      return {
        type: hash.type || null,
        value: hash.value || null,
      }
    }) : []

    /** @type {Array<Object>} URIs of metadata files about the resource to download (i.e. a .torrent file, Magnet-URI, or another a Metalink Document) */
    this.metaUrls = options.metaUrls ? options.metaUrls.map(( url ) => {
      return {
        priority: url.priority || url.preference || null,
        mediatype: url.mediatype || null,
        name: url.name || null,
        value: url.value || null,
      }
    }) : []

    /** @type {Object} List of hashes of pieces of the file */
    this.pieces = options.pieces ? options.pieces.map(( pieces ) => {
      return {
        type: pieces.type || null,
        length: pieces.length || null,
        hashes: [].concat( pieces.hashes )
      }
    }) : []

    /** @type {Array<Object>} File URIs */
    this.urls = options.urls ? options.urls.map(( url ) => {
      return { priority: url.priority, location: url.location, value: url.value }
    }) : []

  }

  static from( value ) {
    return new Metalink.File( value )
  }

  /**
   * Stringify the Metalink file as XML
   * @param {String} [version='4.0']
   * @returns {String}
   */
  toString( version ) {
    return Metalink.encodeFile( this, version )
  }

}

module.exports = Metalink

/**
 * Supported Metalink versions
 * @type {Array}
 * @constant
 * @default
 */
Metalink.VERSIONS = [ '3.0', '4.0' ]

/**
 * Metalink file media type
 * @type {String}
 * @constant
 * @default
 */
Metalink.MIME_TYPE = 'application/metalink4+xml'

/**
 * Metalink XML namespace
 * @type {String}
 * @constant
 * @default
 */
Metalink.XMLNS = 'urn:ietf:params:xml:ns:metalink'

/**
 * Metalink XML namespace prefix
 * @type {String}
 * @constant
 * @default
 */
Metalink.XMLNS_PREFIX = 'metalink:'

/**
 * Language element regular expression
 * @type {RegExp}
 * @constant
 */
Metalink.LANGUAGE_PATTERN = /^[A-Za-z]{1,8}(-[A-Za-z0-9]{1,8})*$/

/**
 * Maximum allowed priority value for URLs
 * @type {Number}
 * @constant
 * @default
 */
Metalink.MAX_PRIORITY = 999999

/**
 * Default generator string
 * @type {Number}
 * @constant
 * @default
 */
Metalink.GENERATOR = `${ pkg.name }/${ pkg.version } ` +
  `${ process.release.name }/${ process.versions[ process.release.name ] }`

/**
 * Container Elements
 * @type {Array}
 * @see {@link https://tools.ietf.org/html/rfc5854#section-4.1|RFC 5854 Section 4.1, Container Elements}
 * @constant
 */
Metalink.TAGS = [
  'metalink',
  'file', // +
  'generator', // ?
  'origin', // ?
  'published', // ?
  'updated', // ?
  // 'extensionElement', // *
]

/**
 * Metadata Elements
 * @type {Array}
 * @see {@link https://tools.ietf.org/html/rfc5854#section-4.2|RFC 5854 Section 4.2, Metadata Elements}
 * @constant
 */
Metalink.FILE_TAGS = [
  'copyright', // ?
  'description', // ?
  'hash', // *
  'identity', // ?
  'language', // *
  'logo', // ?
  'metaurl', // *
  'os', // *
  'pieces', // *
  'publisher', // ?
  'signature', // ?
  'size', // ?
  'url', // *
  'version', // ?
  // 'extensionElement', // *
]

/**
 * Metalink XML element attributes
 * @type {Map}
 * @constant
 */
Metalink.ATTRS = new Map([
  [ 'file', { names: [ 'name' ], required: [ 'name' ] } ],
  [ 'pieces', { names: [ 'type', 'length' ], required: [ 'type', 'length' ] } ],
  [ 'hash', { names: [ 'type' ], required: [ 'type' ] } ],
  [ 'metaurl', { names: [ 'priority', 'mediatype', 'name' ], required: [ 'mediatype' ] } ],
  [ 'origin', { names: [ 'dynamic' ], required: [] } ],
  [ 'publisher', { names: [ 'name', 'url' ], required: [ 'name' ] } ],
  [ 'signature', { names: [ 'mediatype' ], required: [ 'mediatype' ] } ],
  [ 'url', { names: [ 'priority', 'location' ], required: [] } ],
])

/**
 * @internal XML-escape a value
 * @param {String} value
 * @returns {String}
 */
function xmlEscape( value ) {
  return value.toString()
    .replace( /&/g, '&amp;' )
    .replace( /</g, '&lt;' )
    .replace( />/g, '&gt;' )
    .replace( /"/g, '&quot;' )
    .replace( /'/g, '&#039;' )
}

/**
 * @internal Render an XML tag with given value & attributes
 * @param {String} name
 * @param {Object|String} data
 * @returns {String} xml
 */
function tag( name, data ) {

  var type = typeof data
  var isPrimitive = type == 'string' ||
    type == 'number' ||
    type == 'boolean' ||
    data instanceof Date ||
    data instanceof BigInt

  if( isPrimitive ) {
    return `<${name}>${ xmlEscape( data || '' ) }</${name}>`
  } else {
    var attrs = Object.keys( data ).reduce(( attrs, key ) => {
      if( key && key !== 'value' && data[ key ] ) {
        attrs += ` ${key}="${ xmlEscape( data[ key ] || '' ) }"`
      }
      return attrs
    }, '' )
    return `<${ name }${ attrs }>${ xmlEscape( data.value || '' ) }</${ name }>`
  }

}

Metalink.parse = require( './parse' )

/**
 * Stringify a Metalink as XML
 * @param {String} [version='4.0']
 * @returns {String}
 */
Metalink.encode = function( metalink, version ) {

  version = version || '4.0'

  if( !Metalink.VERSIONS.includes( version ) ) {
    throw new Error( `Invalid or unsupported Metalink version "${version}"` )
  }

  var metadata = []

  if( metalink.generator ) metadata.push( tag( 'generator', metalink.generator ) )
  if( metalink.origin ) metadata.push( tag( 'origin', metalink.origin ) )
  if( metalink.published ) metadata.push( tag( 'published', metalink.published.toISOString() ) )
  if( metalink.updated ) metadata.push( tag( 'updated', metalink.updated.toISOString() ) )

  var meta = metadata.length ?
    metadata.join( '\n  ' ) + '\n  ' : ''

  var files = metalink.files ?
    metalink.files.map( file => file.toString( version ) ).join( '' ) : ''

  return `<?xml version="1.0" encoding="utf-8"?>
<metalink xmlns="${Metalink.XMLNS}">
  ${ meta }${ files }
</metalink>
`

}

/**
 * Stringify a Metalink file as XML
 * @param {String} [version='4.0']
 * @returns {String}
 */
Metalink.encodeFile = function( file, version ) {

  version = version || '4.0'

  if( !Metalink.VERSIONS.includes( version ) ) {
    throw new Error( `Invalid or unsupported Metalink version "${version}"` )
  }

  var metadata = []

  if( file.copyright ) metadata.push( tag( 'copyright', file.copyright ) )
  if( file.description ) metadata.push( tag( 'description', file.description ) )
  if( file.identity ) metadata.push( tag( 'identity', file.identity ) )
  if( file.logo ) metadata.push( tag( 'logo', file.logo ) )
  if( file.publisher ) metadata.push( tag( 'publisher', file.publisher ) )
  if( file.signature ) metadata.push( tag( 'signature', file.signature ) )
  if( Number.isFinite( file.size ) ) metadata.push( tag( 'size', file.size ) )
  if( file.version ) metadata.push( tag( 'version', file.version ) )

  if( file.os ) file.os.forEach(( os ) => os && metadata.push( tag( 'os', os ) ) )
  if( file.languages ) file.languages.forEach(( language ) => language && metadata.push( tag( 'language', language ) ) )
  if( file.urls ) file.urls.forEach(( url ) => url && metadata.push( tag( 'url', url ) ) )
  if( file.metaUrls ) file.metaUrls.forEach(( url ) => url && metadata.push( tag( 'metaurl', url ) ) )
  if( file.hashes ) file.hashes.forEach(( hash ) => hash && metadata.push( tag( 'hash', hash ) ) )

  if( file.pieces ) {
    file.pieces.forEach(( pieces ) => {
      metadata.push( `<pieces type="${ xmlEscape( pieces.type || '' ) }" length="${ xmlEscape( pieces.length || '' ) }">` )
      pieces.hashes.forEach(( hash ) => metadata.push( tag( 'hash', hash || '' ) ) )
      metadata.push( `</pieces>` )
    })
  }

  return `<file name="${ file.name }">
    ${ metadata.join( '\n    ' ) }
  </file>`

}
