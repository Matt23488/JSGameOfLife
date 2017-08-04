(function (context, $) {

    function color(r, g, b, a) {
        var self = this;

        self.r = r || 0;
        self.g = g || 0;
        self.b = b || 0;
        self.a = a || 1;

        function getCssString() {
            return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
        } self.getCssString = getCssString;
    }

    var staticMembers = {
        // Only supports '#rrggbb' format currently
        fromCssString: function (cssString) {
            var r = convertHexByte(cssString.substr(1, 2));
            var g = convertHexByte(cssString.substr(3, 2));
            var b = convertHexByte(cssString.substr(5, 2));
            return new color(r, g, b, 1);
        }
    };

    $.extend(color, staticMembers);

    context.color = color;

    function convertHexByte (hexByte) {
        return convertHexDigit(hexByte.charAt(0)) * 16 + convertHexDigit(hexByte.charAt(1));
    }

    function convertHexDigit (hexDigit) {
        switch (hexDigit.toLowerCase()) {
            case '0': return 0;
            case '1': return 1;
            case '2': return 2;
            case '3': return 3;
            case '4': return 4;
            case '5': return 5;
            case '6': return 6;
            case '7': return 7;
            case '8': return 8;
            case '9': return 9;
            case 'a': return 10;
            case 'b': return 11;
            case 'c': return 12;
            case 'd': return 13;
            case 'e': return 14;
            case 'f': return 15;
        }
    }

})(window, jQuery);