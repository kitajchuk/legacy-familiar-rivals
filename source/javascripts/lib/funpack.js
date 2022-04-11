/*!
 *
 * Funpack js
 * @author: Instrument
 * @url: http://weareinstrument.com
 * @git: https://github.com/Instrument/funpack
 *
 *
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Instrument
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

(function ( context ) {
    // This is the internal pack storage
    var __pack = {};

    // Global funpack namespace as a function
    context.funpack = function ( k ) {
        return (k ? __pack[ k ] || undefined : __pack);
    };

    // This method allows pushing onto the pack
    context.funpack.pack = function ( k, v ) {
        if ( !__pack[ k ] ) {
            __pack[ k ] = v;
        }
    };
})( this );

/*!
 *
 * Adapted from https://gist.github.com/paulirish/1579671 which derived from 
 * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
 * http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
 * 
 * requestAnimationFrame polyfill by Erik Möller.
 * Fixes from Paul Irish, Tino Zijdel, Andrew Mao, Klemen Slavič, Darius Bacon
 * 
 * MIT license
 *
 * @raf
 *
 */
(function ( window ) {

"use strict";

if ( !Date.now ) {
    Date.now = function () {
        return new Date().getTime();
    };
}

(function() {
    var vendors = ["webkit", "moz", "ms", "o"];

    for ( var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i ) {
        var vp = vendors[i];
        window.requestAnimationFrame = window[vp + "RequestAnimationFrame"];
        window.cancelAnimationFrame = (window[vp + "CancelAnimationFrame"] || window[vp + "CancelRequestAnimationFrame"]);
    }

    if ( /iP(ad|hone|od).*OS 6/.test( window.navigator.userAgent ) || !window.requestAnimationFrame || !window.cancelAnimationFrame ) {
        var lastTime = 0;

        window.requestAnimationFrame = function ( callback ) {
            var now = Date.now(),
                nextTime = Math.max( lastTime + 16, now );

            return setTimeout(function() {
                callback( lastTime = nextTime );

            }, (nextTime - now) );
        };

        window.cancelAnimationFrame = clearTimeout;
    }
}());

})( window );

/*!
 *
 * Event / Animation cycle manager
 *
 * var MyController = function () {};
 * MyController.prototype = new Controller();
 *
 * @Controller
 * @author: kitajchuk
 *
 *
 */
(function ( window, undefined ) {


//"use strict";


// Private animation functions
var raf = window.requestAnimationFrame,
    caf = window.cancelAnimationFrame;


/**
 *
 * Event / Animation cycle manager
 * @constructor Controller
 * @requires raf
 * @memberof! <global>
 *
 */
var Controller = function () {
    return this.init.apply( this, arguments );
};

Controller.prototype = {
    constructor: Controller,

    /**
     *
     * Controller constructor method
     * @memberof Controller
     * @method Controller.init
     *
     */
    init: function () {
        /**
         *
         * Controller event handlers object
         * @memberof Controller
         * @member _handlers
         * @private
         *
         */
        this._handlers = {};

        /**
         *
         * Controller unique ID
         * @memberof Controller
         * @member _uid
         * @private
         *
         */
        this._uid = 0;

        /**
         *
         * Started iteration flag
         * @memberof Controller
         * @member _started
         * @private
         *
         */
        this._started = false;

        /**
         *
         * Paused flag
         * @memberof Controller
         * @member _paused
         * @private
         *
         */
        this._paused = false;

        /**
         *
         * Timeout reference
         * @memberof Controller
         * @member _cycle
         * @private
         *
         */
        this._cycle = null;
    },

    /**
     *
     * Controller go method to start frames
     * @memberof Controller
     * @method go
     *
     */
    go: function ( fn ) {
        if ( this._started && this._cycle ) {
            return this;
        }

        this._started = true;

        var self = this,
            anim = function () {
                self._cycle = raf( anim );

                if ( self._started ) {
                    if ( typeof fn === "function" ) {
                        fn();
                    }
                }
            };

        anim();
    },

    /**
     *
     * Pause the cycle
     * @memberof Controller
     * @method pause
     *
     */
    pause: function () {
        this._paused = true;

        return this;
    },

    /**
     *
     * Play the cycle
     * @memberof Controller
     * @method play
     *
     */
    play: function () {
        this._paused = false;

        return this;
    },

    /**
     *
     * Stop the cycle
     * @memberof Controller
     * @method stop
     *
     */
    stop: function () {
        caf( this._cycle );

        this._paused = false;
        this._started = false;
        this._cycle = null;

        return this;
    },

    /**
     *
     * Controller add event handler
     * @memberof Controller
     * @method on
     * @param {string} event the event to listen for
     * @param {function} handler the handler to call
     *
     */
    on: function ( event, handler ) {
        var events = event.split( " " );

        // One unique ID per handler
        handler._jsControllerID = this.getUID();

        for ( var i = events.length; i--; ) {
            if ( typeof handler === "function" ) {
                if ( !this._handlers[ events[ i ] ] ) {
                    this._handlers[ events[ i ] ] = [];
                }

                // Handler can be stored with multiple events
                this._handlers[ events[ i ] ].push( handler );
            }
        }

        return this;
    },

    /**
     *
     * Controller remove event handler
     * @memberof Controller
     * @method off
     * @param {string} event the event to remove handler for
     * @param {function} handler the handler to remove
     *
     */
    off: function ( event, handler ) {
        if ( !this._handlers[ event ] ) {
            return this;
        }

        // Remove a single handler
        if ( handler ) {
            this._off( event, handler );

        // Remove all handlers for event
        } else {
            this._offed( event );
        }

        return this;
    },

    /**
     *
     * Controller fire an event
     * @memberof Controller
     * @method fire
     * @param {string} event the event to fire
     *
     */
    fire: function ( event ) {
        if ( !this._handlers[ event ] ) {
            return this;
        }

        var args = [].slice.call( arguments, 1 );

        for ( var i = this._handlers[ event ].length; i--; ) {
            this._handlers[ event ][ i ].apply( this, args );
        }

        return this;
    },

    /**
     *
     * Get a unique ID
     * @memberof Controller
     * @method getUID
     * @returns number
     *
     */
    getUID: function () {
        this._uid = (this._uid + 1);

        return this._uid;
    },

    /**
     *
     * Controller internal off method assumes event AND handler are good
     * @memberof Controller
     * @method _off
     * @param {string} event the event to remove handler for
     * @param {function} handler the handler to remove
     * @private
     *
     */
    _off: function ( event, handler ) {
        for ( var i = 0, len = this._handlers[ event ].length; i < len; i++ ) {
            if ( handler._jsControllerID === this._handlers[ event ][ i ]._jsControllerID ) {
                this._handlers[ event ].splice( i, 1 );

                break;
            }
        }
    },

    /**
     *
     * Controller completely remove all handlers and an event type
     * @memberof Controller
     * @method _offed
     * @param {string} event the event to remove handler for
     * @private
     *
     */
    _offed: function ( event ) {
        for ( var i = this._handlers[ event ].length; i--; ) {
            this._handlers[ event ][ i ] = null;
        }

        delete this._handlers[ event ];
    }
};


// Expose
window.funpack.pack( "Controller", Controller );


})( window );

/*!
 *
 * A base set of easing methods
 * Most of which were found here:
 * https://gist.github.com/gre/1650294
 *
 * @Easing
 * @author: kitajchuk
 *
 */
(function ( window, undefined ) {


"use strict";


/**
 *
 * Easing functions
 * @namespace Easing
 * @memberof! <global>
 *
 */
var Easing = {
    /**
     *
     * Produce a linear ease
     * @method linear
     * @param {number} t Difference in time
     * @memberof Easing
     * @returns a new t value
     *
     */
    linear: function ( t ) { return t; },
    
    /**
     *
     * Produce a swing ease like in jQuery
     * @method swing
     * @param {number} t Difference in time
     * @memberof Easing
     * @returns a new t value
     *
     */
    swing: function ( t ) { return (1-Math.cos( t*Math.PI ))/2; },
    
    /**
     *
     * Accelerating from zero velocity
     * @method easeInQuad
     * @param {number} t Difference in time
     * @memberof Easing
     * @returns a new t value
     *
     */
    easeInQuad: function ( t ) { return t*t; },
    
    /**
     *
     * Decelerating to zero velocity
     * @method easeOutQuad
     * @param {number} t Difference in time
     * @memberof Easing
     * @returns a new t value
     *
     */
    easeOutQuad: function ( t ) { return t*(2-t); },
    
    /**
     *
     * Acceleration until halfway, then deceleration
     * @method easeInOutQuad
     * @param {number} t Difference in time
     * @memberof Easing
     * @returns a new t value
     *
     */
    easeInOutQuad: function ( t ) { return t<0.5 ? 2*t*t : -1+(4-2*t)*t; },
    
    /**
     *
     * Accelerating from zero velocity
     * @method easeInCubic
     * @param {number} t Difference in time
     * @memberof Easing
     * @returns a new t value
     *
     */
    easeInCubic: function ( t ) { return t*t*t; },
    
    /**
     *
     * Decelerating to zero velocity
     * @method easeOutCubic
     * @param {number} t Difference in time
     * @memberof Easing
     * @returns a new t value
     *
     */
    easeOutCubic: function ( t ) { return (--t)*t*t+1; },
    
    /**
     *
     * Acceleration until halfway, then deceleration
     * @method easeInOutCubic
     * @param {number} t Difference in time
     * @memberof Easing
     * @returns a new t value
     *
     */
    easeInOutCubic: function ( t ) { return t<0.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1; },
    
    /**
     *
     * Accelerating from zero velocity
     * @method easeInQuart
     * @param {number} t Difference in time
     * @memberof Easing
     * @returns a new t value
     *
     */
    easeInQuart: function ( t ) { return t*t*t*t; },
    
    /**
     *
     * Decelerating to zero velocity
     * @method easeOutQuart
     * @param {number} t Difference in time
     * @memberof Easing
     * @returns a new t value
     *
     */
    easeOutQuart: function ( t ) { return 1-(--t)*t*t*t; },
    
    /**
     *
     * Acceleration until halfway, then deceleration
     * @method easeInOutQuart
     * @param {number} t Difference in time
     * @memberof Easing
     * @returns a new t value
     *
     */
    easeInOutQuart: function ( t ) { return t<0.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t; },
    
    /**
     *
     * Accelerating from zero velocity
     * @method easeInQuint
     * @param {number} t Difference in time
     * @memberof Easing
     * @returns a new t value
     *
     */
    easeInQuint: function ( t ) { return t*t*t*t*t; },
    
    /**
     *
     * Decelerating to zero velocity
     * @method easeOutQuint
     * @param {number} t Difference in time
     * @memberof Easing
     * @returns a new t value
     *
     */
    easeOutQuint: function ( t ) { return 1+(--t)*t*t*t*t; },
    
    /**
     *
     * Acceleration until halfway, then deceleration
     * @method easeInOutQuint
     * @param {number} t Difference in time
     * @memberof Easing
     * @returns a new t value
     *
     */
    easeInOutQuint: function ( t ) { return t<0.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t; }
};


// Expose
window.funpack.pack( "Easing", Easing );


})( window );

