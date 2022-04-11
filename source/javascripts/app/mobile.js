/*!
 *
 * App Module: /mobile
 *
 * @namespace mobile
 * @memberof app
 *
 *
 */
import "app/index";
import "lib/funpack";
import { resizer, hammered, isDev } from "app/util";


var $_html = $( ".js-html" ),
    $_jsImages = $( ".js-image" ),
    $_jsIntro = $( ".js-intro" ),
    $_jsOutro = $( ".js-outro" ),
    $_jsColophon = $( ".js-colophon" ),

    _rMobiles = /iphone|ipad|ipod|android|windows phone/,
    _userAgent = window.navigator.userAgent.toLowerCase(),
    _mediaAspect = {
        imageTall: (325 / 488),
        imageSplit: (263 / 396),
        imageWide: (320 / 320)
    },

    ImageLoader = funpack( "ImageLoader" ),

/**
 *
 * Initialize mobile loading
 * @method init
 * @memberof mobile
 *
 */
init = function () {
    if ( !isMobile() ) {
        return;
    }

    // Bind all events
    resizer.on( "orientationchange", onOrientated );
    hammered.on( "tap", ".js-image", onImageTap );
    hammered.on( "tap", ".js-credits", onCreditsTap );
    hammered.on( "tap", ".js-mast", onMastTap );
    hammered.on( "tap", ".js-colophon-close", onCloseTap );

    for ( var len = $_jsImages.length, i = len; i--; ) {
        var $this = $_jsImages.eq( i ),
            dattr = $this.data( "src" ).split( "/" ),
            filen = dattr.pop().replace( /rivals-/i, "" );

        resizeImage( $this );

        filen = ( isDev() ) ? ("mobile-" + filen) : ("rivals-mobile-" + filen);
        dattr.push( filen );

        $this.attr( "data-src", dattr.join( "/" ) );
    }

    new ImageLoader({
        loadType: "sync",
        elements: $_jsImages,
        property: "data-src"
    });

    // Size the intro slide
    $_jsIntro.css({
        height: window.innerHeight,
        backgroundImage: "url( " + $_jsIntro.data( "src" ) + ")"
    });
    $_jsOutro.css( "height", window.innerHeight );

    // Allow scrolling
    $_html.removeClass( "-contain" );
},

/**
 *
 * Check for mobile UAs
 * This is only looking at higher end device types
 * @method isMobile
 * @memberof mobile
 * @returns boolean
 *
 */
isMobile = function () {
    return _rMobiles.test( _userAgent );
},

/**
 *
 * Show the image credits
 * @method onImageTap
 * @memberof mobile
 * @private
 *
 */
onImageTap = function () {
    $( ".js-credits" ).removeClass( "is-active" );
    $( this ).find( ".js-credits" ).addClass( "is-active" );
},

/**
 *
 * Hide the image credits
 * @method onCreditsTap
 * @memberof mobile
 * @private
 *
 */
onCreditsTap = function () {
    var $this = $( this );

    $this.addClass( "is-inactive" );

    setTimeout(function () {
        $this.removeClass( "is-active is-inactive" );

    }, 400 );
},

/**
 *
 * Show the about content
 * @method onMastTap
 * @memberof mobile
 * @private
 *
 */
onMastTap = function () {
    $_jsColophon.addClass( "is-active" );
},

/**
 *
 * Hide the about content
 * @method onCloseTap
 * @memberof mobile
 * @private
 *
 */
onCloseTap = function () {
    $_jsColophon.removeClass( "is-active" );
},

/**
 *
 * Size the images based on aspect ratios
 * @method resizeImage
 * @param {object} $image The image to resize
 * @memberof mobile
 * @private
 *
 */
resizeImage = function ( $image ) {
    if ( $image.is( ".image--split" ) ) {
        $image.css( "height", window.innerWidth / _mediaAspect.imageSplit );

    } else if ( $image.is( ".image--tall" ) ) {
        $image.css( "height", window.innerWidth / _mediaAspect.imageTall );

    } else {
        $image.css( "height", window.innerWidth / _mediaAspect.imageWide );
    }
},

/**
 *
 * Handle orientationchanges on device
 * @method onOrientated
 * @memberof mobile
 * @private
 *
 */
onOrientated = function () {
    for ( var len = $_jsImages.length, i = len; i--; ) {
        var $this = $_jsImages.eq( i );

        resizeImage( $this );
    }

    $_jsIntro.css( "height", window.innerWidth / _mediaAspect.imageWide );

/*
    if ( resizer.isLandscape() ) {
        console.log( "land" );

    } else {
        console.log( "port" );
    }
*/
};

/******************************************************************************
 * Export
*******************************************************************************/
export { init, isMobile };