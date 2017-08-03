$(function () {
    var canvas = $('#gameCanvas')[0];
    var unitSize = 10;
    var numRows = parseInt($('#rowsTextBox').val());
    var numCols = parseInt($('#colsTextBox').val());
    var showGridLines = $('#gridLinesButton').hasClass('active');

    var options = {
        canvasState: new window.CanvasState(canvas, numCols * unitSize),
        unitSize: unitSize,
        numRows: numRows,
        numCols: numCols,
        showGridLines: showGridLines
    };

    window.gol = new gameOfLife(options);
});