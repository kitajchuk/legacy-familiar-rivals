/*!
 *
 * App Module: /slides
 *
 * @namespace slides
 * @memberof app
 *
 *
 */
import "app/index";
import { hammered, emitter, resizer, scroller, mediabox, translate3d, loadImages, isDev } from "app/util";

var $_body = $( ".js-body" ),
    $_html = $( ".js-html" ),
    $_document = $( document ),
    $_jsSlides = $( ".js-slide" ),
    $_jsSlidesLast = $_jsSlides.last(),
    $_jsIndexSlides = $( [] ),
    $_jsLoaderMark = $( ".js-loader-mark" ),
    $_jsVideos = $( ".js-video" ),
    $_jsImages = $( ".js-image" ),
    $_jsMasts = $( ".js-mast" ),
    $_jsLoader = $( ".js-loader" ),
    $_jsLoaderInfo = $( ".js-loader-info" ),
    $_jsLoaderBar = $( ".js-loader-bar" ),
    $_jsOutros = $( ".js-outros" ),
    $_videoSlide = null,

    _isReady = false,
    _isAutoAdvance = false,
    _isKeyEnabled = false,
    _isMastHidden = true,
    _isMastHiddenByKey = false,
    _isMastIntroduced = false,
    _isFade2Black = false,

    _videoConfig = {
        width: 1280,
        height: 720,
        aspect: (1280 / 720),
        minWidth: 320
    },

    _keys = {
        // Devance 1 slide
        UP: 38,

        // Close the index
        ESC: 27,

        // Toggle the white bars
        CTRL: 17,

        // Advance 1 slide
        DOWN: 40,

        // Toggle the credits
        SPACE: 32,

        // Open index at current slide
        ENTER: 13
    },

    _slidesLength = $_jsSlides.length,
    _slidesMinusLast = (_slidesLength - 1),
    _currentSlide = 0,

    _mediaLoaded = 0,
    _mediaToLoad = ($_jsImages.length + $_jsVideos.length),

    Easing = funpack( "Easing" ),
    scroll2 = funpack( "scroll2" ),
    debounce = funpack( "debounce" ),

    math = Math,
    mathAbs = math.abs,
    mathPow = math.pow,
    mathMin = math.min,
    mathRound = math.round,


/******************************************************************************
 * Init
*******************************************************************************/
/**
 *
 * Initialize the slides
 * @method init
 * @memberof slides
 * @event index-open
 * @event index-close
 *
 */
init = function () {
    // Bind all events
    resizer.on( "resize", onResizer );
    scroller.on( "scroll", onScroller );

    $_document.on( "keyup", onKeyUp );
    $_document.on( "keydown", onKeyDown );

    hammered.on( "tap", ".js-index-link", onIndexLink );
    hammered.on( "tap", ".js-image", onCreditsOpen );
    hammered.on( "tap", ".js-credits", onCreditsClose );
    hammered.on( "tap", ".js-rivals-link", onRivalsLink );

    emitter.on( "index-open", function () {
        hideMasts();
    });
    
    emitter.on( "index-close", function () {
        if ( _isMastIntroduced && _isMastHidden && !_isMastHiddenByKey ) {
            showMasts();
        }
    });

    emitter.on( "onload-script-pinterest", function () {
        $( "style" ).remove();
    });

    // Shows the logo and info graphics
    $_jsLoaderMark.addClass( "is-active" );
    setTimeout(function () {
        pepperIntro( false );

    }, 800 );

    // Sizes all the slides
    resizeSlides();

    // Load videos and images up front
    loadVideos();
    loadImages( $_jsImages ).on( "load", function () {
        _mediaLoaded++;
    });

    // Run the cycle until all is loaded
    emitter.go(function () {
        $_jsLoaderBar.css( "width", (mathRound( (_mediaLoaded / _mediaToLoad) * 100 ) + "%") );

        //console.log( _mediaLoaded + " vs " + _mediaToLoad );

        if ( _mediaLoaded >= _mediaToLoad ) {
            emitter.stop();

            onInitLoaded();
        }
    });
},

/**
 *
 * Handle intro when immediate content is loaded
 * @method onInitLoaded
 * @memberof slides
 *
 */
