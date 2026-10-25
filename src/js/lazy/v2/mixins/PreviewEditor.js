Ext.define('Tualo.jobs.lazy.v2.mixins.PreviewEditor', {
    onPrintClick: function () {
        console.log('Panel.onPrintClick');
        var me = this,
            view = me.getView(),
            previewFrame = view.getComponent('previewOuterFrame').getComponent('previewFrame'),
            wnd = previewFrame.getEl().dom.querySelector('iframe').contentWindow;
        wnd.print();
    },

    onBoldClick: function () {
        console.log('Panel.onBoldClick');
        var me = this,
            view = me.getView(),
            previewFrame = view.getComponent('previewOuterFrame').getComponent('previewFrame'),
            wnd = previewFrame.getEl().dom.querySelector('iframe').contentWindow;
        if (wnd)
            wnd.document.execCommand('bold', false, null);
    },
    onItalicClick: function () {
        console.log('Panel.onItalicClick');
        var me = this,
            view = me.getView(),
            previewFrame = view.getComponent('previewOuterFrame').getComponent('previewFrame'),
            wnd = previewFrame.getEl().dom.querySelector('iframe').contentWindow;
        if (wnd)
            wnd.document.execCommand('italic', false, null);

    },


    onColorClick: function (btn) {
        console.log('Panel.onColorClick');
        var me = this,
            newValue = btn.rgb,
            view = me.getView(),
            previewFrame = view.getComponent('previewOuterFrame').getComponent('previewFrame'),
            wnd = previewFrame.getEl().dom.querySelector('iframe').contentWindow;
        if (wnd)
            wnd.document.execCommand('foreColor', false, newValue);

    },

    onColorStoreLoad: function (store, records) {
        console.log('Panel.onColorStoreLoad');
        var me = this,
            view = me.getView(),
            previewOuterFrame = view.getComponent('previewOuterFrame'),
            button = previewOuterFrame.getDockedItems()[0].getComponent('colorButton'),
            menu = button.getMenu();

        records.forEach(element => {
            console.log('Panel.onColorStoreLoad.records.forEach');
            menu.add({
                text: element.get('name'),
                rgb: element.get('rgb'),
                listeners: {
                    scope: me,
                    click: me.onColorClick
                }
            })
        });

    },
    onClearClick: function () {
        console.log('Panel.onClearClick');
        var me = this,
            view = me.getView(),
            previewFrame = view.getComponent('previewOuterFrame').getComponent('previewFrame'),
            wnd = previewFrame.getEl().dom.querySelector('iframe').contentWindow;
        if (wnd)
            wnd.document.execCommand('removeFormat', false, null);
    },
});