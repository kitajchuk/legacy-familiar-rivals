/*!
 *
 * Shopify parser.
 *
 */
var grunt = require( "grunt" ),
    nodePath = require( "path" ),

    _ = grunt.util._,

shopify = {
    tag: "{{ '$1' | asset_url }}",

    themePath: null,
    themePrefix: "",
    buildPath: "",

    set: function ( key, value ) {
        this[ key ] = value;
    },

    prefixFile: function ( abspath, rootdir, subdir, filename ) {
        filename = (shopify.themePrefix + filename.replace( new RegExp( "^" + shopify.themePrefix, "i" ), "" ));

        var pathparts = abspath.split( "/" );
            pathparts.pop();
            pathparts.push( filename );

        grunt.file.copy( abspath, nodePath.join( shopify.themePath, "assets", filename ) );
    },

    writeAssets: function () {
        grunt.file.recurse( nodePath.join( shopify.buildPath, "video" ), shopify.prefixFile );
        grunt.file.recurse( nodePath.join( shopify.buildPath, "fonts" ), shopify.prefixFile );
        grunt.file.recurse( nodePath.join( shopify.buildPath, "images" ), shopify.prefixFile );
    },

    writeStylesheets: function () {
        grunt.file.recurse( nodePath.join( shopify.buildPath, "stylesheets" ), shopify.prefixFile );
    },

    writeJavascript: function () {
        shopify.prefixFile( nodePath.join( shopify.buildPath, "javascripts/dist/app.js" ), null, null, "app.js" );
        shopify.prefixFile( nodePath.join( shopify.buildPath, "javascripts/lib/modernizr.js" ), null, null, "modernizr.js" );
    },

    writeTemplate: function () {
        var html = grunt.file.read( nodePath.join( shopify.buildPath, "index.html" ) ),
            rsrc = /src=\"[^\"]+\"|data-src=\"[^\"]+\"/g,
            srcs = html.match( rsrc );

        // Replace the one css href
        html = html.replace( "stylesheets/screen.css", shopify.tag.replace( "$1", shopify.themePrefix + "screen.css" ) );

        // Replace the share image content
        html = html.replace( /images\/share\.png/g, shopify.tag.replace( "$1", shopify.themePrefix + "share.png" ) );

        _.each( srcs, function ( el ) {
            var data = [],
                attr = el.split( "=" ),
                src = attr[ 1 ].replace( /\"|\'/g, "" ).split( "|" );

            _.each( src, function ( e ) {
                var s = (shopify.themePrefix + e.split( "/" ).pop().replace( new RegExp( "^" + shopify.themePrefix, "i" ), "" ));

                data.push( shopify.tag.replace( "$1", s ) );
            });

            html = html.replace( el, (attr[ 0 ] + "=\"" + data.join( "|" ) + "\"") );
        });

        grunt.file.write( nodePath.join( shopify.themePath, "templates", "page.rivals.liquid" ), ("{% layout none %}\n" + html) );
    },

    writeCssFontsAndImages: function () {
        var css = grunt.file.read( nodePath.join( shopify.buildPath, "stylesheets/screen.css" ) ),
            fonts = css.match( /\"\.\.\/fonts\/.*?\"/g ),
            images = css.match( /\"\.\.\/images\/.*?\"/g );
        
        _.each( fonts, function ( el ) {
            var font = el.replace( /^\"\.\.\/fonts\/|#.*?\"$|\?#.*?\"$|\"$/g, "" );
            
            css = css.replace( el, shopify.tag.replace( "$1", shopify.themePrefix + font.replace( new RegExp( "^" + shopify.themePrefix, "i" ), "" ) ) );
        });

        _.each( images, function ( el ) {
            var image = el.replace( /^\"\.\.\/images\/|\"$/g, "" );
            
            css = css.replace( el, shopify.tag.replace( "$1", shopify.themePrefix + image.replace( new RegExp( "^" + shopify.themePrefix, "i" ), "" ) ) );
        });

        grunt.file.write( nodePath.join( shopify.themePath, "assets", shopify.themePrefix + "screen.css.liquid" ), css );
    }
};

module.exports = shopify;