onInitLoaded = function () {
    // Add MediaBox elements to slides
    //replaceVideos();

    // Delay the loader fade-out
    setTimeout(function () {
        // Resize images that are loaded
        resizeImages();

        // Size video elements by className
        resizeVideos();

        // Build the slide index reference
        buildSlideIndex();

        mediabox.fadeVolumeIn( "intro", 5000, Easing.easeInOutCubic );

        // Exit animation for loader bar
        $_jsLoaderBar.addClass( "is-loaded" );

        // Enable keys to be captured
        _isKeyEnabled = true;

        // Fade out the load screen + fade in the intro slide
        setTimeout(function () {
            $_jsLoader.addClass( "is-loaded" );

            setTimeout(function () {
                // Enable the page to scroll
                $_html.removeClass( "-contain" );

                _isReady = true;

            }, 1000 );

        }, 1000 );

    }, 2000 );

    // Add pinterest scrapable content to the page
    // This is valuable for the pinterest bookmarklet
    $_jsImages.each(function () {
        var $this = $( this ),
            media = ( isDev() ) ? (window.location.href + $this.data( "src" )) : $this.data( "src" );

        $this.append( $( "<img />", { src: media } ).attr( "data-pin-media", media ).addClass( "image__pinit" ) );
    });
},

/**
 *
 * Animate in/out key instructions
 * @method pepperIntro
 * @param {boolean} exit Whether to animate in/out
 * @private
 *
 */
pepperIntro = function ( exit ) {
    var $instructions = $_jsLoaderInfo.children(),
        delayTime = 0,
        handleElem = function ( $el, t ) {
            setTimeout(function () {
                if ( exit ) {
                    $el.removeClass( "is-active" );

                } else {
                    $el.addClass( "is-active" );
                }

            }, t );
        };

    for ( var i = 0, len = $instructions.length; i < len; i++ ) {
        handleElem( $instructions.eq( i ), delayTime );

        delayTime += ( exit ) ? 0 : 200;
    }
},


/******************************************************************************
 * Containers
*******************************************************************************/
/**
 *
 * Build the index version of each slide
 * @method buildSlideIndex
 * @fires slide-index-build
 * @private
 *
 */
buildSlideIndex = function () {
    // Skip first slide, its the intro container...
    var $spreads = $_jsSlides.not( ":last-child" ),
        imageClass = "js-index-slide js-index-slide--image index__slide",
        videoClass = "js-index-slide js-index-slide--video index__slide index__slide--video";

    for ( var len = $spreads.length, i = 0; i < len; i++ ) {
        var $this = $spreads.eq( i ),
            $images = $this.find( ".js-image" ),
            $video = $this.find( ".js-video" ),
            $index = $( "<li />" ).addClass( "index__slide__item" ),
            $media,
            videoId,
            videoIdx,
            videoIdxId;

        if ( $images.length ) {
            for ( var jlen = $images.length, j = 0; j < jlen; j++ ) {
                var $img = $images.eq( j ),
                    $div = $( "<div />" ).addClass( imageClass ).attr( "data-index", $img.data( "index" ) ),
                    iSrc = $img.data( "src" );

                if ( $img.is( ".image--cover" ) || $img.is( ".image--center" ) ) {
                    $div.addClass( "index__slide--wide" );

                } else if ( $img.is( ".image--tall" ) ) {
                    $div.addClass( "index__slide--tall" );

                } else if ( $img.is( ".image--split" ) ) {
                    $div.addClass( "index__slide--split" );
                }

                $div.css( "backgroundImage", "url(" + iSrc + ")" );

                $index.append( $div );
            }

        } else if ( $video.length ) {
            videoId = $video.data( "id" );
            videoIdx = $video.data( "index" );
            videoIdxId = (videoId + "-" + videoIdx);

            $media = $( mediabox.getVideo( videoIdxId ) );
            $media.addClass( videoClass );
            $media.attr( "data-index", videoIdx ).attr( "data-id", videoId );
            $media.prop( "loop", true );

            $index.append( $media );
        }

        // Build up empty jQuery collection
        $_jsIndexSlides.push( $index[ 0 ] );
    }

    emitter.fire( "slide-index-build", $_jsIndexSlides );
},

/**
 *
 * Resize all the slides based on viewport
 * @method resizeSlides
 * @memberof slides
 *
 */
