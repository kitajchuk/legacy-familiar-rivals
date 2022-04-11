import "node_modules/hammerjs/hammer";
import "node_modules/jquery/dist/jquery";
import "app/index";
import "app/slides";
import "app/mobile"
import "lib/funpack";
import { emitter, mediabox } from "app/util";


var $_window = $( window ),
    $_body = $( ".js-body" ),
    $_jsPage = $( ".js-page" );


/**
 *
 * Listen for index screen to display
 * @event index-open
 *
 */
emitter.on( "index-open", function () {
    mediabox.stopVideo( "intro" );

    $_jsPage.addClass( "is-inactive" );
});

/**
 *
 * Listen for index screen to hide
 * @event index-close
 *
 */
emitter.on( "index-close", function () {
    mediabox.playVideo( "intro" );

    setTimeout(function () {
        $_jsPage.removeClass( "is-inactive" );

    }, 400 );
});

/**
 *
 * Hijack #hash links
 * @event hash-click
 *
 */
$_body.on( "click", "[href=#]", function ( e ) {
    e.preventDefault();
});

/**
 *
 * Start app on window.onload
 *
 */
$_window.on( "load", function () {
    // Roughing out the mobiles...
    if ( mobile.isMobile() ) {
        mobile.init();
        return false;
    }

    // Force experience to start at top of page
    $( "html, body" ).animate( {scrollTop: 0}, "fast" );

    // Full experience
    index.init();
    slides.init();
});