/*!
 *
 * Familiar Rivals config.
 *
 */
module.exports = function ( grunt ) {

    "use strict";

    // Default project paths.
    var pubRoot = "source",
        jsRoot = "source/javascripts",
        appRoot = jsRoot + "/app",
        libRoot = jsRoot + "/lib",
        distRoot = jsRoot + "/dist",
        nodePath = require( "path" ),
        libShopify = require( "./lib/shopify" ),
        shopifyPath = ( grunt.option( "dry-run" ) ) ? "test" : nodePath.join( __dirname, "../itsfamiliar-4001266" ),
        buildPath = nodePath.join( __dirname, "build" );


    // Point the lib to our synced theme and build
    libShopify.set( "themePath", shopifyPath );
    libShopify.set( "themePrefix", "rivals-" );
    libShopify.set( "buildPath", buildPath );

    // Project configuration.
    grunt.initConfig({
        // Project meta.
        meta: {
            version: "0.1.0"
        },

        // Nautilus config.
        nautilus: {
            options: {
                jsAppRoot: appRoot,
                jsDistRoot: distRoot,
                jsLibRoot: libRoot,
                jsRoot: jsRoot,
                pubRoot: pubRoot,
                jsGlobals: {
                    // 3rd party
                    $: true,
                    jQuery: true,
                    Hammer: true,
                    Modernizr: true,

                    // JSource
                    MediaBox: true,

                    // Funpack
                    funpack: true
                },
                hintOn: [
                    "watch",
                    "build",
                    "deploy"
                ]
            }
        }

    });


    // Load the nautilus plugin.
    grunt.loadNpmTasks( "grunt-nautilus" );

    // Register default task.
    grunt.registerTask( "default", ["nautilus:build"] );

    // Register shopify prep tasks.
    grunt.registerTask( "shopify-write", function () {
        libShopify.writeAssets();
        libShopify.writeStylesheets();
        libShopify.writeCssFontsAndImages();
        libShopify.writeJavascript();
        libShopify.writeTemplate();
    });
    grunt.registerTask( "shopify-write-assets", function () {
        libShopify.writeAssets();
    });
    grunt.registerTask( "shopify-write-css", function () {
        libShopify.writeStylesheets();
        libShopify.writeCssFontsAndImages();
    });
    grunt.registerTask( "shopify-write-js", function () {
        libShopify.writeJavascript();
    });
    grunt.registerTask( "shopify-write-template", function () {
        libShopify.writeTemplate();
    });

};