resizeSlides = function () {
    for ( var i = $_jsSlides.length; i--; ) {
        var $this = $_jsSlides.eq( i );

        if ( $this.is( ".slides__item--tall" ) ) {
            $this.css({
                width: window.innerWidth,
                height: window.innerHeight + 400
            });

        } else {
            $this.css({
                width: window.innerWidth,
                height: window.innerHeight
            });
        }
    }
},

/**
 *
 * Scroll to a slide
 * @method advanceTo
 * @param {number} offset where to scroll to
 * @private
 *
 */
advanceTo = function ( offset ) {
    _isAutoAdvance = true;

    scroll2({
        y: offset,
        ease: Easing.easeInOutCubic,
        duration: 1000,
        complete: function () {
            _isAutoAdvance = false;
        }
    });
},

/**
 *
 * Helper to determine if a keyCode is one to trap
 * @method inKeys
 * @param {number} key The keyCode to check against
 * @private
 *
 */
inKeys = function ( key ) {
    var ret = false;

    for ( var i in _keys ) {
        if ( _keys[ i ] === key ) {
            ret = true;
            break;
        }
    }

    return ret;
},

/**
 *
 * Toggle the mast displays
 * @method toggleMasts
 * @private
 *
 */
toggleMasts = function () {
    if ( _isMastHidden ) {
        showMasts();

    } else {
        hideMasts();
    }
},

/**
 *
 * Hide the mast displays
 * @method hideMasts
 * @private
 *
 */
hideMasts = function () {
    $_jsMasts.addClass( "is-inactive" );

    _isMastHidden = true;
},

/**
 *
 * Show the mast displays
 * @method showMasts
 * @private
 *
 */
showMasts = function () {
    $_jsMasts.removeClass( "is-inactive" );

    _isMastHidden = false;
},

/**
 *
 * Check display status of masts
 * @method isMastsHidden
 * @returns boolean
 * @private
 *
 */
isMastsHidden = function () {
    return $_jsMasts.is( ".is-inactive" );
},

/**
 *
 * Process actions at different scroll positions
 * @method processScrollPoints
 * @param {number} scrollPos The current scroll position
 * @private
 *
 */
processScrollPoints = function ( scrollPos ) {
    // Start/Stop intro video playback
    if ( scrollPos > window.innerHeight ) {
        mediabox.stopVideo( "intro" );

    } else {
        mediabox.playVideo( "intro" );
    }

    // Show masts when intro scrolls away
    if ( !_isMastIntroduced && !_isMastHiddenByKey ) {
        if ( scrollPos > window.innerHeight ) {
            showMasts();

            _isMastIntroduced = true;
        }
    }

    // Hide the masts if at the intro
    if ( scrollPos < window.innerHeight ) {
        hideMasts();

        _isMastIntroduced = false;
    }

    // Video slide processed
    // @see processSpecialSlides
    if ( $_videoSlide ) {
        return;
    }

    // Black flags ?
    if ( (scrollPos + window.innerHeight) >= $_jsSlidesLast.offset().top ) {
        $_jsMasts.last().addClass( "is-black" );
        $_body.addClass( "is-black" );

    } else {
        $_jsMasts.last().removeClass( "is-black" );
        $_body.removeClass( "is-black" );
    }

    // Black flags ?
    if ( scrollPos >= ($_jsSlides.eq( _slidesLength - 2 ).offset().top + window.innerHeight - 50) ) {
        $_jsMasts.first().addClass( "is-black" );

    } else {
        $_jsMasts.first().removeClass( "is-black" );
    }
},

/**
 *
 * Process special slides outside the main slide loop
 * @method processSpecialSlides
 * @param {number} scrollPos The current scroll position
 * @private
 *
 */
processSpecialSlides = function ( scrollPos ) {
    var slideData,
        offsetTop,
        offsetMid,
        offsetBot,
        videoId;

    // Process Video Slide
    // This is when colorslide is still in view
    if ( $_videoSlide ) {
        offsetTop = $_videoSlide.offset().top;
        offsetMid = (offsetTop + (window.innerHeight / 2));
        offsetBot = (offsetTop + window.innerHeight);
        slideData = $_videoSlide.data();
        videoId = $_videoSlide.find( ".js-video" ).data( "id" );

        if ( (scrollPos + window.innerHeight) > offsetMid && !_isFade2Black ) {
            mediabox.playVideo( videoId );

            $_body.addClass( "is-black" );
            $_jsMasts.addClass( "is-letterboxing" );

            _isFade2Black = true;

        } else if ( (scrollPos > offsetBot || (scrollPos + window.innerHeight) < offsetMid) && _isFade2Black ) {
            mediabox.stopVideo( videoId );

            $_body.removeClass( "is-black" );
            $_jsMasts.removeClass( "is-letterboxing" );

            $_videoSlide = null;

            _isFade2Black = false;
        }
    }
},

