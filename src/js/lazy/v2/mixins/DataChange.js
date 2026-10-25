Ext.define('Tualo.jobs.lazy.v2.mixins.DataChange', {
    onDataDataChanged: function () {
        let me = this,
            view = me.getView(),
            model = me.getViewModel(),
            store = model.getStore('data'),
            modifiedRows = store.getModifiedRecords().length;
        console.log('Panel.onDataDataChanged', modifiedRows);
        model.set('modifiedRows', modifiedRows);
        this.renderPreview();
        // Änderungen prüfen und ggf. Vorschau aktualisieren
    },
});