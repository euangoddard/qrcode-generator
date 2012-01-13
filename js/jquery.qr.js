//---------------------------------------------------------------------
//
// QR Code Generator plugin for jQuery
//
// Copyright (c) 2009 Kazuhiko Arase
// Copyright (c) 2012 Euan Goddard
//
// URL: http://www.d-project.com/
//
// Licensed under the MIT license:
//    http://www.opensource.org/licenses/mit-license.php
//
// The word 'QR Code' is registered trademark of
// DENSO WAVE INCORPORATED
//    http://www.denso-wave.com/qrcode/faqpatent-e.html
//
//---------------------------------------------------------------------

(function ($) {
    
    /**
     * Detect what support the current browser has for the various output types
     * @return {String} The best output type available
     */
    var getBestOutputType = function () {
        var bestOutputType = 'table';
        // Check to see if there is canvas support
        var elem = document.createElement('canvas');
        if (elem.getContext && elem.getContext('2d')) {
            bestOutputType = 'canvas';
        } else if (!$.browser.msie || parseInt($.browser.version) > 7) {
            bestOutputType = 'image';
        }
        return bestOutputType;
    };
    
    /**
     * Log the arguments to the console (if available)
     */
    var log = function () {
        if (window.console) {
            console.log.apply(console, arguments);
        }
    };
    
    /**
     * Map the output types on to method on qrcode
     */
    var OUTPUT_METHODS = {
        canvas: 'createCanvasElement',
        image: 'createImgElement',
        table: 'createTableElement'
    };
    
    /**
     * The default values to be used by the plug-in
     */
    var defaults = {
        typeNumber: 4,
        errorCorrectLevel: 'M',
        cellSize: 2,
        marginSize: 2,
        target: null,
        outputType: null,
        unicode: false
    };
    
    /**
     * Publicly available constants to describe the output types
     */
    $.QR_OUTPUT_TYPES = {
        CANVAS: 'canvas',
        IMAGE: 'image',
        TABLE: 'table'
    };
    
    $.fn.qr = function (options) {
        return this.each(function () {
            var params = $.extend({}, defaults, options);
            var $element = $(this);
            
            // Allow for a callable to be used which received $element as `this`
            if (params.source) {
                if ($.isFunction(params.source)) {
                    var sourceText = params.source.apply($element);
                } else {
                    var sourceText = params.source;
                }
            } else {
                var sourceText = $element.text();
            }
            if (params.unicode===true) {
                // encode unicode strings
                sourceText = unescape(encodeURIComponent(sourceText));
            }
            
            if (!sourceText) {
                log(
                    'No source specified. Aborting rendering of QR code for',
                    $element
                );
                return true;
            }
            // Build the qr code
            var _qr = qrcode(params.typeNumber, params.errorCorrectLevel);
            _qr.addData(sourceText);
            _qr.make();
            
            // Generate the output element
            if (params.outputType) {
                if (!(params.outputType in OUTPUT_METHODS)) {
                    log(params.outputType + ' is not a valid output type!');
                    return true;
                }
                var outputType = params.outputType;
            } else {
                var outputType = getBestOutputType();
            }
            
            if (!params.target) {
                params.target = $element;
            }
            
            var outputMethod = _qr[OUTPUT_METHODS[outputType]];
            var outputElement = outputMethod(params.cellSize, params.marginSize);
            params.target.each(function () {
                $(this).html(outputElement);
                
                // The canvas element can only be output once, therefore for
                // each target a new canvas needs to be generated
                if (outputType === $.QR_OUTPUT_TYPES.CANVAS) {
                    outputElement = outputMethod(
                        params.cellSize, params.marginSize);
                }
            });
        });
    };
})(jQuery);