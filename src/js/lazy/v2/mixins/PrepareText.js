
Ext.define('Tualo.jobs.lazy.v2.mixins.PrepareText', {
    prepareTexts: async function (store, records) {
        console.log('Panel.prepareTexts');
        let i = 0,
            l = records.length;
        let me = this,
            view = this.getView(),
            model = view.getViewModel(),
            tualo_job = view.getViewModel().getStore('tualo_job'),
            jobRecord = tualo_job.getRange();
        if (Ext.isEmpty(model.get('jobid'))) {
            console.error('Panel.prepareTexts', 'No jobid found');
            return false;
        }
        if (jobRecord.length == 0) {
            console.error('Panel.prepareTexts', 'No job record found');
            return false;
        };

        let templateData = await this.createTemplateData(),
            syncNeeded = false;

        if (records && records.length == 0) {
            console.log('NO Records found:', records);
        }

        // console.log('onTextStoreLoad',store,records);
        for (i = 0; i < l; i++) {
            let currentText = records[i].get('text');
            let tpl = new Ext.XTemplate(currentText);
            let newText = tpl.apply(templateData);
            //console.log("-----",currentText!=newText,currentText,newText);
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