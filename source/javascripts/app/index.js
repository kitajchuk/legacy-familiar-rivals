/*!
 *
 * App Module: /index
 *
 * This module controls when the overlay is shown
 * as well as handles disabling/enabling of scroll.
 *
 * @namespace index
 * @memberof app
 *
 *
 */
import { emitter, hammered, mediabox } from "app/util";

var $_window = $( window ),
    $_jsIndex = $( ".js-index" ),
    $_jsIndexSlides = $( ".js-index-slides" ),
    $_jsIndexSlider = $( ".js-index-slider" ),
    $_jsColophon = $( ".js-colophon" ),
    $_jsPage = $( ".js-page" ),
    $_jsIndexSlideItems,

    _isActive = false,

/**
 *
 * Initialize the index
 * @method init
 * @memberof index
 * @event slide-index-build
 *
 */
init = function () {
    hammered.on( "tap", ".js-index-slide", onIndexClose );
    hammered.on( "tap", ".js-colophon-open", onColophonOpen );
    hammered.on( "tap", ".js-colophon-close", onColophonClose );
    hammered.on( "tap", ".js-index, .js-colophon", onIndexColophonTap );
    hammered.on( "tap", ".js-index", onIndexTap );
    hammered.on( "tap", ".js-mast-colophon", onColophonOpen );

    $_jsIndexSlides.on( "scroll", onIndexScroll );
    $_jsIndexSlides.on( "DOMMouseScroll mousewheel", onIndexWheel );

    emitter.on( "slide-index-build", onIndexBuild );
},

/**
 *
 * Show the overlay
 * @method show
 * @fires index-open
 * @memberof index
 *
 */
show = function () {
    _isActive = true;

    emitter.fire( "index-open" );

    setTimeout(function () {
        $_jsIndex.addClass( "is-active" );

    }, 400 );
},

/**
 *
 * Hide the overlay
 * @method hide
 * @fires index-close
 * @memberof index
 *
 */
hide = function () {
    $_jsIndex.addClass( "is-inactive" );

    emitter.fire( "index-close" );

    setTimeout(function () {
        _isActive = false;

        $_jsIndex.removeClass( "is-active is-inactive" );

        $_jsIndexSlides.scrollLeft( 0 ).removeClass( "is-active" );

    }, 400 );
},

/**
 *
 * Tell if overlay is showing
 * @method isActive
 * @memberof index
 * @returns boolean
 *
 */
isActive = function () {
    return _isActive;
},

/**
 *
 * Event handler for opening index
 * @method triggerOpen
 * @param {object} $elem The jquery element to use for opening the index
 * @memberof index
 *
 */
triggerOpen = function ( $elem ) {
    var id = $elem.data( "id" ),
        index = $elem.data( "index" ),
        $slide = $( ".js-index-slide[data-index='" + index + "']" ).parent(),
        offset = $slide.offset().left - ((window.innerWidth / 2) - ($slide.width() / 2)) - 50,
        videoId,
        seekTo;

    $_jsIndexSlides.scrollLeft( offset );

    setTimeout(function () {
        $_jsIndexSlides.addClass( "is-active" );

    }, 800 );

    setTimeout(function () {
        // Handle syncing video playback
        if ( $elem.is( "video" ) ) {
            videoId = (id + "-" + index);
            seekTo = mediabox.getVideoProp( id, "currentTime" );

            mediabox.setVideoProp( videoId, "currentTime", seekTo );
            mediabox.playVideo( videoId );
        }

    }, 400 );

    show();
},

/**
 *
 * Allow tap anywhere on index to close it
 * @method onIndexTap
 * @param {object} e The event object
 * @memberof index
 * @private
 *
 */
onIndexTap = function ( e ) {
    var $target = $( e.target );

    // Colophon is NOT open, target meets requirements for what it is NOT
    if ( !$_jsColophon.is( ".is-active" ) && !$target.is( "a, .js-index-slide" ) ) {
        hide();
    }
},