/**
 *
 * Process actions on raf scroll callback
 * @method onScroller
 * @private
 *
 */
onScroller = function () {
    var scrollPos = scroller.getScrollY(),
        offsetTop,
        offsetBot,
        $this,
        $images,
        $video,
        $credits,
        isLastSlide,
        isFirstSlide,
        isSkipFirstSlide,
        transform,
        opacity,
        $transit,
        outroTransform;

    if ( !_isReady ) {
        return;
    }

    processScrollPoints( scrollPos );

    // Process the slides
    // Iterate over length minus 1 to skip last outro slide
    for ( var i = 0; i < _slidesLength; i++ ) {
        $this = $_jsSlides.eq( i );
        $images = $this.find( ".js-image" );
        $video = $this.find( ".js-video" );
        $credits = $( [] );
        isLastSlide = (i === _slidesMinusLast);
        isFirstSlide = (i === 0);
        isSkipFirstSlide = false;
        offsetTop = $this.offset().top;
        offsetBot = (offsetTop + $this.height());
        transform = null;

        // Process Slide
        // Slide is in viewport
        if ( (scrollPos + window.innerHeight) > offsetTop && scrollPos < offsetBot ) {
            // Track the current slide
            _currentSlide = $this.index();

            // Slide is on its way out
            if ( offsetTop < scrollPos ) {
                opacity = (offsetTop + (window.innerHeight * 1.7) - scrollPos) / window.innerHeight;
                opacity = mathPow( opacity, 4 );
                opacity = ( opacity < 0.01 ) ? 0 : opacity;

                transform = mathAbs( (scrollPos - offsetTop) ) / 4;

            // Slide is on its way in
            } else {
                opacity = (scrollPos + (window.innerHeight * 1.7) - offsetTop) / window.innerHeight;
                opacity = mathPow( opacity, 4 );
                opacity = ( opacity > 1 ) ? 1 : opacity;
            }

            // Set slide opacity
            $this.addClass( "is-visible" );

            if ( !isLastSlide ) {
                $this.css( "opacity", opacity );
            }

            // Process first intro slide
            if ( isFirstSlide ) {
                if ( scroller.isScrollMin() ) {
                    isSkipFirstSlide = true;

                    translate3d( $video, 0, 0, 0 );
                    translate3d( $_jsLoader, 0, 0, 0 );
                }
            }

            // Process last outro slide
            if ( isLastSlide ) {
                outroTransform = mathAbs( (scrollPos - offsetTop) ) / 2;

                opacity = mathAbs( outroTransform - 660 ) / 660;

                $_jsOutros.css( "opacity", opacity );

                translate3d( $_jsOutros, 0, (-outroTransform + "px"), 0 );
            }

            // Process Video Slide
            if ( !isFirstSlide && $video.length ) {
                $_videoSlide = $this;
            }

            // Process transform ignoring last-slide
            $transit = ( $video.length ) ? $video : $images;

            if ( !isLastSlide && !isSkipFirstSlide && transform && $transit.length ) {
                translate3d( $transit, 0, (-transform + "px"), 0 );

                if ( isFirstSlide ) {
                    translate3d( $_jsLoader, 0, (-(transform + parseInt( $video.css( "top" ), 10 )) + "px"), 0 );
                }
            }

        // Slide is out of viewport
        } else {
            $this.removeClass( "is-visible" );
        }
    }

    processSpecialSlides( scrollPos );
},

/**
 *
 * Process resizing fullscreen elements
 * @method onResizer
 * @private
 *
 */
onResizer = debounce(function () {
    resizeSlides();
    resizeImages();
    resizeVideos();

    onScroller();
}),

/**
 *
 * Trigger ENTER key to access current slide
 * @method onIndexLink
 * @param {object} e The event object
 * @private
 *
 */
onIndexLink = function ( e ) {
    e.preventDefault();
    e.gesture.preventDefault();

    $_document.trigger( "keyup", {
        key: _keys.ENTER
    });
},

