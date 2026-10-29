
Ext.define('Tualo.jobs.lazy.v2.mixins.PrepareText', {
    prepareTexts: async function () {
        let me = this,
            view = me.getView(),
            model = me.getViewModel(),
            store = model.get('reportType') == 'angebot' ? model.getStore('tualo_job_offer_text') : model.getStore('tualo_job_invoice_text'),
            job = model.get('job'),
            records = store.getRange(),
            i = 0,
            l = records.length;

        if (Ext.isEmpty(model.get('jobid'))) {
            console.error('Panel.prepareTexts', 'No jobid found');
            return false;
        }
        if (Ext.isEmpty(job)) {
            console.error('Panel.prepareTexts', 'No job record found', job, model);
            return false;
        };

        let templateData = await this.createTemplateData(),
            syncNeeded = false;

        console.warn('Template Data:', templateData);
        if (records && records.length == 0) {
            console.log('NO Records found:', records);
        }

        console.log('onTextStoreLoad', store, records);
        for (i = 0; i < l; i++) {
            let currentText = records[i].get('text');
            if (Ext.isEmpty(currentText)) {
                continue;
            }
            let tpl = new Ext.XTemplate(currentText);
            let newText = tpl.apply(templateData);
            // console.log("-----", currentText != newText, currentText, newText);
            if (currentText != newText) {
                records[i].set('text', newText);
                syncNeeded = true;
            }
        }
        if (syncNeeded) {
            console.log('Changes detected, sync needed');
            //    store.sync();
        }
    },
});