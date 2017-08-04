(function (context, $) {

    function dialogPrompt (settings) {
        var self = this;

        var _$handle = null;
        var _titleText = '';
        var _bodyText = '';
        var _buttons = dialogPrompt.buttons.okCancel;

        if (typeof settings !== 'undefined') {
            if (settings.hasOwnProperty('$handle') && settings.$handle instanceof $) {
                _$handle = settings.$handle;
            }
            if (settings.hasOwnProperty('title') && typeof settings.title === 'string') {
                _titleText = settings.title;
            }
            if (settings.hasOwnProperty('body') && typeof settings.body === 'string') {
                _bodyText = settings.body;
            }
            if (settings.hasOwnProperty('buttons') && typeof settings.buttons === 'number') {
                _buttons = settings.buttons;
            }
        }

        function jQueryHandle ($handle) {
            if (!($handle instanceof jQuery)) return _$handle;

            _$handle = $handle;
        } self.jQueryHandle = jQueryHandle;

        function title (text) {
            if (typeof text !== 'string') return _titleText;

            _titleText = text;
        } self.title = title;

        function body (text) {
            if (typeof text !== 'string') return _titleText;

            _bodyText = text;
        } self.body = body;

        function buttons (value) {
            if (typeof value !== 'number') return _buttons;

            _buttons = value;
        } self.buttons = buttons;

        function show () {
            _$handle.find('.dialog-title').text(_titleText);
            _$handle.find('.dialog-body').text(_bodyText);
            _$handle.find('.dialog-footer .btn').each(function (i) {
                var buttonSettings = getButtonSettings(i);
                $(this).text(buttonSettings.text).attr('class', 'btn btn-lg').addClass(buttonSettings.class);
            });

            _$handle.removeClass('hidden');
        } self.show = show;

        function hide () {

        } self.hide = hide;

        function getButtonSettings(i) {
            var settings = {
                text: '',
                class: ''
            };

            if (_buttons === dialogPrompt.buttons.okCancel) {
                switch (i) {
                    case 0:
                        settings.text = 'OK';
                        settings.class = 'btn-ok';
                        break;
                    case 1:
                        settings.text = 'Cancel';
                        settings.class = 'btn-cancel';
                        break;
                }
            }

            return settings;
        }
    }

    var staticMembers = {
        buttons: {
            okCancel: 0
        }
    };

    $.extend(dialogPrompt, staticMembers);

    context.dialogPrompt = dialogPrompt;

})(window, jQuery);