/**
 *
 * Stop keydown when applicable
 * @method onKeyDown
 * @param {object} e The event object
 * @private
 *
 */
onKeyDown = function ( e ) {
    if ( !_isKeyEnabled || _isAutoAdvance ) {
        return;
    }

    if ( inKeys( e.keyCode ) ) {
        e.preventDefault();
    }
},

/**
 *
 * Stop keyup when applicable
 * @method onKeyUp
 * @param {object} e The event object
 * @param {object} triggerData Date passed using .trigger() method
 * @private
 *
 */
onKeyUp = function ( e, triggerData ) {
    var slideTo = null,
        keyCode = ( triggerData ) ? triggerData.key : e.keyCode;

    if ( !_isKeyEnabled || _isAutoAdvance ) {
        return;
    }

    if ( inKeys( keyCode ) ) {
        e.preventDefault();
    }

    // Determine if we should do anything...
    switch ( keyCode ) {
        case _keys.UP:
            slideTo = (_currentSlide - 1);

            if ( slideTo >= 0 ) {
                // Grab the first element that has an offset
                advanceTo( $_jsSlides.eq( slideTo ).offset().top );

            } else {
                console.log( "cannot devance" );
            }
            break;
        case _keys.DOWN:
            slideTo = (_currentSlide + 1);

            // Last slide
            if ( slideTo === (_slidesLength - 1) ) {
                advanceTo( $_jsSlides.eq( slideTo ).offset().top );

            } else if ( slideTo < _slidesLength ) {
                // Grab the first element that has an offset
                advanceTo( $_jsSlides.eq( slideTo ).offset().top );

            } else {
                console.log( "cannot advance" );
            }
            break;
        case _keys.ENTER:
            // Grab the first element that can open the index
            index.triggerOpen( $_jsSlides.eq( ( _currentSlide === _slidesLength - 1 ) ? _slidesLength - 2 : _currentSlide ).find( ".js-image, .js-video" ) );
            break;
        case _keys.ESC:
            if ( index.isActive() ) {
                // Grab the first element that can open the index
                hammered.trigger( "tap", $_jsIndexSlides.eq( _currentSlide ).find( ".js-index-slide" )[ 0 ] );
            }
            break;
        case _keys.CTRL:
            toggleMasts();

            _isMastHiddenByKey = isMastsHidden();
        break;
        case _keys.SPACE:
            $_jsSlides.eq( _currentSlide ).find( ".js-image" ).each(function () {
                hammered.trigger( "tap", this );
            });
            break;
    }
},

/**
 *
 * Open the slides credits
 * @method onCreditsOpen
 * @memberof slides
 * @private
 *
 */
onCreditsOpen = function () {
    var $credits = $( this ).find( ".js-credits" );

    if ( $credits.is( ".is-active" ) ) {
        onCreditsClose.apply( $credits[ 0 ], arguments );

    } else {
        $credits.addClass( "is-active" );
    }
},

/**
 *
 * Close the slides credits
 * @method onCreditsClose
 * @memberof slides
 * @param {object} e The event object
 * @private
 *
 */
onCreditsClose = function ( e ) {
    var $this = $( this );

    if ( e.target.tagName.toLowerCase() === "a" ) {
        return;
    }

    $this.addClass( "is-inactive" );

    setTimeout(function () {
        $this.removeClass( "is-active is-inactive" );

    }, 400 );
},

onRivalsLink = function () {
    hammered.trigger( "tap", $_jsIndexSlides.children()[ 0 ] );
},


/******************************************************************************
 * Video
*******************************************************************************/
/**
 *
 * Helper for video loading via MediaBox
 * @method loadVideos
 * @param {function} callback Fired when mediabox loads content
 * @memberof slides
 *
 */
loadVideos = function ( callback ) {
    var config = {
        addVideo: []
    };

    for ( var len = $_jsVideos.length, i = len; i--; ) {
        var $this = $_jsVideos.eq( i ),
            videoData = $this.data(),
            channel = ( videoData.id === "intro" ) ? "vid" : "low";

        // Build MediaBox config
        config.addVideo.push({
            id: videoData.id,
            src: videoData.src.split( "|" ),
            element: $_jsVideos[ i ],
            channel: channel,
            CORS: true
        });

        // Add index version under a diff channel
        if ( videoData.index ) {
            config.addVideo.push({
                id: (videoData.id + "-" + videoData.index),
                src: videoData.src.split( "|" ),
                channel: "idx",
                CORS: true
            });
        }
    }

    mediabox.addProgress(function () {
        _mediaLoaded++;
    });
    mediabox.addMedia( config, function () {
        mediabox.setChannelProp( "vid", "volume", 0.25 );
        mediabox.setChannelProp( "idx", "volume", 0 );
        mediabox.setChannelProp( "low", "volume", 0 );

        if ( typeof callback === "function" ) {
            callback();
        }
    });
},

