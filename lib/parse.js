var htmlparser = require( 'htmlparser2' )
var Metalink = require( './metalink' )

class Handler {

  constructor() {
    this.document = { root: { parentNode: null } }
    this.document.root.parentNode = this.document.root
    this.currentNode = this.document.root
    this.textContent = ''
  }

  onopentag( name, attr ) {

    this.textContent = ''

    var node = {
      name: name,
      attr: attr,
      textContent: null,
      parentNode: this.currentNode,
    }

    this.currentNode.children = this.currentNode.children || []
    this.currentNode.children.push( node )
    this.currentNode = node

  }

  ontext( text ) {
    this.textContent += text
  }

  onclosetag( name ) {
    this.currentNode.textContent = this.textContent.trim()
    this.currentNode = this.currentNode.parentNode
  }

  onend() {}

  reset() {}

}

function firstChild( root, nodeName ) {
  return root && root.children && root.children.length &&
    root.children.find(( node ) => node.name === nodeName ) || null
}

function getChildren( root, nodeName ) {
  return root && root.children &&
    root.children.filter(( node ) => node.name === nodeName ) || []
}

function textContent( root, nodeName ) {
  var node = firstChild( root, nodeName )
  return node && node.textContent
}

function getFilesV4( root ) {
  return getChildren( root, 'file' ).map(( node ) => {

    var file = new Metalink.File()

    file.name = node.attr.name || null

    file.copyright = textContent( node, 'copyright' )
    file.description = textContent( node, 'description' )
    file.identity = textContent( node, 'identity' )
    file.logo = textContent( node, 'logo' )
    file.size = +textContent( node, 'size' )
    file.version = textContent( node, 'version' )

    var publisher = firstChild( node, 'publisher' )

    // NOTE: Getting text content of child elements here is not RFC-compliant,
    // but is a workaround for generators using the v3 format in v4 metalinks
    file.publisher = publisher && {
      name: publisher.attr.name || textContent( publisher, 'name' ),
      url: publisher.attr.url || textContent( publisher, 'url' ),
    }

    var signature = firstChild( node, 'signature' )

    file.signature = signature && {
      mediatype: signature.attr.mediatype,
      value: signature.textContent,
    }

    file.os = getChildren( node, 'os' )
      .map(( node ) => node.textContent )

    file.languages = getChildren( node, 'language' )
      .map(( node ) => node.textContent )

    file.hashes = getChildren( node, 'hash' ).map(( node ) => {
      return {
        type: node.attr.type || null,
        value: node.textContent,
      }
    })

    file.metaUrls = getChildren( node, 'metaurl' ).map(( node ) => {
      return {
        priority: node.attr.priority || node.attr.preference || null,
        mediatype: node.attr.mediatype || null,
        name: node.attr.name || null,
        value: node.textContent || null,
      }
    })

    file.pieces = getChildren( node, 'pieces' ).map(( pieces ) => {
      return {
        type: pieces.attr.type || null,
        length: +pieces.attr.length || null,
        hashes: getChildren( pieces, 'hash' ).map(( node ) => node.textContent )
      }
    })

    file.urls = getChildren( node, 'url' ).map(( node ) => {
      return {
        priority: +node.attr.priority || +node.attr.preference || null,
        location: node.attr.location,
        value: node.textContent,
      }
    })

    return file

  })
}

function getFilesV3( root ) {

  var fileRoot = firstChild( root, 'files' )
  if( !fileRoot ) return [];

  return getChildren( fileRoot, 'file' ).map(( node ) => {

    var file = new Metalink.File()

    file.name = node.attr.name || null

    file.copyright = textContent( node, 'copyright' )
    file.description = textContent( node, 'description' )
    file.identity = textContent( node, 'identity' )
    file.logo = textContent( node, 'logo' )
    file.size = +textContent( node, 'size' )
    file.version = textContent( node, 'version' )

    var verification = firstChild( node, 'verification' )
    var signature = firstChild( verification, 'signature' )

    file.signature = signature && {
      mediatype: signature.attr.type,
      file: signature.attr.file,
      value: signature.textContent,
    }

    file.hashes = getChildren( verification, 'hash' ).map(( node ) => {
      return {
        type: node.attr.type || null,
        value: node.textContent,
      }
    })

    file.pieces = getChildren( verification, 'pieces' ).map(( pieces ) => {
      return {
        type: pieces.attr.type || null,
        length: +pieces.attr.length || null,
        hashes: getChildren( pieces, 'hash' ).map(( node ) => node.textContent )
      }
    })

    var resources = firstChild( node, 'resources' )

    file.metaUrls = getChildren( resources, 'metaurl' ).map(( node ) => {
      return {
        priority: node.attr.priority || node.attr.preference || null,
        mediatype: node.attr.mediatype || null,
        name: node.attr.name || null,
        value: node.textContent || null,
      }
    })

    file.urls = getChildren( resources, 'url' ).map(( node ) => {
      return {
        priority: +node.attr.priority || +node.attr.preference || null,
        location: node.attr.location,
        value: node.textContent,
      }
    })

    return file

  })

}

/**
 * Parse a Metalink file
 * @param {String|Buffer} value
 * @returns {Metalink}
 */
function parse( value ) {

  var handler = new Handler()
  var parser = new htmlparser.Parser( handler, {
    xmlMode: true,
    decodeEntities: true,
    lowerCaseTags: true,
    lowerCaseAttributeNames: true,
    recognizeCDATA: true,
    recognizeSelfClosing: true,
  })

  parser.end( value )
  var doc = handler.document
  parser.parseComplete()

  var metalink = new Metalink()

  var root = firstChild( doc.root, 'metalink' )

  var origin = firstChild( root, 'origin' )
  var published = textContent( root, 'published' ) || root.attr.pubdate || null
  var updated = textContent( root, 'updated' ) || root.attr.refreshdate || null
  var publisher = firstChild( root, 'publisher' )

  metalink.origin = origin && {
    // FIXME: Do this properly
    dynamic: origin.attr.dynamic != null ? /true/.test( origin.attr.dynamic ) : null,
    value: textContent( root, 'origin' ),
  }

  // Try for metalink v3 style attributes on metalink root
  if( metalink.origin == null && root.attr.origin ) {
    metalink.origin = {
      dynamic: root.attr.type ? /dynamic/.test( root.attr.type ) : null,
      value: root.attr.origin,
    }
  }

  metalink.generator = textContent( root, 'generator' ) || root.attr.generator || null
  metalink.published = published && new Date( published )
  metalink.updated = updated && new Date( updated )

  // Support metalink v3 publisher element,
  // and non-RFC-compliant v4 publisher in metalink-root,
  // as some generators appear to do this
  metalink.publisher = publisher && {
    name: publisher.attr.name || textContent( publisher, 'name' ),
    url: publisher.attr.url || textContent( publisher, 'url' ),
  }

  var files = getFilesV4( root )

  // Fall back to metalink v3 files
  if( !files || files.length === 0 ) {
    files = getFilesV3( root )
  }

  metalink.files = files

  return metalink

}

module.exports = parse