/**
 *
 * Allow tap anywhere on colophon to close it
 * @method onIndexColophonTap
 * @param {object} e The event object
 * @memberof index
 * @private
 *
 */
onIndexColophonTap = function ( e ) {
    var $target = $( e.target );

    // Colophon is open and target isn't a link
    if ( $_jsColophon.is( ".is-active, .is-active-full" ) && !$target.is( "a" ) ) {
        onColophonClose();
    }
},

/**
 *
 * Receive the content created for the index based on feed
 * @method onIndexBuild
 * @param {object} $elements The content to inject into container
 * @memberof index
 * @private
 *
 */
onIndexBuild = function ( $elements ) {
    $_jsIndexSlider.append( $elements );
    $_jsIndexSlideItems = $elements;
},

/**
 *
 * Hijack scroll to allow vertical mousewheel to move horizontally
 * @method onIndexWheel
 * @memberof index
 * @private
 *
 */
onIndexWheel = function ( e ) {
    var event = e.originalEvent,
        delta = 0,
        steps = 10,
        change;

    if ( event.detail ) {
        delta = event.detail * -240;

    } else if ( event.wheelDelta ) {
        delta = event.wheelDelta * 5;
    }

    change = delta / 120 * steps;

    this.scrollLeft -= change;

    e.preventDefault();
},

/**
 *
 * Stop / Play videos in index scroll container
 * @method onIndexScroll
 * @memberof index
 * @private
 *
 */
onIndexScroll = function () {
    for ( var len = $_jsIndexSlideItems.length, i = len; i--; ) {
        var $this = $_jsIndexSlideItems.eq( i ),
            $elem = $this.find( ".js-index-slide" ),
            offsetLeft = $this.offset().left,
            offsetWidth = $this.width(),
            videoId;
        
        if ( $elem.is( "video" ) ) {
            videoId = ($elem.data( "id" ) + "-" + $elem.data( "index" ));

            if ( offsetLeft <= window.innerWidth && (offsetLeft + offsetWidth) >= 0 ) {
                mediabox.playVideo( videoId );

            } else {
                mediabox.stopVideo( videoId );
            }
        }
    }
},

/**
 *
 * Event handler for closing index
 * @method onIndexClose
 * @memberof index
 * @private
 *
 */
onIndexClose = function () {
    var $this = $( this ),
        index = $this.data( "index" ),
        $elem = $( ".js-slides [data-index='" + index + "']" ),
        slideOffset = $elem.offset().top,
        pageOffset = $_jsPage.offset().top,
        videoId,
        seekTo;

    $_window.scrollTop( slideOffset - pageOffset );

    // Handle syncing video playback
    if ( $this.is( "video" ) ) {
        videoId = $this.data( "id" );
        seekTo = mediabox.getVideoProp( (videoId + "-" + index), "currentTime" );

        mediabox.setVideoProp( videoId, "currentTime", seekTo );
        mediabox.playVideo( videoId );
    }

    hide();
},

/**
 *
 * Event handler for opening colophon
 * @method onColophonOpen
 * @param {object} e The event object
 * @memberof index
 * @private
 *
 */
onColophonOpen = function ( e ) {
    e.preventDefault();
    e.gesture.preventDefault();

    $_jsColophon.addClass( (_isActive) ? "is-active" : "is-active-full" );

    mediabox.stopChannel( "idx" );
},

/**
 *
 * Event handler for closing colophon
 * @method onColophonClose
 * @memberof index
 * @private
 *
 */
onColophonClose = function () {
    $_jsColophon.addClass( "is-inactive" );

    setTimeout(function () {
        $_jsColophon.removeClass( "is-active is-active-full is-inactive" );

    }, 400 );

    mediabox.playChannel( "idx" );
};


/******************************************************************************
 * Export
*******************************************************************************/
export { init, show, hide, isActive, triggerOpen };