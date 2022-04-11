/*!
 *
 * App Module: /util
 *
 * @namespace util
 * @memberof app
 *
 *
 */
import "lib/funpack";

var Hammered = funpack( "Hammered" ),
    Controller = funpack( "Controller" ),
    ScrollController = funpack( "ScrollController" ),
    ResizeController = funpack( "ResizeController" ),
    ImageLoader = funpack( "ImageLoader" ),
    MediaBox = funpack( "MediaBox" ),

    cssTransform = Modernizr.prefixed( "transform" ),

/**
 *
 * Single app instanceof Hammer
 * @member hammered
 * @memberof util
 *
 */
hammered = new Hammered( document.body, {
    swipe_velocity: 0,
    stop_browser_behavior: false
}),

/**
 *
 * Single app instanceof Controller for arbitrary event emitting
 * @member emitter
 * @memberof util
 *
 */
emitter = new Controller(),

/**
 *
 * Single app instanceof Scroller
 * @member scroller
 * @memberof util
 *
 */
scroller = new ScrollController(),

/**
 *
 * Single app instanceof Resizer
 * @member resizer
 * @memberof util
 *
 */
resizer = new ResizeController(),

/**
 *
 * Single app instanceof MediaBox
 * @member mediabox
 * @memberof util
 *
 */
mediabox = new MediaBox(),

/**
 *
 * Apply a translate3d transform
 * @method translate3d
 * @param {object} el The element to transform
 * @param {string|number} x The x value
 * @param {string|number} y The y value
 * @param {string|number} z The z value
 * @memberof util
 *
 */
translate3d = function ( el, x, y, z ) {
    el.css( cssTransform, "translate3d(" + x + "," + y + "," + z + ")" );
},

/**
 *
 * Fresh query to lazyload images on page
 * @method loadImages
 * @param {object} images Optional collection of images to load
 * @param {function} handler Optional handler for load conditions
 * @param {function} callback Optional callback when loaded
 * @memberof util
 *
 */
loadImages = function ( images, handler ) {
    // Normalize the handler
    handler = (handler || function () {
        return true;
    });

    // Normalize the images
    images = (images || $( ".js-image" ));

    return new ImageLoader({
        elements: images,
        property: "data-src"

    // Default handle method. Can be overriden.
    }).on( "handle", handler );
},

/**
 *
 * Determine if we are on dev environment
 * @method isDev
 * @memberof util
 * @returns boolean
 *
 */
isDev = function () {
    return ( app.env === "development" );
};

/******************************************************************************
 * Export
*******************************************************************************/
export { hammered, emitter, scroller, resizer, mediabox, translate3d, loadImages, isDev };