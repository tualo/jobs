Ext.define('Tualo.jobs.lazy.v2.mixins.DataChange', {
    onDataDataChanged: function () {
        let me = this,
            view = me.getView(),
            model = me.getViewModel(),
            textsStore = model.get('reportType') == 'angebot' ? model.getStore('tualo_job_offer_text') : model.getStore('tualo_job_invoice_text'),
            dataStore = model.getStore('data'),
            frame = view.getComponent('previewOuterFrame').getComponent('previewFrame'),
            modifiedRows = textsStore.getModifiedRecords().length + dataStore.getModifiedRecords().length;
        model.set('modifiedRows', modifiedRows);
        // nur aktualisieren, wenn es Änderungen gibt und der Focus nicht im frame liegt
        //if (modifiedRows > 0 && document.activeElement !== frame.getFrameElement()) {
        console.log('Document active element:', document.activeElement, dataStore.getModifiedRecords());
        console.log('Frame stage element:', frame.getStageElement());
        console.log('Contains active element:', frame.getStageElement().contains(document.activeElement));
        if (!frame.getStageElement().contains(document.activeElement)) {
            this.renderPreview();
        }
        // Änderungen prüfen und ggf. Vorschau aktualisieren
    },
    onTextDataChanged: function () {
        let me = this,
            view = me.getView(),
            model = me.getViewModel(),
            textsStore = model.get('reportType') == 'angebot' ? model.getStore('tualo_job_offer_text') : model.getStore('tualo_job_invoice_text'),
            dataStore = model.getStore('data'),
            frame = view.getComponent('previewOuterFrame').getComponent('previewFrame'),
            modifiedRows = textsStore.getModifiedRecords().length + dataStore.getModifiedRecords().length;
        model.set('modifiedRows', modifiedRows);
    },
    onFormFieldChanged: function () {
        this.renderPreview();
    }
});