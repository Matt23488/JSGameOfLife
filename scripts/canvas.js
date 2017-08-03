(function (context, $) {

    /**
     * This is the constructor for the object that will control the HTML5 Canvas.
     * @param {*} canvas The JavaScript DOM object corresponding with the Canvas.
     */
    context.canvasState = function (canvas) {
        var self = this;

        /**
         * This is the JavaScript DOM object corresponding with the HTML5 Canvas.
         */
        self.canvas = canvas;

        /**
         * This sets the width of the Canvas.
         * @param {number} width The width to set.
         */
        self.width = function (width) {
            if (typeof width === 'undefined') return $(self.canvas).attr('width');
            else $(self.canvas).attr('width', width);
        };

        /**
         * This sets the height of the Canvas.
         * @param {number} height The height to set.
         */
        self.height = function (height) {
            if (typeof height === 'undefined') return $(self.canvas).attr('height');
            else $(self.canvas).attr('height', height);
        };

        /**
         * This draws an object on the Canvas.
         * @param {*} shape The shape to draw. See staticMembers below for how to use this parameter.
         * @param {*} style The style (fill or stroke) to draw the shape in. See staticMembers below for how to use this parameter.
         * @param {string} color The color to draw the shape in. This is a standard CSS color string.
         * @param {*} args An object containing coordinate/size information.
         */
        self.draw = function (shape, style, color, args) {
            var ctx = self.canvas.getContext('2d');

            if (shape === canvasState.shape.rectangle) {
                if (style === canvasState.style.fill) {
                    ctx.fillStyle = color;
                    ctx.fillRect(args.x, args.y, args.width, args.height);
                }
                else if (style === canvasState.style.stroke) {
                    ctx.strokeStyle = color;
                    ctx.strokeRect(args.x, args.y, args.width, args.height);
                }
            }
        };

        self.clear = function () {
            var ctx = self.canvas.getContext('2d');
            ctx.clearRect(0, 0, parseInt($(self.canvas).attr('width')), parseInt($(self.canvas).attr('height')));
        };
    };

    var staticMembers = {
        /**
         * This is basically an enum containing the shapes that the canvasState object can draw.
         */
        shape: {
            rectangle: 0
        },

        /**
         * This is basically an enum containing the styles that the canvasState object can draw.
         */
        style: {
            fill : 0,
            stroke: 1
        }
    };

    $.extend(context.canvasState, staticMembers);

})(window, jQuery);