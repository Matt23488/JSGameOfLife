$(function () {

    var gol = window.gol;
    var mouseButtons = window.mouseButtons;

    var currentMouseButton = mouseButtons.none;

    $('#sizeForm').submit(function (e) {
        var numRows = parseInt($('#rowsTextBox').val());
        var numCols = parseInt($('#colsTextBox').val());

        gol.resize(numRows, numCols);

        e.preventDefault();
    });

    $('#playButton').click(function () {
        $('#sizeForm *').prop('disabled', true);
        $(this).prop('disabled', true);
        $('#pauseButton').prop('disabled', false);
        $('#stopButton').prop('disabled', false);
        $('#advanceButton').prop('disabled', true);
        $('#openButton').prop('disabled', true);
        $('#saveButton').prop('disabled', true);
        $('#clearButton').prop('disabled', true);

        gol.start();
    });

    $('#pauseButton').click(function () {
         var isPaused = gol.togglePause();

        $(this).toggleClass('active');
        $('#advanceButton').prop('disabled', !isPaused);
    });

    $('#stopButton').click(function () {
        $('#sizeForm *').prop('disabled', false);
        $('#playButton').prop('disabled', false);
        $('#pauseButton').removeClass('active').prop('disabled', true);
        $(this).prop('disabled', true);
        $('#advanceButton').prop('disabled', false);
        $('#openButton').prop('disabled', false);
        $('#saveButton').prop('disabled', false);
        $('#clearButton').prop('disabled', false);

        gol.stop();
        $('#generationDisplay').text(0);
    });

    $('#advanceButton').click(function () {
        $('#sizeForm *').prop('disabled', true);
        $('#playButton').prop('disabled', true);
        $('#pauseButton').prop('disabled', false).addClass('active');
        $('#stopButton').prop('disabled', false);
        $('#openButton').prop('disabled', true);
        $('#saveButton').prop('disabled', true);
        $('#clearButton').prop('disabled', true);

        gol.advance();
    });

    $('#openButton').click(function () {
        $('#openFileDialog').click();
    });

    $('#openFileDialog').change(function (e) {
        var file = e.target.files[0];
        if (!file) return;

        var reader = new FileReader();
        reader.onload = function (e) {
            var contents = e.target.result;
            gol.importSerializedState(contents);
        };

        reader.readAsText(file);
    });

    $('#saveButton').click(function () {
        window.saveFilePrompt.show();
    });

    $('#clearButton').click(function () {

        gol.clear();
    });

    $('#wrapButton').click(function () {
        $(this).toggleClass('active');

        gol.toggleWrap();
    });

    $('#gridLinesButton').click(function () {
        $(this).toggleClass('active');

        gol.toggleGridLines();
    });

    $('#colorPickerButton').click(function () {
        $('#colorPicker').trigger('click');
    });

    $('#colorPicker').change(function () {
        $('#colorPickerButton .btn-color-display').css('background-color', $(this).val());
    });

    $(window.saveFilePrompt).on('dialog-result-ok', function (e, fileName) {
        var blob = new Blob([gol.exportSerializedState()], { text: 'text/plain;charset=utf-8' });
        saveAs(blob, fileName + '.gol');
    });

    $('body').on('mousedown', e => currentMouseButton = e.button)
    .on('mouseup', e => currentMouseButton = mouseButtons.none);

    $('#gameCanvas').on('mouseover', function (e) {
        if (currentMouseButton === mouseButtons.none) return;

        handleInput(e, currentMouseButton, this);
    })
    .on('mousemove', function (e) {
        if (currentMouseButton === mouseButtons.none) return;

        handleInput(e, currentMouseButton, this);
    })
    .on('contextmenu', e => e.preventDefault())
    .click(function (e) {
        handleInput(e, e.button, this);
    });

    $(gol).on('gol-generation', function () {
        var generation = $(this).prop('generation');
        $('#generationDisplay').text(generation);
    });

    function getMousePos(canvas, e) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    function handleInput(e, button, canvas) {
        var mouseArgs = getMousePos(canvas, e);
        $.extend(mouseArgs, {
            button: button,
            color: window.color.fromCssString($('#colorPicker').val())
        });

        gol.input(mouseArgs);
    }

    function cancelBubble (e) {
        var evt = e || window.event;
        if (evt.stopPropagation)    evt.stopPropagation();
        if (evt.cancelBubble!=null) evt.cancelBubble = true;
    }
});