Ext.define('Tualo.jobs.lazy.v2.mixins.Headline', {

    onHeadline: function () {
        let me = this,
            model = me.getViewModel(),
            view = me.getView(),
            grid = view.getComponent('westPanel').getComponent('calculationGrid'),
            selection = grid.getSelectionModel().getSelection(),
            defaultValue = ''

        selection.forEach((rec) => {
            if (!Ext.isEmpty(rec.get('teilueberschrift')) && defaultValue == '') {
                defaultValue = rec.get('teilueberschrift');
            }
        })

        console.warn('Tualo.jobs.lazy.v2.mixins.Headline', defaultValue);

        Ext.MessageBox.prompt(
            'Überschrift',
            'Bitte geben Sie eine Überschrift ein:',
            function (btn, txt) {
                if (btn == 'ok') {
                    selection.forEach((rec) => {
                        rec.set('teilueberschrift', txt);
                    })
                }
            },
            false,
            defaultValue
        );
    }
});