(function (context, $) {

    context.stringReader = function (string) {
        var self = this;

        var _string = string;
        var _currentPos = 0;

        self.read = function () {
            if (_currentPos === _string.length) return;

            var val = _string[_currentPos];
            _currentPos++;

            return val;
        };

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

        self.eof = () => _currentPos === _string.length;
    };

})(window, jQuery);