/*!
 *
 * Use native element selector matching
 *
 * @matchElement
 * @author: kitajchuk
 *
 */
(function ( window, undefined ) {


"use strict";


/**
 *
 * Use native element selector matching
 * @memberof! <global>
 * @method matchElement
 * @param {object} el the element
 * @param {string} selector the selector to match
 * @returns element OR null
 *
 */
var matchElement = function ( el, selector ) {
    var method = ( el.matches ) ? "matches" : ( el.webkitMatchesSelector ) ? 
                                  "webkitMatchesSelector" : ( el.mozMatchesSelector ) ? 
                                  "mozMatchesSelector" : ( el.msMatchesSelector ) ? 
                                  "msMatchesSelector" : ( el.oMatchesSelector ) ? 
                                  "oMatchesSelector" : null;
    
    // Try testing the element agains the selector
    if ( method && el[ method ].call( el, selector ) ) {
        return el;
    
    // Keep walking up the DOM if we can
    } else if ( el !== document.documentElement && el.parentNode ) {
        return matchElement( el.parentNode, selector );
    
    // Otherwise we should not execute an event
    } else {
        return null;
    }
};


// Expose
window.funpack.pack( "matchElement", matchElement );


})( window );

/*!
 *
 * Hammerjs event delegation wrapper
 * http://eightmedia.github.io/hammer.js/
 *
 * @Hammered
 * @author: kitajchuk
 *
 *
 */
(function ( window, Hammer, matchElement ) {


"use strict";


// Break on no Hammer
if ( !Hammer ) {
    throw new Error( "Hammered Class requires Hammerjs!" );
}


/**
 *
 * Single instanceof Hammer
 *
 */
var _instance = null;


/**
 *
 * Hammerjs event delegation wrapper
 * @constructor Hammered
 * @requires matchElement
 * @memberof! <global>
 *
 */
var Hammered = function () {
    return (_instance || this.init.apply( this, arguments ));
};


Hammered.prototype = {
    constructor: Hammered,

    /**
     *
     * Hammered constructor method
     * {@link https://github.com/EightMedia/hammer.js/wiki/Getting-Started#gesture-options}
     * @memberof Hammered
     * @param {object} element DOMElement to delegate from, default is document.body
     * @param {object} options Hammerjs options to be passed to instance
     * @method init
     *
     */
    init: function ( element, options ) {
        _instance = this;

        /**
         *
         * Match version of hammerjs for compatibility
         * @member _version
         * @memberof Hammered
         * @private
         *
         */
        this._version = "1.1.2";
    
        /**
         *
         * The stored handlers
         * @member _handlers
         * @memberof Hammered
         * @private
         *
         */
        this._handlers = {};

        /**
         *
         * The stored Hammer instance
         * @member _hammer
         * @memberof Hammered
         * @private
         *
         */
        this._hammer = new Hammer( (element || document.body), options );
    },

    /**
     *
     * Retrieve the original Hammer instance
     * @method getInstance
     * @memberof Hammered
     * @returns instanceof Hammer
     *
     */
    getInstance: function () {
        return this._hammer;
    },

    /**
     *
     * Retrieve the handlers reference object
     * @method getHandlers
     * @memberof Hammered
     * @returns object
     *
     */
    getHandlers: function () {
        return this._handlers;
    },

    /**
     *
     * Allow binding hammer event via delegation
     * @method on
     * @param {string} event The Hammer event
     * @param {string} selector The delegated selector to match
     * @param {function} callback The handler to call
     * @memberof Hammered
     *
     */
    on: function ( event, selector, callback ) {
        var uid = ("Hammered" + ((this._version + Math.random()) + (event + "-" + selector)).replace( /\W/g, "" )),
            handler = function ( e ) {
                var element = matchElement( e.target, selector );

                // Either match target element
                // or walk up to match ancestral element.
                // If the target is not desired, exit
                if ( element ) {
                    // Call the handler with normalized context
                    callback.call( element, e );
                }
            };

        // Bind the methods on ID
        handler._hammerUID = uid;
        callback._hammerUID = uid;

        // Apply the event via Hammerjs
        this._hammer.on( event, handler );

        // Push the wrapper handler onto the stack
        this._handlers[ uid ] = handler;
    },

    /**
     *
     * Effectively off an event wrapped with Hammered
     * @method off
     * @param {string} event The Hammer event
     * @param {function} callback The handler to remove
     * @memberof Hammered
     *
     */
    off: function ( event, callback ) {
        var i;

        for ( i in this._handlers ) {
            if ( i === callback._hammerUID && this._handlers[ i ]._hammerUID === callback._hammerUID ) {
                this._hammer.off( event, this._handlers[ i ] );

                delete this._handlers[ i ];

                break;
            }
        }
    },

    /**
     *
     * Effectively trigger an event through Hammer-js
     * @method trigger
     * @param {string} event The Hammer event
     * @param {object} element The DOMElement to invoke event on
     * @memberof Hammered
     *
     */
    trigger: function ( event, element ) {
        element = ( typeof element === "object" && element.nodeType === 1 ) ? element : null;

        // Only proceed if the element is legit
        if ( element ) {
            var eventObject = document.createEvent( "CustomEvent" ),
                eventData = Hammer.event.collectEventData(
                    element,
                    Hammer.EVENT_END,
                    Hammer.event.getTouchList( eventObject, Hammer.EVENT_END ),
                    eventObject
                );

            eventData.target = element;

            this._hammer.trigger( event, eventData );
        }
    }
};


// Expose
window.funpack.pack( "Hammered", Hammered );


})( window, window.Hammer, (window.matchElement || window.funpack( "matchElement" )) );

/*!
 *
 * Handle lazy-loading images with unique callback conditions
 *
 * @ImageLoader
 * @author: kitajchuk
 *
 *
 */
