$(function () {
    var canvas = $('#gameCanvas')[0];
    var unitSize = 10;
    var numRows = parseInt($('#rowsTextBox').val());
    var numCols = parseInt($('#colsTextBox').val());
    var showGridLines = $('#gridLinesButton').hasClass('active');

    var options = {
        canvasState: new window.canvasState(canvas),
        unitSize: unitSize,
        numRows: numRows,
        numCols: numCols,
        showGridLines: showGridLines
    };

    window.gol = new gameOfLife(options);

    var dialogSettings = {
        $handle: $('#dialogPrompt'),
        title: 'Filename',
        body: 'Type the filename you would like to use. (The .gol extension will be added automatically.)',
        buttons: dialogPrompt.buttons.okCancel
    };

    var dialog = new dialogPrompt(dialogSettings);

    window.saveFilePrompt = dialog;
});