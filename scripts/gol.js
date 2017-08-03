(function (context, $) {

    /**
     * This is the constructor for an object that controls the Game of Life.
     * @param {*} options Contains various options for intialization of the game state. See start.js for more info.
     */
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

        /**
         * This is how many generations have passed.
         */
        self.generation = 0;

        /**
         * This handles mouse input.
         * @param {*} mouseArgs The data associated with the mouse input.
         */
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

        /**
         * This begins the periodic game loop.
         */
        self.start = function () {
            saveStates();

            _loopHandle = context.setInterval(loop, 100);
        };

        /**
         * This pauses/unpauses the game loop.
         * @return {boolean} The pause state after the method is executed.
         */
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

        /**
         * This stops the game loop and reverts the game to generation 0.
         */
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

        /**
         * This executes one iteration of the game loop.
         */
        self.advance = function () {
            if (!_isRunning) {
                saveStates();
            }
            _paused = true;
            loop();
        };

        /**
         * This sets all cells to dead.
         */
        self.clear = function () {
            for (var i = 0; i < _cells.length; i++) {
                _cells[i].setState(false);
                _cells[i].draw(_canvasState, _showGridLines);
            }
        };

        /**
         * This toggles screen wrap.
         */
        self.toggleWrap = function () {
            _wrap = !_wrap;
        };

        /**
         * This toggles grid lines.
         * NOTE: The grid lines are drawn when cell.setState() is called,
         *       so if the game isn't running, you won't see an effect immediately.
         */
        self.toggleGridLines = function () {
            _showGridLines = !_showGridLines;
        };

        /**
         * This handles resizing the game board.
         * @param {number} numRows The number of Rows to use.
         * @param {number} numCols The number of Columns to use.
         */
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

        /**
         * This serializes the game state into a string and returns it.
         * @return {string} The serialized game state.
         */
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

        /**
         * This takes a serialized game state string and loads the game state.
         * @param {*} stateString The serialized game state.
         */
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

        /**
         * This is the main game loop.
         */
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

        /**
         * This returns the number of neighboring cells that are "alive"
         * @param {number} x The x-coordinate of the cell we are checking against.
         * @param {number} y The y-coordinate of the cell we are checking against.
         * @return {number} The number of neighboring cells that are "alive"
         */
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

        /**
         * This returns an array containing all neighboring cells of a given cell.
         * @param {number} x The x-coordinate of the cell we are checking against.
         * @param {number} y The y-coordinate of the cell we are checking against.
         * @return {array} An array containing all neighboring cells of the given cell.
         */
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
        
        /**
         * This converts a coordinate pair into a single index -OR- converts a single index into a coordinate pair.
         * @param {number} x The x-coordinate of the coordinate pair -OR- the index.
         * @param {number} y The y-coordinate of the coordinate pair -OR- undefined if converting a single index.
         * @return {*} The resulting index -OR- coordinate-pair as {x:number, y:number}
         */
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

        /**
         * This saves the initial state of the game for restoring after the game is stopped.
         */
        function saveStates() {
            _isRunning = true;
            _originalStates = [];
            for (var i = 0; i < _cells.length; i++) {
                _originalStates.push(_cells[i].isAlive());
            }
        }

        self.resize(_numRows, _numCols);
    }

    /**
     * This is the constructor for an individual cell.
     * @param {number} x The x-coordinate of the cell.
     * @param {number} y The y-coordinate of the cell.
     * @param {number} size The size (in pixels) of the cell.
     */
    function cell(x, y, size) {
        var self = this;

        self.x = x * size;
        self.y = y * size;
        self.width = size;
        self.height = size;

        var _size = size;
        var _isAlive = false;
        var _lifetime = 0;

        /**
         * This sets the state of the cell.
         * @param {boolean} alive The state to set.
         */
        self.setState = function (alive) {
            _isAlive = alive;

            if (!_isAlive) _lifetime = 0;
            else _lifetime++;
        };

        /**
         * This toggles the state of the cell.
         */
        self.toggleState = function () {
            _isAlive = !_isAlive;

            if (!_isAlive) _lifetime = 0;
        };

        /**
         * This returns the state of the cell.
         * @return {boolean} The state of the cell.
         */
        self.isAlive = () => _isAlive;

        /**
         * This draws the cell.
         * @param {*} canvasState The object that controls the HTML5 canvas.
         * @param {boolean} drawBorder A boolean indicating whether the cell border should be drawn (used for drawing grid lines).
         */
        self.draw = function (canvasState, drawBorder) {
            var fillStyle = getFillStyle();

            canvasState.draw(
                context.canvasState.shape.rectangle,
                context.canvasState.style.fill,
                fillStyle,
                self
            );

            if (drawBorder) {
                canvasState.draw(
                    context.canvasState.shape.rectangle,
                    context.canvasState.style.stroke,
                    '#000',
                    self
                );
            }
        }

        /**
         * This calculates the color of the cell based on if it's dead or alive, and how long it's been alive.
         * @return {string} A standard CSS color string.
         */
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

    /**
     * Converts a number from 0-256 to a 2-digit hex string (256 is converted to '00').
     * @param {number} num The decimal number to convert.
     * @return {string} The 2-digit hex byte string.
     */
    function convertToHexByte(num) {
        if (num === 256) return '00';

        var highDigit = Math.floor(num / 16);
        var lowDigit = num % 16;

        return convertToHexDigit(highDigit) + convertToHexDigit(lowDigit);
    }

    /**
     * Converts a number from 0-15 to a 1-digit hext string.
     * @param {number} num The decimal number to convert.
     * @return {string} The 1-digit hex byte string.
     */
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