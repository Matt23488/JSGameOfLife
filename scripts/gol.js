(function (context, $) {

    function gameOfLife(options) {
        var self = this;

        var _canvasState = options.canvasState;
        var _numRows = options.numRows;
        var _numCols = options.numCols;
        var _unitSize = options.unitSize;
        var _wrap = false;
        var _showGridLines = options.showGridLines;
        var _paused = false;
        var _isRunning = false;
        var _cells = [];
        var _originalStates = [];
        var _newStates = [];
        var _loopHandle = 0;

        self.generation = 0;

        self.input = function (mouseArgs) {
            var x = context.Math.floor(mouseArgs.x / _unitSize);
            var y = context.Math.floor(mouseArgs.y / _unitSize);
            var index = convertCoordinates(x, y);
            var cell = _cells[index];

            cell.setState(false);
            if (mouseArgs.button === context.mouseButtons.left) {
                cell.setState(true);
            }

            cell.draw(_canvasState, _showGridLines);
        };

        self.start = function () {
            saveStates();

            _loopHandle = context.setInterval(loop, 100);
        };

        self.togglePause = function () {
            _paused = !_paused;

            if (_paused) {
                context.clearInterval(_loopHandle);
            }
            else {
                _loopHandle = context.setInterval(loop, 100);
            }

            return _paused;
        };

        self.stop = function () {
            context.clearInterval(_loopHandle);
            self.generation = 0;
            _isRunning = false;
            _paused = false;
            
            for (var i = 0; i < _cells.length; i++) {
                _cells[i].setState(false);
                _cells[i].setState(_originalStates[i]);
                _cells[i].draw(_canvasState, _showGridLines);
            }
        };

        self.advance = function () {
            if (!_isRunning) {
                saveStates();
            }
            _paused = true;
            loop();
        };

        self.clear = function () {
            for (var i = 0; i < _cells.length; i++) {
                _cells[i].setState(false);
                _cells[i].draw(_canvasState, _showGridLines);
            }
        };

        self.toggleWrap = function () {
            _wrap = !_wrap;
        };

        self.toggleGridLines = function () {
            _showGridLines = !_showGridLines;
        };

        self.resize = function (numRows, numCols) {
            _numRows = numRows;
            _numCols = numCols;

            _canvasState.width(_numCols * _unitSize);
            _canvasState.height(_numRows * _unitSize);

            _cells = [];
            for (var y = 0; y < _numRows; y++) {
                for (var x = 0; x < _numCols; x++) {
                    var newCell = new cell(x, y, _unitSize);
                    
                    newCell.draw(_canvasState, _showGridLines);

                    _cells.push(newCell);
                }
            }
        }

        self.exportSerializedState = function () {
            var state = '';
            for (var y = 0; y < _numRows; y++) {
                for (var x = 0; x < _numCols; x++) {
                    state += _cells[convertCoordinates(x, y)].isAlive() ? 1 : 0;
                }
                state += '\n';
            }
            return state;
        };

        self.importSerializedState = function (stateString) {
            var reader = new stringReader(stateString);

            var numRows = 0;
            var numCols = 0;

            var lineNumber = 0;
            while (!reader.eof()) {
                var line = reader.readLine();
                if (numRows === 0) {
                    numCols = line.length;
                    numRows = Math.floor((stateString.length * (numCols / (numCols + 1))) / numCols);
                    self.resize(numRows, numCols);
                }

                for (var i = 0; i < line.length; i++) {
                    var index = convertCoordinates(i, lineNumber)
                    _cells[index].setState(line.charAt(i) === '1');
                    _cells[index].draw(_canvasState, _showGridLines);
                }

                lineNumber++;
            }
        };

        function loop () {
            _newStates = [];
            for (var y = 0; y < _numRows; y++) {
                for (var x = 0; x < _numCols; x++) {
                    var index = convertCoordinates(x, y);
                    var cell = _cells[index];
                    var newState = cell.isAlive();
                    var numAliveNeighbors = getNumAliveNeighbors(x, y);

                    if (cell.isAlive()) {
                        newState = numAliveNeighbors === 2 || numAliveNeighbors === 3;
                    }
                    else {
                        newState = numAliveNeighbors === 3;
                    }

                    _newStates.push(newState);
                }
            }

            for (var i = 0; i < _cells.length; i++) {
                _cells[i].setState(_newStates[i]);
                _cells[i].draw(_canvasState, _showGridLines);
            }

            self.generation++;
            $(self).triggerHandler('gol-generation');
        }

        function getNumAliveNeighbors(x, y) {
            var numAliveNeighbors = 0;
            var neighbors = getNeighbors(x, y);

            for (var i = 0; i < neighbors.length; i++) {
                if (neighbors[i].isAlive()) {
                    numAliveNeighbors++;
                }
            }

            return numAliveNeighbors;
        }

        function getNeighbors(x, y) {
            var neighbors = [];

            if (x > 0) {
                if (y > 0) {
                    neighbors.push(_cells[convertCoordinates(x - 1, y - 1)]);
                }
                else if (_wrap) {
                    neighbors.push(_cells[convertCoordinates(x - 1, _numRows - 1)]);
                }

                neighbors.push(_cells[convertCoordinates(x - 1, y)]);

                if (y < _numRows - 1) {
                    neighbors.push(_cells[convertCoordinates(x - 1, y + 1)]);
                }
                else if (_wrap) {
                    neighbors.push(_cells[convertCoordinates(x - 1, 0)]);
                }
            }
            else if (_wrap) {
                if (y > 0) {
                    neighbors.push(_cells[convertCoordinates(_numCols - 1, y - 1)]);
                }
                else {
                    neighbors.push(_cells[convertCoordinates(_numCols - 1, _numRows - 1)]);
                }

                neighbors.push(_cells[convertCoordinates(_numCols - 1, y)]);

                if (y < _numRows - 1) {
                    neighbors.push(_cells[convertCoordinates(_numCols - 1, y + 1)]);
                }
                else {
                    neighbors.push(_cells[convertCoordinates(_numCols - 1, 0)]);
                }
            }

            if (y > 0) {
                neighbors.push(_cells[convertCoordinates(x, y - 1)]);
            }
            else if (_wrap) {
                neighbors.push(_cells[convertCoordinates(x, _numRows - 1)]);
            }

            if (y < _numRows - 1) {
                neighbors.push(_cells[convertCoordinates(x, y + 1)]);
            }
            else if (_wrap) {
                neighbors.push(_cells[convertCoordinates(x, 0)]);
            }

            if (x < _numCols - 1) {
                if (y > 0) {
                    neighbors.push(_cells[convertCoordinates(x + 1, y - 1)]);
                }
                else if (_wrap) {
                    neighbors.push(_cells[convertCoordinates(x + 1, _numRows - 1)]);
                }

                neighbors.push(_cells[convertCoordinates(x + 1, y)]);

                if (y < _numRows - 1) {
                    neighbors.push(_cells[convertCoordinates(x + 1, y + 1)]);
                }
                else if (_wrap) {
                    neighbors.push(_cells[convertCoordinates(x + 1, 0)]);
                }
            }
            else if (_wrap) {
                if (y > 0) {
                    neighbors.push(_cells[convertCoordinates(0, y - 1)]);
                }
                else {
                    neighbors.push(_cells[convertCoordinates(0, _numRows - 1)]);
                }

                neighbors.push(_cells[convertCoordinates(0, y)]);

                if (y < _numRows - 1) {
                    neighbors.push(_cells[convertCoordinates(0, y + 1)]);
                }
                else {
                    neighbors.push(_cells[convertCoordinates(0, 0)]);
                }
            }

            return neighbors;
        }
        
        function convertCoordinates(x, y) {
            if (typeof y === 'undefined') {
                return  {
                    x: x % _numCols,
                    y: Math.floor(x / _numCols)
                };
            }
            else {
                return y * _numCols + x;
            }
        }

        function saveStates() {
            _isRunning = true;
            _originalStates = [];
            for (var i = 0; i < _cells.length; i++) {
                _originalStates.push(_cells[i].isAlive());
            }
        }

        self.resize(_numRows, _numCols);
    }

    function cell(x, y, size) {
        var self = this;
        self.x = x * size;
        self.y = y * size;
        self.width = size;
        self.height = size;

        var _size = size;
        var _isAlive = false;
        var _lifetime = 0;

        self.setState = function (alive) {
            _isAlive = alive;

            if (!_isAlive) _lifetime = 0;
            else _lifetime++;
        };

        self.toggleState = function () {
            _isAlive = !_isAlive;

            if (!_isAlive) _lifetime = 0;
        };

        self.isAlive = () => _isAlive;

        self.draw = function (canvasState, drawBorder) {
            var fillStyle = getFillStyle();

            canvasState.draw(
                context.CanvasState.shape.rectangle,
                context.CanvasState.style.fill,
                fillStyle,
                self
            );

            if (drawBorder) {
                canvasState.draw(
                    context.CanvasState.shape.rectangle,
                    context.CanvasState.style.stroke,
                    '#000',
                    self
                );
            }
        }

        function getFillStyle() {
            if (!_isAlive) return '#888';

            var scale = 16;
            var r = 0;
            var g = 0;
            var b = 0;

            if (_lifetime < scale * 1) {
                r = ((_lifetime % scale) * (256 / scale) + 256) % 256;
                g = 255;
                b = 0;
            }
            else if (_lifetime < scale * 2) {
                r = 255;
                g = 255 - ((_lifetime % scale) * (256 / scale));
                b = 0;
            }
            else if (_lifetime < scale * 2.5) {
                r = 255 - ((_lifetime % scale) * (256 / scale));
                g = 0;
                b = 0;
            }
            else {
                r = 127;
                g = 0;
                b = 0;
            }

            return '#' + convertToHexByte(r) + convertToHexByte(g) + convertToHexByte(b);
        }
    }

    function convertToHexByte(num) {
        if (num === 256) return '00';

        var highDigit = Math.floor(num / 16);
        var lowDigit = num % 16;

        return convertToHexDigit(highDigit) + convertToHexDigit(lowDigit);
    }

    function convertToHexDigit(num) {
        switch (num) {
            case 0: return '0';
            case 1: return '1';
            case 2: return '2';
            case 3: return '3';
            case 4: return '4';
            case 5: return '5';
            case 6: return '6';
            case 7: return '7';
            case 8: return '8';
            case 9: return '9';
            case 10: return 'a';
            case 11: return 'b';
            case 12: return 'c';
            case 13: return 'd';
            case 14: return 'e';
            case 15: return 'f';
        }
    }

    context.gameOfLife = gameOfLife;

})(window, jQuery);