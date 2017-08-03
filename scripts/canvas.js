(function (context, $) {

    context.CanvasState = function (canvas, width, height) {
        var self = this;
        //var _canvas = canvas;
        //var _$canvas = $(canvas);

        self.canvas = canvas;
        // self.width = width;
        // self.height = height;

        self.width = function (width) {
            if (typeof width === 'undefined') return $(self.canvas).attr('width');
            else $(self.canvas).attr('width', width);
        };

        self.height = function (height) {
            if (typeof height === 'undefined') return $(self.canvas).attr('height');
            else $(self.canvas).attr('height', height);
        };

        self.draw = function (shape, style, color, args) {
            var ctx = canvas.getContext('2d');

            if (shape === CanvasState.shape.rectangle) {
                if (style === CanvasState.style.fill) {
                    ctx.fillStyle = color;
                    ctx.fillRect(args.x, args.y, args.width, args.height);
                }
                else if (style === CanvasState.style.stroke) {
                    ctx.strokeStyle = color;
                    ctx.strokeRect(args.x, args.y, args.width, args.height);
                }
            }
        };
    };

    var staticMembers = {
        shape: {
            rectangle: 0
        },
        style: {
            fill : 0,
            stroke: 1
        }
    };

    $.extend(context.CanvasState, staticMembers);

})(window, jQuery);