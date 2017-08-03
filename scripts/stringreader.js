(function (context, $) {

    /**
     * This is the constructor for a simple object that reads from a string.
     * @param {string} string The string to read from.
     */
    context.stringReader = function (string) {
        var self = this;

        var _string = string;
        var _currentPos = 0;

        /**
         * This returns the next character in the string, or nothing if the end of the string is reached.
         * @return {string} The next character in the string.
         */
        self.read = function () {
            if (_currentPos === _string.length) return;

            var val = _string[_currentPos];
            _currentPos++;

            return val;
        };

        /**
         * This reads the next line in the string (delimited by \n), or nothing if the end of the string is reached.
         * @return {string} The next line in the string.
         */
        self.readLine = function () {
            if (_currentPos === _string.length) return;

            var val = '';

            do {
                val += _string[_currentPos];
                _currentPos++;
            } while (_currentPos < _string.length && _string[_currentPos] !== '\n');
            _currentPos++;

            return val;
        };

        /**
         * This returns if the end of the string has been reached.
         * @return {boolean} True if the end of the string has been reached, false otherwise.
         */
        self.eof = () => _currentPos === _string.length;
    };

})(window, jQuery);