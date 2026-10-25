Ext.define('Tualo.jobs.lazy.v2.mixins.DataChange', {
    onDataDataChanged: function () {
        let me = this,
            view = me.getView(),
            model = me.getViewModel(),
            store = model.getStore('data'),
            modifiedRows = store.getModifiedRecords().length,
            frame = view.getComponent('previewOuterFrame').getComponent('previewFrame');
        console.log('Panel.onDataDataChanged', modifiedRows);
        model.set('modifiedRows', modifiedRows);
        // nur aktualisieren, wenn es Änderungen gibt und der Focus nicht im frame liegt
        if (modifiedRows > 0 && document.activeElement !== frame.getFrameElement()) {
            this.renderPreview();
        }
        // Änderungen prüfen und ggf. Vorschau aktualisieren
    },
});