(function ( $ ) {


"use strict";


var _i,
    _all = 0,
    _num = 0,
    _raf = null,
    _ini = false,
    _instances = [];


// Break on no $
if ( !$ ) {
    throw new Error( "ImageLoader Class requires jQuery, ender, Zepto or something like that..." );
}


// Should support elements as null, undefined, jquery/ender/zepto object, string selector
function setElements( elements ) {
    // Allow null, undefined to be set
    // Check right away if this is a jQuery object
    if ( !elements || elements.jquery ) {
        return elements;
    }

    // Handles string selector
    if ( typeof elements === "string" ) {
        elements = $( elements );

    // Handles objects that don't have the framework methods we need
    } else if ( !("addClass" in elements) && !("removeClass" in elements) && !("attr" in elements) && !("not" in elements) ) {
        elements = $( elements );
    }

    return elements;
}


// Called when instances are created
function initializer( instance ) {
    // Increment ALL
    _all = _all + instance._num2Load;

    // Private instances array
    _instances.push( instance );

    // One stop shopping
    if ( !_ini ) {
        _ini = true;
        animate();
    }
}


function animate() {
    if ( _num !== _all ) {
        _raf = window.requestAnimationFrame( animate );

        for ( _i = _instances.length; _i--; ) {
            if ( _instances[ _i ]._numLoaded !== _instances[ _i ]._num2Load && _instances[ _i ]._loadType === "async" ) {
                _instances[ _i ].handle();
            }
        }

    } else {
        window.cancelAnimationFrame( _raf );

        _raf = null;
        _ini = false;
    }
}


/**
 *
 * Handle lazy-loading images with unique callback conditions
 * @memberof! <global>
 * @requires raf
 * @constructor ImageLoader
 * @param {object} options Controller settings
 * <ul>
 * <li>elements - The collection of elements to load against</li>
 * <li>attribute - The property to pull the image source from</li>
 * <li>transitionDelay - The timeout before transition starts</li>
 * <li>transitionDuration - The length of the animation</li>
 * </ul>
 *
 */
var ImageLoader = function () {
    return this.init.apply( this, arguments );
};


/**
 *
 * ClassName for the element loading state
 * @member IS_LOADING
 * @memberof ImageLoader
 *
 */
ImageLoader.IS_LOADING = "-is-lazy-loading";


/**
 *
 * ClassName for the element transitioning state
 * @member IS_TRANSITION
 * @memberof ImageLoader
 *
 */
ImageLoader.IS_TRANSITION = "-is-lazy-transition";


/**
 *
 * ClassName for the elements loaded state
 * @member IS_LOADED
 * @memberof ImageLoader
 *
 */
ImageLoader.IS_LOADED = "-is-lazy-loaded";


/**
 *
 * ClassName to define the element as having been loaded
 * @member IS_HANDLED
 * @memberof ImageLoader
 *
 */
ImageLoader.IS_HANDLED = "-is-lazy-handled";


ImageLoader.prototype = {
    constructor: ImageLoader,

    init: function ( options ) {
        var self = this;

        if ( !options ) {
            throw new Error( "ImageLoader Class requires options to be passed" );
        }

        /**
         *
         * The Collection to load against
         * @memberof ImageLoader
         * @member _elements
         * @private
         *
         */
        this._elements = setElements( options.elements );

        /**
         *
         * The property to get image source from
         * @memberof ImageLoader
         * @member _property
         * @private
         *
         */
        this._property = (options.property || "data-src");

        /**
         *
         * The way to load, async or sync
         * Using "sync" loading requires calling .start() on the instance
         * and the "handle" event will not be utilized, rather each image
         * will be loaded in succession as the previous finishes loading
         * @memberof ImageLoader
         * @member _loadType
         * @private
         *
         */
        this._loadType = (options.loadType || "async");

        /**
         *
         * The current amount of elements lazy loaded
         * @memberof ImageLoader
         * @member _numLoaded
         * @private
         *
         */
        this._numLoaded = 0;

        /**
         *
         * The total amount of elements to lazy load
         * @memberof ImageLoader
         * @member _num2Load
         * @private
         *
         */
        this._num2Load = (this._elements ? this._elements.length : 0);

        /**
         *
         * The delay to execute lazy loading on an element in ms
         * @memberof ImageLoader
         * @member _transitionDelay
         * @default 100
         * @private
         *
         */
        this._transitionDelay = (options.transitionDelay || 100);

        /**
         *
         * The duration on a lazy loaded elements fade in in ms
         * @memberof ImageLoader
         * @member _transitionDuration
         * @default 600
         * @private
         *
         */
        this._transitionDuration = (options.transitionDuration || 600);

        /**
         *
         * This flags that all elements have been loaded
         * @memberof ImageLoader
         * @member _resolved
         * @private
         *
         */
        this._resolved = false;

        /**
         *
         * Defined event namespaced handlers
         * @memberof ImageLoader
         * @member _handlers
         * @private
         *
         */
        this._handlers = {
            handle: null,
            update: null,
            done: null,
            load: null
        };

        // Only run animation frame for async loading
        if ( this._loadType === "async" ) {
            initializer( this );

        } else {
            this._syncLoad();
        }
    },

    /**
     *
     * Add a callback handler for the specified event name
     * @memberof ImageLoader
     * @method on
     * @param {string} event The event name to listen for
     * @param {function} handler The handler callback to be fired
     *
     */
    on: function ( event, handler ) {
        this._handlers[ event ] = handler;

        return this;
    },
    
    /**
     *
     * Fire the given event for the loaded element
     * @memberof ImageLoader
     * @method fire
     * @returns bool
     *
     */
    fire: function ( event, element ) {
        var ret = false;

        if ( typeof this._handlers[ event ] === "function" ) {
            ret = this._handlers[ event ].call( this, element );
        }

        return ret;
    },

    /**
     *
     * Iterate over elements and fire the update handler
     * @memberof ImageLoader
     * @method update
     *
     * @fires update
     *
     */
    update: function () {
        var self = this;

        this._elements.each(function () {
            var $this = $( this );

            self.fire( "update", $this );
        });
    },
    
    /**
     *
     * Perform the image loading and set correct values on element
     * @method load
     * @memberof ImageLoader
     * @param {object} $elem element object
     * @param {function} callback optional callback for each load
     *
     * @fires done
     *
     */
    load: function ( element, callback ) {
        var self = this,
            image = null,
            timeout = null,
            isImage = element.is( "img" ),
            source = element.attr( this._property );

        element.addClass( ImageLoader.IS_LOADING );

        if ( isImage ) {
            image = element[ 0 ];

        } else {
            image = new Image();
        }

        timeout = setTimeout(function () {
            clearTimeout( timeout );

            element.addClass( ImageLoader.IS_TRANSITION );

            image.onload = function () {
                self.fire( "load", element );

                // Store images true dimensions
                element.data( "imageloader", {
                    width: image.width,
                    height: image.height
                });

                if ( !isImage ) {
                    element.css( "background-image", "url(" + source + ")" );

                    image = null;
                }

                element.addClass( ImageLoader.IS_LOADED );

                timeout = setTimeout(function () {
                    clearTimeout( timeout );

                    element.removeClass( ImageLoader.IS_LOADING + " " + ImageLoader.IS_TRANSITION + " " + ImageLoader.IS_LOADED ).addClass( ImageLoader.IS_HANDLED );

                    if ( (self._numLoaded === self._num2Load) && !self._resolved ) {
                        self._resolved = true;

                        // Fires the predefined "done" event
                        self.fire( "done" );

                    } else if ( typeof callback === "function" ) {
                        // Errors first
                        callback( false );
                    }

                }, self._transitionDuration );
            };

            image.onerror = function () {
                if ( (self._numLoaded === self._num2Load) && !self._resolved ) {
                    self._resolved = true;

                    // Fires the predefined "done" event
                    self.fire( "done" );

                } else if ( typeof callback === "function" ) {
                    // Errors first
                    callback( true );
                }
            };

            image.src = source;

        }, this._transitionDelay );

        return this;
    },

    /**
     *
     * Handles element iterations and loading based on callbacks
     * @memberof ImageLoader
     * @method handle
     *
     * @fires handle
     *
     */
    handle: function () {
        var elems = this._elements.not( "." + ImageLoader.IS_HANDLED + ", ." + ImageLoader.IS_LOADING ),
            self = this;

        elems.each(function () {
            var $this = $( this );

            // Fires the predefined "handle" event
            if ( self.fire( "handle", $this ) ) {
                _num++;

                self._numLoaded++;

                self.load( $this );
            }
        });
    },

    /**
     *
     * Support batch synchronous loading of a set of images
     * @memberof ImageLoader
     * @method _syncLoad
     * @private
     *
     */
    _syncLoad: function () {
        var self = this;

        function syncLoad() {
            var elem = self._elements.eq( self._numLoaded );

            self._numLoaded++;

            self.load( elem, function ( error ) {
                if ( !error && !self._resolved ) {
                    syncLoad();
                }
            });
        }

        syncLoad();
    }
};


// Expose
window.funpack.pack( "ImageLoader", ImageLoader );


})( (window.jQuery || window.ender || window.Zepto) );

/*!
 *
 * A simple tween class using requestAnimationFrame
 *
 * @Tween
 * @author: kitajchuk
 *
 */
(function ( window, Easing, undefined ) {


"use strict";


var defaults = {
    ease: Easing.linear,
    duration: 600,
    from: 0,
    to: 0,
    delay: 0,
    update: function () {},
    complete: function () {}
};


/**
 *
 * Tween function
 * @constructor Tween
 * @requires raf
 * @requires Easing
 * @param {object} options Tween animation settings
 * <ul>
 * <li>duration - How long the tween will last</li>
 * <li>from - Where to start the tween</li>
 * <li>to - When to end the tween</li>
 * <li>update - The callback on each iteration</li>
 * <li>complete - The callback on end of animation</li>
 * <li>ease - The easing function to use</li>
 * <li>delay - How long to wait before animation</li>
 * </ul>
 * @memberof! <global>
 *
 */
var Tween = function ( options ) {
    // Normalize options
    options = (options || {});

    // Normalize options
    for ( var i in defaults ) {
        if ( options[ i ] === undefined ) {
            options[ i ] = defaults[ i ];
        }
    }

    var tweenDiff = (options.to - options.from),
        startTime = null,
        rafTimer = null,
        isStopped = false;

    function animate( rafTimeStamp ) {
        if ( isStopped ) {
            return;
        }

        if ( startTime === null ) {
            startTime = rafTimeStamp;
        }

        var animDiff = (rafTimeStamp - startTime),
            tweenTo = (tweenDiff * options.ease( animDiff / options.duration )) + options.from;

        if ( typeof options.update === "function" ) {
            options.update( tweenTo );
        }

        if ( animDiff > options.duration ) {
            if ( typeof options.complete === "function" ) {
                options.complete( options.to );
            }

            cancelAnimationFrame( rafTimer );

            rafTimer = null;

            return false;
        }

        rafTimer = requestAnimationFrame( animate );
    }

    setTimeout(function () {
        rafTimer = requestAnimationFrame( animate );

    }, options.delay );

    this.stop = function () {
        isStopped = true;

        cancelAnimationFrame( rafTimer );

        rafTimer = null;
    };
};


// Expose
window.funpack.pack( "Tween", Tween );


})( window, (window.Easing || window.funpack( "Easing" )) );