/**
 *
 * Replace the video placeholders with mediabox containers
 * @method replaceVideos
 * @memberof slides
 *
 */
replaceVideos = function () {
    for ( var len = $_jsVideos.length, i = len; i--; ) {
        var $this = $_jsVideos.eq( i ),
            videoId = $this.data( "id" ),
            videoIdx = $this.data( "index" );

        mediabox.setVideoProp( videoId, "className", $_jsVideos[ i ].className );
        mediabox.setVideoAttr( videoId, "data-id", videoId );
        mediabox.setVideoAttr( videoId, "data-index", videoIdx );
        mediabox.replaceAsVideo( videoId, $this[ 0 ] );
    }

    // Requery to set this to <video /> elements
    $_jsVideos = $( ".js-video" );
},

/**
 *
 * Helper for video resizing
 * @method resizeVideos
 * @memberof slides
 *
 */
resizeVideos = function () {
    for ( var len = $_jsVideos.length, i = len; i--; ) {
        var $this = $_jsVideos.eq( i ),
            $cont = $this.parent(),
            scaleH,
            scaleV,
            scale,
            videoHeight,
            videoWidth;

        // Bleeds
        if ( $this.is( ".js-video--bleed" ) ) {
            scaleH = $cont.width() / _videoConfig.width;
            scaleV = $cont.height() / _videoConfig.height;
            scale = scaleH > scaleV ? scaleH : scaleV;

            if ( scale * _videoConfig.width < _videoConfig.minWidth ) {
                scale = _videoConfig.minWidth / _videoConfig.width;
            }

            videoWidth = (scale * _videoConfig.width);
            videoHeight = (scale * _videoConfig.height);

            $this.css({
                width: videoWidth,
                height: videoHeight,
                left: -((videoWidth - $cont.width()) / 2),
                top: -((videoHeight - $cont.height()) / 2)
            });

        // Aspect
        } else if ( $this.is( ".js-video--aspect" ) ) {
            videoWidth = $cont.width();
            videoHeight = videoWidth / _videoConfig.aspect;

            $this.css({
                width: videoWidth,
                height: videoHeight,
                left: 0,
                top: (($cont.height() - videoHeight) / 2)
            });
        }
    }
},


/******************************************************************************
 * Image
*******************************************************************************/
/**
 * Resize arbitary width x height region to fit inside another region.
 * Conserve aspect ratio of the orignal region. Useful when shrinking/enlarging
 * images to fit into a certain area.
 * @url: http://opensourcehacker.com/2011/12/01/calculate-aspect-ratio-conserving-resize-for-images-in-javascript/
 * @method calculateAspectRatioFit
 * @param {Number} srcWidth Source area width
 * @param {Number} srcHeight Source area height
 * @param {Number} maxWidth Fittable area maximum available width
 * @param {Number} srcWidth Fittable area maximum available height
 * @return {Object} { width, heigth }
 *
 */
calculateAspectRatioFit = function( srcWidth, srcHeight, maxWidth, maxHeight ) {
    var ratio = mathMin( (maxWidth / srcWidth), (maxHeight / srcHeight) );

    return {
        width: srcWidth * ratio,
        height: srcHeight * ratio
    };
},

/**
 *
 * Helper for image resizing
 * @method resizeImages
 * @memberof slides
 *
 */
resizeImages = function () {
    for ( var len = $_jsImages.length, i = len; i--; ) {
        var $this = $_jsImages.eq( i ),
            iData = $this.data( "imageloader" );

        if ( $this.is( ".image--tall" ) && iData ) {
            $this.css(calculateAspectRatioFit(
                iData.width,
                iData.height,
                $this.parent().width(),
                $this.parent().height()
            ));
        }
    }
};


/******************************************************************************
 * Export
*******************************************************************************/
export { init, resizeSlides, loadVideos, replaceVideos, resizeVideos };