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
            _$handle.find('.modal-title').text(_titleText);
            _$handle.find('.modal-body-content').text(_bodyText);
            _$handle.find('.modal-footer .btn').each(applyButtonSettings);

            _$handle.modal('show');
        } self.show = show;

        function hide () {
            _$handle.modal('hide');
        } self.hide = hide;

        function applyButtonSettings(i, btn) {
            if (_buttons === dialogPrompt.buttons.okCancel) {
                switch (i) {
                    case 0:
                        $(btn)
                            .html('<span class="fa fa-ban"></span>&nbsp;Cancel')
                            .off('click')
                            .click(function (e) {
                                self.hide();
                                $(self).trigger('dialog-result-cancel');
                            });
                        break;
                    case 1:
                        $(btn)
                            .html('<span class="fa fa-check"></span>&nbsp;OK')
                            .off('click')
                            .click(function (e) {
                                self.hide();
                                $(self).trigger('dialog-result-ok', [_$handle.find('.modal-input').val()]);
                            });
                        break;
                }
            }
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