/*!
 *
 * A complete management tool for html5 video and audio context
 *
 * @MediaBox
 * @author: kitajchuk
 *
 */
(function ( window, document, Easing, Tween, undefined ) {


"use strict";


/**
 *
 * Expression match hashbang/querystring
 * @member rHashQuery
 * @private
 *
 */
var rHashQuery = /[#|?].*$/g,

/**
 *
 * Replace "no" in canPlayType strings
 * @member rNos
 * @private
 *
 */
rNos = /^no$/,

/**
 *
 * Clean up all those typeof's
 * @method isFunction
 * @returns boolean
 * @private
 *
 */
isFunction = function ( fn ) {
    return (typeof fn === "function");
},

/**
 *
 * Test that an object is an Element
 * @method isElement
 * @returns boolean
 * @private
 *
 */
isElement = function ( el ) {
    return (el instanceof HTMLElement);
},

/**
 *
 * Borrowed(ish)
 * Modernizr v2.7.1
 * www.modernizr.com
 * Copyright (c) Faruk Ates, Paul Irish, Alex Sexton
 * Available under the BSD and MIT licenses: www.modernizr.com/license/
 * @method getAudioSupport
 * @returns object
 * @private
 *
 */
getAudioSupport = function () {
    var elem = document.createElement( "audio" ),
        ret = {};

    try {
        if ( elem.canPlayType ) {
            ret.ogg = elem.canPlayType( 'audio/ogg; codecs="vorbis"' ).replace( rNos, "" );
            ret.mp3 = elem.canPlayType( 'audio/mpeg;' ).replace( rNos, "" );
            ret.wav = elem.canPlayType( 'audio/wav; codecs="1"').replace( rNos, "" );
            ret.m4a = (elem.canPlayType( 'audio/x-m4a;' ) || elem.canPlayType( 'audio/aac;' )).replace( rNos, "" );
        }
        
    } catch ( e ) {}

    return ret;
},

/**
 *
 * Borrowed(ish)
 * Modernizr v2.7.1
 * www.modernizr.com
 * Copyright (c) Faruk Ates, Paul Irish, Alex Sexton
 * Available under the BSD and MIT licenses: www.modernizr.com/license/
 * @method getVideoSupport
 * @returns object
 * @private
 *
 */
getVideoSupport = function () {
    var elem = document.createElement( "video" ),
        ret = {};

    try {
        if ( elem.canPlayType ) {
            ret.mpeg4 = elem.canPlayType( 'video/mp4; codecs="mp4v.20.8"' ).replace( rNos, "" );
            ret.ogg = elem.canPlayType( 'video/ogg; codecs="theora"' ).replace( rNos, "" );
            ret.h264 = elem.canPlayType( 'video/mp4; codecs="avc1.42E01E"' ).replace( rNos, "" );
            ret.webm = elem.canPlayType( 'video/webm; codecs="vp8, vorbis"' ).replace( rNos, "" );
        }

    } catch ( e ) {}

    return ret;
},

/**
 *
 * Play an audio context
 * @method sourceStart
 * @param {string} track audio object to play
 * @private
 *
 */
sourceStart = function ( track ) {
    if ( !track.source.start ) {
        track.source.noteOn( 0, track.startOffset % track.buffer.duration );
        
    } else {
        track.source.start( 0, track.startOffset % track.buffer.duration );
    }
},

/**
 *
 * Stop an audio context
 * @method sourceStop
 * @param {string} track audio object to stop
 * @private
 *
 */
sourceStop = function ( track ) {
    if ( !track.source.stop ) {
        track.source.noteOff( 0 );
        
    } else {
        track.source.stop( 0 );
    }
},

/**
 *
 * Get mimetype string from media source
 * @method getMimeFromMedia
 * @param {string} src media file source
 * @private
 *
 */
getMimeFromMedia = function ( src ) {
    var ret;
    
    switch ( src.split( "." ).pop().toLowerCase().replace( rHashQuery, "" ) ) {
        // Audio mimes
        case "ogg":
            ret = "audio/ogg";
            break;
        case "mp3":
            ret = "audio/mpeg";
            break;
            
        // Video mimes
        case "webm":
            ret = "video/webm";
            break;
        case "mp4":
            ret = "video/mp4";
            break;
        case "ogv":
            ret = "video/ogg";
            break;
    }
    
    return ret;
},

/**
 *
 * Get the audio source that should be used
 * @method getCanPlaySource
 * @param {string} media the media type to check
 * @param {array} sources Array of media sources
 * @returns object
 * @private
 *
 */
getCanPlaySource = function ( media, sources ) {
    var source, canPlay;
    
    for ( var i = sources.length; i--; ) {
        var src = sources[ i ].split( "." ).pop().toLowerCase().replace( rHashQuery, "" );
        
        if ( media === "video" && src === "mp4" ) {
            if ( (MediaBox.support.video.mpeg4 === "probably" || MediaBox.support.video.h264 === "probably") ) {
                source = sources[ i ];
                
                canPlay = "probably";
                
            } else if ( (MediaBox.support.video.mpeg4 === "maybe" || MediaBox.support.video.h264 === "maybe") ) {
                source = sources[ i ];
                
                canPlay = "maybe";
            }
            
        } else if ( MediaBox.support[ media ][ src ] === "probably" ) {
            source = sources[ i ];
            
            canPlay = "probably";
            
        } else if ( MediaBox.support[ media ][ src ] === "maybe" ) {
            source = sources[ i ];
            
            canPlay = "maybe";
        }
        
        if ( source ) {
            break;
        }
    }
    
    return {
        source: source,
        canPlay: canPlay
    };
},


/**
 *
 * Default values for boolean video element properties
 * @member videoProps
 * @private
 *
 */
videoProps = {
    autoplay: false,
    autobuffer: false,
    controls: false,
    loop: false,
    muted: false
},


/**
 *
 * A complete management tool for html5 video and audio context
 * @constructor MediaBox
 * @requires Easing
 * @requires Tween
 * @memberof! <global>
 *
 */
MediaBox = function () {
    return this.init.apply( this, arguments );
};

/**
 *
 * MediaBox support object
 * @memberof MediaBox
 * @member support
 *
 */
MediaBox.support = {
    audio: getAudioSupport(),
    video: getVideoSupport()
};

/**
 *
 * MediaBox stopped state constant
 * @memberof MediaBox
 * @member STATE_STOPPED
 *
 */
MediaBox.STATE_STOPPED = 0;

/**
 *
 * MediaBox stopping state constant
 * @memberof MediaBox
 * @member STATE_STOPPING
 *
 */
MediaBox.STATE_STOPPING = 1;

/**
 *
 * MediaBox paused state constant
 * @memberof MediaBox
 * @member STATE_PAUSED
 *
 */
MediaBox.STATE_PAUSED = 2;

/**
 *
 * MediaBox playing state constant
 * @memberof MediaBox
 * @member STATE_PLAYING
 *
 */
MediaBox.STATE_PLAYING = 3;

/**
 *
 * MediaBox prototype
 *
 */
MediaBox.prototype = {
    constructor: MediaBox,
    
    /**
     *
     * MediaBox init constructor method
     * @memberof MediaBox
     * @method init
     *
     */
    init: function () {
        /**
         *
         * MediaBox information for each channel.
         * These are default channels you can use.
         * <ul>
         * <li>bgm - background music channel</li>
         * <li>sfx - sound effects channel</li>
         * <li>vid - video channel</li>
         * </ul>
         * @memberof MediaBox
         * @member _channels
         *
         */
        this._channels = {
            bgm: {
                volume: 1
            },
            sfx: {
                volume: 1
            },
            vid: {
                volume: 1
            }
        };
        
        /**
         *
         * MediaBox holds all loaded source urls
         * @memberof MediaBox
         * @member _urls
         *
         */
        this._urls = [];
        
        /**
         *
         * MediaBox holds all audio tracks
         * @memberof MediaBox
         * @member _audio
         *
         */
        this._audio = {};
        
        /**
         *
         * MediaBox holds all video tracks
         * @memberof MediaBox
         * @member _video
         *
         */
        this._video = {};
        
        /**
         *
         * MediaBox boolean to stop/start all audio
         * @memberof MediaBox
         * @member _audioPaused
         *
         */
        this._audioPaused = false;
        
        /**
         *
         * Total number of media objects to load
         * @memberof MediaBox
         * @member _mediaCount
         *
         */
        this._mediaCount = 0;
        
        /**
         *
         * Total number of media objects loaded in progress
         * @memberof MediaBox
         * @member _mediaLoads
         *
         */
        this._mediaLoads = 0;
        
        /**
         *
         * The progress event handler
         * @memberof MediaBox
         * @member _progressHandler
         *
         */
        this._progressHandler = null;
    },
    
    /**
     *
     * MediaBox crossbrowser create audio context
     * @memberof MediaBox
     * @method createAudioContext
     * @returns instance of audio context
     *
     */
    createAudioContext: function () {
        var AudioContext;
        
        if ( window.AudioContext ) {
            AudioContext = window.AudioContext;
            
        } else if ( window.webkitAudioContext ) {
            AudioContext = window.webkitAudioContext;
        }
        
        return ( AudioContext ) ? new AudioContext() : AudioContext;
    },
    
    /**
     *
     * MediaBox crossbrowser create gain node
     * @memberof MediaBox
     * @method createGainNode
     * @returns audio context gain node
     *
     */
    createGainNode: function ( context ) {
        var gainNode;
        
        if ( !context.createGain ) {
            gainNode = context.createGainNode();
            
        } else {
            gainNode = context.createGain();
        }
        
        return gainNode;
    },
    
    /**
     *
     * MediaBox check if media is loaded via ajax
     * @memberof MediaBox
     * @method isLoaded
     * @param {string} id reference id for media
     * @returns boolean
     *
     */
    isLoaded: function ( id ) {
        var obj = this._video[ id ] ? this._video[ id ] : this._audio[ id ];
        
        return (obj.loaded === true);
    },
    
    /**
     *
     * MediaBox check stopped/paused status for audio/video
     * @memberof MediaBox
     * @method isStopped
     * @param {string} id reference id for media
     * @returns boolean
     *
     */
    isStopped: function ( id ) {
        var obj = this._video[ id ] ? this._video[ id ] : this._audio[ id ];
        
        return (obj.state === MediaBox.STATE_STOPPED);
    },
    
    /**
     *
     * MediaBox check stopped/paused status for audio/video
     * @memberof MediaBox
     * @method isPaused
     * @param {string} id reference id for media
     * @returns boolean
     *
     */
    isPaused: function ( id ) {
        var obj = this._video[ id ] ? this._video[ id ] : this._audio[ id ];
        
        return (obj.state === MediaBox.STATE_PAUSED);
    },
    
    /**
     *
     * MediaBox check playing status for audio/video
     * @memberof MediaBox
     * @method isPlaying
     * @param {string} id reference id for media
     * @returns boolean
     *
     */
    isPlaying: function ( id ) {
        var obj = this._video[ id ] ? this._video[ id ] : this._audio[ id ];
        
        return (obj.state === MediaBox.STATE_PLAYING || obj.state === MediaBox.STATE_STOPPING);
    },
    
    /**
     *
     * MediaBox set volume for audio OR video
     * @memberof MediaBox
     * @method setVolume
     * @param {string} id reference id for media
     * @param {number} volume the volume to set to
     *
     */
    setVolume: function ( id, volume ) {
        var obj = this._video[ id ] ? this._video[ id ] : this._audio[ id ];
        
        // Audio
        if ( obj.context ) {
            obj.gainNode.gain.value = volume;
        
        // Video
        } else {
            obj.element.volume = volume;
        }
    },
    
    /**
     *
     * MediaBox set volume for audio OR video
     * @memberof MediaBox
     * @method getVolume
     * @param {string} id reference id for media
     * @returns number
     *
     */
    getVolume: function ( id ) {
        var obj = this._video[ id ] ? this._video[ id ] : this._audio[ id ];
        
        return ( obj.context ) ? obj.gainNode.gain.value : obj.element.volume;
    },
    
    /**
     *
     * MediaBox play a media object abstractly
     * @memberof MediaBox
     * @method playObject
     * @param {string} id reference id for media
     *
     */
    playObject: function ( id ) {
        var obj = this._video[ id ] ? this._video[ id ] : this._audio[ id ];
        
        // Audio
        if ( obj.context ) {
            this.playAudio( id );
        
        // Video
        } else {
            this.playVideo( id );
        }
    },
    
    /**
     *
     * MediaBox stop a media object abstractly
     * @memberof MediaBox
     * @method stopObject
     * @param {string} id reference id for media
     *
     */
    stopObject: function ( id ) {
        var obj = this._video[ id ] ? this._video[ id ] : this._audio[ id ];
        
        // Audio
        if ( obj.context ) {
            this.stopAudio( id );
        
        // Video
        } else {
            this.stopVideo( id );
        }
    },
    
    /**
     *
     * MediaBox load media config JSON formatted in Akihabara bundle style
     * @memberof MediaBox
     * @method loadMedia
     * @param {string} url The url to the JSON config
     * @param {function} callback Fired when all media is loaded
     * @example Akihabara bundle format
     * "addAudio": [
     *     [
     *         "{id}",
     *         [
     *             "{file}.mp3",
     *             "{file}.ogg"
     *         ],
     *         {
     *             "channel": "bgm",
     *             "loop": true
     *         }
     *     ]
     * ]
     *
     */
    loadMedia: function ( url, callback ) {
        var xhr = new XMLHttpRequest(),
            self = this;
        
        xhr.open( "GET", url, true );
        xhr.onreadystatechange = function ( e ) {
            if ( this.readyState === 4 ) {
                if ( this.status === 200 ) {
                    var response;
                        
                    try {
                        response = JSON.parse( this.responseText );
                        
                    } catch ( error ) {}
                    
                    if ( response ) {
                        self.addMedia( response, callback );
                    }
                }
            }
        };
        xhr.send();
    },
    
    /**
     *
     * MediaBox add media from bundle json
     * @memberof MediaBox
     * @method addMedia
     * @param {object} json Akihabara formatted media bundle object
     * @param {function} callback function fired on XMLHttpRequest.onload
     *
     */
    addMedia: function ( json, callback ) {
        var current = 0,
            total = 0,
            func = function () {
                current++;
                
                if ( isFunction( callback ) && (current === total) ) {
                    callback();
                }
            };
        
        for ( var m in json ) {
            total = total + json[ m ].length;
            
            this._mediaCount = total;
            
            for ( var i = json[ m ].length; i--; ) {
                // Reference to this.addVideo / this.addAudio
                this[ m ]( json[ m ][ i ], func );
            }
        }
    },
    
    /**
     *
     * Bind the progress handler for a given batch of media
     * @memberof MediaBox
     * @method addProgress
     * @param {function} callback function fired on progress processing
     *
     */
    addProgress: function ( callback ) {
        this._progressHandler = callback;
    },
    
    /**
     *
     * MediaBox add a video element
     * @memberof MediaBox
     * @method addVideo
     * @param {array} obj Akihabara formatted media bundle
     * @param {function} callback function fired on XMLHttpRequest.onload
     * @example Video object
     * {
     *      channel:        string,
     *      sources:        array,
     *      element:        DOMElement
     *      state:          number
     *      loaded:         boolean
     *      _source:        object {source:string, canPlay:string},
     *      _events:        object
     * }
     *
     */
    addVideo: function ( obj, callback ) {
        var self = this,
            id = obj.id,
            src = obj.src,
            props = {
                element: obj.element,
                channel: obj.channel,
                CORS: (obj.CORS || false)
            },
            mediaObj = {},
            
            // Handle the loaded video
            handler = function () {
                var source = document.createElement( "source" );
                    source.src = mediaObj._source.source;
                    source.type = getMimeFromMedia( mediaObj._source.source );
                
                self._processLoaded();
                
                mediaObj.loaded = true;
                mediaObj.element.appendChild( source );
                
                self._video[ id ] = mediaObj;
                
                if ( isFunction( callback ) ) {
                    callback();
                }
            },
            xhr;
        
        // Disallow overrides
        if ( this._video[ id ] || !id || !src ) {
            //console.log( "@MediaBox:addVideo Already added " + id );
            return;
        }
        
        // Allow new channels to exist
        if ( !this._channels[ props.channel ] ) {
            this._channels[ props.channel ] = {};
        }
        
        // Create video object
        mediaObj.state = MediaBox.STATE_STOPPED;
        mediaObj.loaded = false;
        mediaObj.element = (props.element || document.createElement( "video" ));
        mediaObj.channel = props.channel;
        mediaObj.sources = src;
        mediaObj._source = getCanPlaySource( "video", src );
        mediaObj._events = {};
        
        // Check if we have loaded this url before
        // If so, we don't want to make another request for it
        // but we still need to create the video object out of it
        if ( this._urls.indexOf( mediaObj._source.source ) !== -1 ) {
            if ( isFunction( callback ) ) {
                handler();
                return;
            }
        }
        
        // Push the source onto the loaded url stack
        this._urls.push( mediaObj._source.source );
        
        // Bypass the preload process with xhr if CORS
        // Currently, we don't support doing this request type
        if ( props.CORS ) {
            handler();
            return;
        }
        
        xhr = new XMLHttpRequest();
        xhr.open( "GET", mediaObj._source.source, true );
        xhr.onload = function ( e ) {
            handler();
        };
        xhr.send();
    },
    
    /**
     *
     * MediaBox append the video element to another element
     * @memberof MediaBox
     * @method appendVideoTo
     * @param {string} id Video id to add event for
     * @param {object} element The element to append to
     *
     */
    appendVideoTo: function ( id, element ) {
        if ( this._video[ id ] && isElement( element ) ) {
            element.appendChild( this._video[ id ].element );
        }
    },
    
    /**
     *
     * MediaBox prepend the video element to another element
     * @memberof MediaBox
     * @method appendVideoTo
     * @param {string} id Video id
     * @param {object} element The element to pepend to
     *
     */
    prependVideoTo: function ( id, element ) {
        if ( this._video[ id ] && isElement( element ) ) {
            if ( element.hasChildNodes() ) {
                element.insertBefore( this._video[ id ].element, element.firstChild );
                
            } else {
                this.appendVideoTo( id, element );
            }
        }
    },
    
    /**
     *
     * MediaBox replace an existing element with the mediabox video element
     * @memberof MediaBox
     * @method replaceAsVideo
     * @param {string} id Video id
     * @param {object} element The element to be replaced
     *
     */
    replaceAsVideo: function ( id, element ) {
        if ( this._video[ id ] && isElement( element ) ) {
            element.parentNode.replaceChild( this._video[ id ].element, element );
        }
    },
    
    /**
     *
     * MediaBox get a video element property/attribute
     * @memberof MediaBox
     * @method getVideoProp
     * @param {string} id Video id
     * @param {string} prop The property to access
     *
     */
    getVideoProp: function ( id, prop ) {
        if ( this._video[ id ] ) {
            return (this._video[ id ].element[ prop ] || this._video[ id ].element.getAttribute( prop ));
        }
    },
    
    /**
     *
     * MediaBox set a video element property/attribute
     * @memberof MediaBox
     * @method setVideoProp
     * @param {string} id Video id
     * @param {string} prop The property to set
     * @param {mixed} value The value to assign
     *
     */
    setVideoProp: function ( id, prop, value ) {
        if ( this._video[ id ] ) {
            this._video[ id ].element[ prop ] = value;
        }
    },
    
    /**
     *
     * MediaBox set a video element attribute
     * @memberof MediaBox
     * @method setVideoAttr
     * @param {string} id Video id
     * @param {string} prop The property to set
     * @param {mixed} value The value to assign
     *
     */
    setVideoAttr: function ( id, prop, value ) {
        if ( this._video[ id ] ) {
            this._video[ id ].element.setAttribute( prop, value );
        }
    },
    
    /**
     *
     * MediaBox add a video element event listener
     * @memberof MediaBox
     * @method addVideoEvent
     * @param {string} id Video id to add event for
     * @param {string} event Event to add
     * @param {function} callback The event handler to call
     *
     */
    addVideoEvent: function ( id, event, callback ) {
        if ( this._video[ id ] ) {
            this._video[ id ]._events[ event ] = function () {
                if ( isFunction( callback ) ) {
                    callback.apply( this, arguments );
                }
            };
            
            this._video[ id ].element.addEventListener( event, this._video[ id ]._events[ event ], false );
        }
    },
    
    /**
     *
     * MediaBox remove a video element event listener
     * @memberof MediaBox
     * @method addVideoEvent
     * @param {string} id Video id to remove event for
     * @param {string} event Event to remove
     *
     */
    removeVideoEvent: function ( id, event ) {
        if ( this._video[ id ] ) {
            this._video[ id ].element.removeEventListener( event, this._video[ id ]._events[ event ], false );
            
            this._video[ id ]._events[ event ] = null;
        }
    },
    
    /**
     *
     * MediaBox get video element by id
     * @memberof MediaBox
     * @method getVideo
     * @param {string} id reference id for media
     * @returns <video> element
     *
     */
    getVideo: function ( id ) {
        if ( this._video[ id ] ) {
            return this._video[ id ].element;
        }
    },
    
    /**
     *
     * MediaBox get all video elements as an array
     * @memberof MediaBox
     * @method getVideos
     * @returns array
     *
     */
    getVideos: function () {
        var ret = [],
            id;
        
        for ( id in this._video ) {
            ret.push( this._video[ id ].element );
        }
        
        return ret;
    },
    
    /**
     *
     * MediaBox play video element by id
     * @memberof MediaBox
     * @method playVideo
     * @param {string} id reference id for media
     *
     */
    playVideo: function ( id ) {
        if ( this._video[ id ] && this.isLoaded( id ) && (this.isStopped( id ) || this.isPaused( id )) ) {
            this._video[ id ].element.volume = this._channels[ this._video[ id ].channel ].volume;
            this._video[ id ].element.play();
            this._video[ id ].state = MediaBox.STATE_PLAYING;
        }
    },
    
    /**
     *
     * MediaBox stop video element by id with a paused state
     * @memberof MediaBox
     * @method pauseVideo
     * @param {string} id reference id for media
     *
     */
    pauseVideo: function ( id ) {
        if ( this._video[ id ] && this.isLoaded( id ) && this.isPlaying( id ) ) {
            this._video[ id ].element.pause();
            this._video[ id ].state = MediaBox.STATE_PAUSED;
        }
    },
    
    /**
     *
     * MediaBox stop video element by id with a stopped state
     * @memberof MediaBox
     * @method playVideo
     * @param {string} id reference id for media
     *
     */
    stopVideo: function ( id ) {
        if ( this._video[ id ] && this.isLoaded( id ) && this.isPlaying( id ) ) {
            this._video[ id ].element.pause();
            this._video[ id ].state = MediaBox.STATE_STOPPED;
        }
    },
    
    /**
     *
     * MediaBox add an audio context
     * @memberof MediaBox
     * @method addAudio
     * @param {array} obj Akihabara formatted media bundle
     * @param {function} callback function fired on XMLHttpRequest.onload
     * @example Audio object
     * {
     *      channel:        string,
     *      loop:           boolean
     *      sources:        array,
     *      context:        AudioContext
     *      state:          number
     *      loaded:         boolean
     *      startTime:      number,
     *      startOffset:    number,
     *      buffer:         ArrayBuffer,
     *      gainNode:       GainNode,
     *      _source:    object {source:string, canPlay:string},
     * }
     *
     */
    addAudio: function ( obj, callback ) {
        var self = this,
            id = obj[ 0 ],
            src = obj[ 1 ],
            props = obj[ 2 ],
            mediaObj = {},
            xhr;
        
        // Disallow overrides
        if ( this._audio[ id ] ) {
            //console.log( "@MediaBox:addAudio Already added " + id );
            return;
        }
        
        // Allow new channels to exist
        if ( !this._channels[ props.channel ] ) {
            this._channels[ props.channel ] = {};
        }
        
        // Create audio object
        mediaObj.channel = props.channel;
        mediaObj.loop = (props.loop || false);
        mediaObj.sources = src;
        mediaObj.context = this.createAudioContext();
        mediaObj.state = MediaBox.STATE_STOPPED;
        mediaObj.loaded = false;
        mediaObj._source = getCanPlaySource( "audio", src );
        
        xhr = new XMLHttpRequest();
        xhr.open( "GET", mediaObj._source.source, true );
        xhr.responseType = "arraybuffer";
        xhr.onload = function ( e ) {
            mediaObj.context.decodeAudioData( xhr.response, function ( buffer ) {
                self._processLoaded();
                
                mediaObj.loaded = true;
                mediaObj.startTime = 0;
                mediaObj.startOffset = 0;
                mediaObj.buffer = buffer;
                mediaObj.gainNode = self.createGainNode( mediaObj.context );
                
                self._audio[ id ] = mediaObj;
                
                if ( isFunction( callback ) ) {
                    callback();
                }
            });
        };
        xhr.send();
    },
    
    /**
     *
     * MediaBox play audio context
     * @memberof MediaBox
     * @method playAudio
     * @param {string} id string reference id for audio
     *
     */
    playAudio: function ( id ) {
        if ( this._audio[ id ] ) {
            this._audio[ id ].startTime = this._audio[ id ].context.currentTime;
            
            this._audio[ id ].source = this._audio[ id ].context.createBufferSource();
            this._audio[ id ].source.buffer = this._audio[ id ].buffer;
            this._audio[ id ].source.connect( this._audio[ id ].gainNode );
            this._audio[ id ].gainNode.connect( this._audio[ id ].context.destination );
            this._audio[ id ].gainNode.gain.value = (this._channels[ this._audio[ id ].channel ].volume || 1.0);
            
            if ( this._audio[ id ].loop ) {
                this._audio[ id ].source.loop = true;
            }
            
            sourceStart( this._audio[ id ] );
            
            this._audio[ id ].state = MediaBox.STATE_PLAYING;
        }
    },
    
    /**
     *
     * MediaBox simply a wrapper for playAudio
     * @memberof MediaBox
     * @method hitAudio
     * @param {string} id string reference id for audio
     *
     */
    hitAudio: function ( id ) {
        this.playAudio( id );
    },
    
    /**
     *
     * MediaBox stop playing an audio context
     * @memberof MediaBox
     * @method stopAudio
     * @param {string} id string reference id for audio
     *
     */
    stopAudio: function ( id ) {
        if ( this._audio[ id ] ) {
            this._audio[ id ].startTime = 0;
            this._audio[ id ].startOffset = 0;
            this._audio[ id ].state = MediaBox.STATE_STOPPED;
            
            sourceStop( this._audio[ id ] );
        }
    },
    
    /**
     *
     * MediaBox pause playing audio, calls sourceStop
     * @memberof MediaBox
     * @method pauseAudio
     * @param {string} id id of audio to pause
     *
     */
    pauseAudio: function ( id ) {
        if ( this._audio[ id ] ) {
            this._audio[ id ].startOffset += (this._audio[ id ].context.currentTime - this._audio[ id ].startTime);
            this._audio[ id ].state = MediaBox.STATE_PAUSED;
            
            sourceStop( this._audio[ id ] );
        }
    },
    
    /**
     *
     * MediaBox fade in audio/video volume
     * @memberof MediaBox
     * @method fadeVolumeIn
     * @param {string} id string reference id for audio
     * @param {number} duration tween time in ms
     * @param {function} easing optional easing to use
     *
     */
    fadeVolumeIn: function ( id, duration, easing ) {
        var obj = this._video[ id ] ? this._video[ id ] : this._audio[ id ],
            self = this,
            volume;
        
        if ( obj && obj.state === MediaBox.STATE_PLAYING ) {
            //console.log( "@MediaBox:fadeVolumeIn Already playing " + id );
            return this;
        }
        
        if ( obj ) {
            volume = this._channels[ obj.channel ].volume;
            
            // Only reset volume and play if object is stopped
            // Object state could be STATE_STOPPING at this point
            if ( obj.state === MediaBox.STATE_STOPPED ) {
                this.setVolume( id, 0 );
                this.playObject( id );
                
            } else if ( obj.state === MediaBox.STATE_STOPPING ) {
                obj.state = MediaBox.STATE_PLAYING;
            }
            
            new Tween({
                to: volume,
                from: 0,
                ease: ( isFunction( easing ) ) ? easing : Easing.linear,
                duration: (duration || 1000),
                update: function ( v ) {
                    self.setVolume( id, v );
                },
                complete: function () {
                    self.setVolume( id, volume );
                }
            });
        }
    },
    
    /**
     *
     * MediaBox fade out audio/video volume
     * @memberof MediaBox
     * @method fadeVolumeOut
     * @param {string} id string reference id for audio
     * @param {number} duration tween time in ms
     * @param {function} easing optional easing to use
     *
     */
    fadeVolumeOut: function ( id, duration, easing ) {
        var obj = this._video[ id ] ? this._video[ id ] : this._audio[ id ];
        
        if ( obj && obj.state === MediaBox.STATE_STOPPING ) {
            //console.log( "@MediaBox:fadeVolumeOut Already stopping " + id );
            return this;
        }
        
        var self = this,
            handler = function ( v ) {
                // Check audio state on fadeout in case it is started again
                // before the duration of the fadeout is complete.
                if ( obj.state === MediaBox.STATE_STOPPING ) {
                    self.setVolume( id, (v < 0) ? 0 : v );
                    
                    if ( self.getVolume( id ) === 0 ) {
                        self.stopObject( id );
                    }
                }
            };
        
        if ( obj ) {
            obj.state = MediaBox.STATE_STOPPING;
            
            new Tween({
                to: 0,
                from: self.getVolume( id ),
                ease: ( isFunction( easing ) ) ? easing : Easing.linear,
                duration: (duration || 1000),
                update: handler,
                complete: handler
            });
        }
    },
    
    /**
     *
     * MediaBox pause all playing audio for a given channel id
     * @memberof MediaBox
     * @method stopChannel
     * @param {string} channel string reference id for channel
     *
     */
    stopChannel: function ( channel ) {
        var id;
        
        // Look at video index
        for ( id in this._video ) {
            if ( this._video[ id ].channel === channel && this._video[ id ].state === MediaBox.STATE_PLAYING ) {
                this.pauseVideo( id );
            }
        }
        
        // Look at audio index
        for ( id in this._audio ) {
            if ( this._audio[ id ].channel === channel && this._audio[ id ].state === MediaBox.STATE_PLAYING ) {
                this.pauseAudio( id );
            }
        }
    },
    
    /**
     *
     * MediaBox resume all playing audio for a given channel id
     * @memberof MediaBox
     * @method playChannel
     * @param {string} channel string reference id for channel
     *
     */
    playChannel: function ( channel ) {
        var id;
        
        // Look at video index
        for ( id in this._video ) {
            if ( this._video[ id ].channel === channel && this._video[ id ].state === MediaBox.STATE_PAUSED ) {
                this.playVideo( id );
            }
        }
        
        // Look at audio index
        for ( id in this._audio ) {
            if ( this._audio[ id ].channel === channel && this._audio[ id ].state === MediaBox.STATE_PAUSED ) {
                this.playAudio( id );
            }
        }
    },
    
    /**
     *
     * MediaBox fade out all playing audio/video for a given channel id
     * @memberof MediaBox
     * @method fadeChannelOut
     * @param {string} channel string reference id for channel
     * @param {number} duration tween time in ms
     *
     */
    fadeChannelOut: function ( channel, duration ) {
        var id;
        
        // Look at video index
        for ( id in this._video ) {
            if ( this._video[ id ].channel === channel && this._video[ id ].state === MediaBox.STATE_PLAYING ) {
                this.fadeVolumeOut( id, duration );
            }
        }
        
        // Look at audio index
        for ( id in this._audio ) {
            if ( this._audio[ id ].channel === channel && this._audio[ id ].state === MediaBox.STATE_PLAYING ) {
                this.fadeVolumeOut( id, duration );
            }
        }
    },
    
    /**
     *
     * MediaBox fade in all playing audio/video for a given channel id
     * @memberof MediaBox
     * @method fadeChannelIn
     * @param {string} channel string reference id for channel
     * @param {number} duration tween time in ms
     *
     */
    fadeChannelIn: function ( channel, duration ) {
        var id;
        
        // Look at video index
        for ( id in this._video ) {
            if ( this._video[ id ].channel === channel && this._video[ id ].state === MediaBox.STATE_STOPPED ) {
                this.fadeVolumeIn( id, duration );
            }
        }
        
        // Look at audio index
        for ( id in this._audio ) {
            if ( this._audio[ id ].channel === channel && this._audio[ id ].state === MediaBox.STATE_STOPPED ) {
                this.fadeVolumeIn( id, duration );
            }
        }
    },
    
    /**
     *
     * MediaBox crossfade volume between multiple channels
     * @memberof MediaBox
     * @method crossFadeChannel
     * @param {string} channel string reference id for channel
     * @param {number} duration tween time in ms
     *
     */
    crossFadeChannel: function ( channel, duration ) {
        var id;
        
        // Look at video index
        for ( id in this._video ) {
            if ( this._video[ id ].channel === channel && this._video[ id ].state === MediaBox.STATE_PLAYING ) {
                this.fadeVolumeOut( id, duration );
            }
        }
        
        // Look at audio index
        for ( id in this._audio ) {
            if ( this._audio[ id ].channel === channel && this._audio[ id ].state === MediaBox.STATE_PLAYING ) {
                this.fadeVolumeOut( id, duration );
            }
        }
        
        this.fadeVolumeIn( id, duration );
    },
    
    /**
     *
     * MediaBox set the master volume for a channel
     * @memberof MediaBox
     * @method setChannelProp
     * @param {string} id string id reference to channel
     * @param {string} key string prop key
     * @param {string} val prop val
     *
     */
    setChannelProp: function ( id, key, val ) {
        if ( this._channels[ id ] ) {
            this._channels[ id ][ key ] = val;
        }
    },
    
    /**
     *
     * MediaBox pause all playing audio on a channel
     * @memberof MediaBox
     * @method pauseAll
     *
     */
    pauseAll: function ( channel ) {
        var id;
        
        if ( this._audioPaused ) {
            return this;
        }
        
        this._audioPaused = true;
        
        for ( id in this._audio ) {
            if ( this._audio[ id ].state === MediaBox.STATE_PLAYING ) {
                if ( this._audio[ id ].channel === channel ) {
                    this.pauseAudio( id );
                }
            }
        }
    },
    
    /**
     *
     * MediaBox resume all playing audio on a channel
     * @memberof MediaBox
     * @method resumeAll
     *
     */
    resumeAll: function ( channel ) {
        var id;
        
        if ( !this._audioPaused ) {
            return this;
        }
        
        this._audioPaused = false;
        
        for ( id in this._audio ) {
            if ( this._audio[ id ].state === MediaBox.STATE_PAUSED ) {
                if ( this._audio[ id ].channel === channel ) {
                    this.playAudio( id );
                }
            }
        }
    },
    
    /**
     *
     * Process load data each time a request fulfills
     * @memberof MediaBox
     * @method _processLoaded
     * @private
     *
     */
    _processLoaded: function () {
        this._mediaLoads++;
        
        if ( isFunction( this._progressHandler ) ) {
            this._progressHandler({
                total: this._mediaCount,
                loaded: this._mediaLoads,
                decimalPercent: (this._mediaLoads / this._mediaCount),
                wholePercent: (this._mediaLoads / this._mediaCount) * 100
            });
        }
        
        // Reset the media counters after this batch is loaded
        if ( this._mediaLoads === this._mediaCount ) {
            this._mediaCount = 0;
            this._mediaLoads = 0;
        }
    }
};


// Expose
window.funpack.pack( "MediaBox", MediaBox );


})( this, this.document, (window.Easing || window.funpack( "Easing" )), (window.Tween || window.funpack( "Tween" )) );

/*!
 *
 * Window resize / orientationchange event controller
 *
 * @ResizeController
 * @author: kitajchuk
 *
 *
 */
(function ( Controller ) {


"use strict";


// Break on no Controller
if ( !Controller ) {
    throw new Error( "ResizeController Class requires Controller Class" );
}


// Current window viewport
var _currentView = {
        width: null,
        height: null,
        orient: null
    },

    // Singleton
    _instance = null;

/**
 *
 * Window resize / orientationchange event controller
 * @constructor ResizeController
 * @augments Controller
 * @requires Controller
 * @memberof! <global>
 *
 * @fires resize
 * @fires resizedown
 * @fires resizeup
 * @fires orientationchange
 * @fires orientationportrait
 * @fires orientationlandscape
 *
 */
var ResizeController = function () {
    // Singleton
    if ( !_instance ) {
        _instance = this;

        // Call on parent cycle
        this.go(function () {
            var currentView = _instance.getViewport(),
                isStill = (currentView.width === _currentView.width && currentView.height === _currentView.height),
                isResize = (currentView.width !== _currentView.width || currentView.height !== _currentView.height),
                isResizeUp = (currentView.width > _currentView.width || currentView.height > _currentView.height),
                isResizeDown = (currentView.width < _currentView.width || currentView.height < _currentView.height),
                isOrientation = (currentView.orient !== _currentView.orient),
                isOrientationPortrait = (currentView.orient !== _currentView.orient && currentView.orient !== 90),
                isOrientationLandscape = (currentView.orient !== _currentView.orient && currentView.orient === 90);

            // Fire blanket resize event
            if ( isResize ) {
                /**
                 *
                 * @event resize
                 *
                 */
                _instance.fire( "resize" );
            }

            // Fire resizeup and resizedown
            if ( isResizeDown ) {
                /**
                 *
                 * @event resizedown
                 *
                 */
                _instance.fire( "resizedown" );

            } else if ( isResizeUp ) {
                /**
                 *
                 * @event resizeup
                 *
                 */
                _instance.fire( "resizeup" );
            }

            // Fire blanket orientationchange event
            if ( isOrientation ) {
                /**
                 *
                 * @event orientationchange
                 *
                 */
                _instance.fire( "orientationchange" );
            }

            // Fire orientationportrait and orientationlandscape
            if ( isOrientationPortrait ) {
                /**
                 *
                 * @event orientationportrait
                 *
                 */
                _instance.fire( "orientationportrait" );

            } else if ( isOrientationLandscape ) {
                /**
                 *
                 * @event orientationlandscape
                 *
                 */
                _instance.fire( "orientationlandscape" );
            }

            _currentView = currentView;
        });
    }

    return _instance;
};

ResizeController.prototype = new Controller();

/**
 *
 * Returns the current window viewport specs
 * @memberof ResizeController
 * @method getViewport
 * @returns object
 *
 */
ResizeController.prototype.getViewport = function () {
    return {
        width: window.innerWidth,
        height: window.innerHeight,
        orient: ("orientation" in window) ? Math.abs( window.orientation ) : null
    };
};

/**
 *
 * Tells if the viewport is in protrait mode
 * @memberof ResizeController
 * @method isPortrait
 * @returns boolean
 *
 */
ResizeController.prototype.isPortrait = function () {
    return (this.getViewport().orient !== 90);
};

/**
 *
 * Tells if the viewport is in landscape mode
 * @memberof ResizeController
 * @method isLandscape
 * @returns boolean
 *
 */
ResizeController.prototype.isLandscape = function () {
    return (this.getViewport().orient === 90);
};


// Expose
window.funpack.pack( "ResizeController", ResizeController );


})( (window.Controller || window.funpack( "Controller" )) );

/*!
 *
 * Window scroll event controller
 *
 * @ScrollController
 * @author: kitajchuk
 *
 *
 */
(function ( Controller ) {


"use strict";


// Break on no Controller
if ( !Controller ) {
    throw new Error( "ScrollController Class requires Controller Class" );
}


// Current scroll position
var _currentY = null,

    // Singleton
    _instance = null;

/**
 *
 * Window scroll event controller
 * @constructor ScrollController
 * @augments Controller
 * @requires Controller
 * @memberof! <global>
 *
 * @fires scroll
 * @fires scrolldown
 * @fires scrollup
 * @fires scrollmax
 * @fires scrollmin
 *
 */
var ScrollController = function () {
    // Singleton
    if ( !_instance ) {
        _instance = this;

        // Call on parent cycle
        this.go(function () {
            var currentY = _instance.getScrollY(),
                isStill = (currentY === _currentY),
                isScroll = (currentY !== _currentY),
                isScrollUp = (currentY < _currentY),
                isScrollDown = (currentY > _currentY),
                isScrollMax = (currentY !== _currentY && _instance.isScrollMax()),
                isScrollMin = (currentY !== _currentY && _instance.isScrollMin());

            // Fire blanket scroll event
            if ( isScroll ) {
                /**
                 *
                 * @event scroll
                 *
                 */
                _instance.fire( "scroll" );
            }

            // Fire scrollup and scrolldown
            if ( isScrollDown ) {
                /**
                 *
                 * @event scrolldown
                 *
                 */
                _instance.fire( "scrolldown" );

            } else if ( isScrollUp ) {
                /**
                 *
                 * @event scrollup
                 *
                 */
                _instance.fire( "scrollup" );
            }

            // Fire scrollmax and scrollmin
            if ( isScrollMax ) {
                /**
                 *
                 * @event scrollmax
                 *
                 */
                _instance.fire( "scrollmax" );

            } else if ( isScrollMin ) {
                /**
                 *
                 * @event scrollmin
                 *
                 */
                _instance.fire( "scrollmin" );
            }

            _currentY = currentY;
        });
    }

    return _instance;
};

ScrollController.prototype = new Controller();

/**
 *
 * Returns the current window vertical scroll position
 * @memberof ScrollController
 * @method getScrollY
 * @returns number
 *
 */
ScrollController.prototype.getScrollY = function () {
    return (window.scrollY || document.documentElement.scrollTop);
};

/**
 *
 * Get the max document scrollable height
 * @memberof ScrollController
 * @method getScrollMax
 * @returns number
 *
 */
ScrollController.prototype.getScrollMax = function () {
    return (document.documentElement.offsetHeight - window.innerHeight);
};

/**
 *
 * Determines if scroll position is at maximum for document
 * @memberof ScrollController
 * @method isScrollMax
 * @returns boolean
 *
 */
ScrollController.prototype.isScrollMax = function () {
    return (this.getScrollY() >= (document.documentElement.offsetHeight - window.innerHeight));
};

/**
 *
 * Determines if scroll position is at minimum for document
 * @memberof ScrollController
 * @method isScrollMin
 * @returns boolean
 *
 */
ScrollController.prototype.isScrollMin = function () {
    return (this.getScrollY() <= 0);
};


// Expose
window.funpack.pack( "ScrollController", ScrollController );


})( (window.Controller || window.funpack( "Controller" )) );

/*!
 *
 * Debounce methods
 * Sourced from here:
 * http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
 *
 * @debounce
 * @author: kitajchuk
 *
 */
(function ( window, undefined ) {


"use strict";


/**
 *
 * Limit method calls
 * @memberof! <global>
 * @method debounce
 * @param {function} callback The method handler
 * @param {number} threshold The timeout delay in ms
 * @param {boolean} execAsap Call function at beginning or end of detection period
 *
 */
var debounce = function ( callback, threshold, execAsap ) {
    var timeout = null;
    
    return function debounced() {
        var args = arguments,
            context = this;
        
        function delayed() {
            if ( !execAsap ) {
                callback.apply( context, args );
            }
            
            timeout = null;
        }
        
        if ( timeout ) {
            clearTimeout( timeout );
            
        } else if ( execAsap ) {
            callback.apply( context, args );
        }
        
        timeout = setTimeout( delayed, (threshold || 100) );
    };
};


// Expose
window.funpack.pack( "debounce", debounce );


})( window );

/*!
 *
 * A basic scrollto function without all the fuss
 *
 * @scroll2
 * @author: kitajchuk
 *
 */
(function ( window, Tween, Easing, undefined ) {


"use strict";


/**
 *
 * Window scroll2 function
 * @method scroll2
 * @requires Tween
 * @param {object} options Tween animation settings
 * <ul>
 * <li>duration - How long the tween will last</li>
 * <li>complete - The callback on end of animation</li>
 * <li>ease - The easing function to use</li>
 * <li>x/y - The axis to tween, where its going to land</li>
 * </ul>
 * @memberof! <global>
 *
 */
var scroll2 = function ( options ) {
    // Get current window positions
    var position = {
        x: (window.scrollX || document.documentElement.scrollLeft),
        y: (window.scrollY || document.documentElement.scrollTop)
    };

    // Normalize options
    options = (options || {});

    // Normalize easing method
    options.ease = (options.ease || Easing.swing);

    // Normalize duration
    options.duration = (options.duration || 600);

    // Normalize from
    options.from = ( options.y !== undefined ) ? position.y : position.x;

    // Normalize to
    options.to = ( options.y !== undefined ) ? options.y : options.x;

    // Apply update method
    options.update = function ( t ) {
        // Vertical scroll
        if ( options.y !== undefined ) {
            window.scrollTo( position.x, t );

        // Horizontal scroll
        } else if ( options.x !== undefined ) {
            window.scrollTo( t, position.y );
        }
    };

    return new Tween( options );
};


// Expose
window.funpack.pack( "scroll2", scroll2 );


})( window, (window.Tween || window.funpack( "Tween" )), (window.Easing || window.funpack( "Easing" )) );