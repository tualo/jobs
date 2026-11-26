Ext.define('Tualo.job.blg.controller.Form', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.job_report_panel',

    loadRecord: function (record) {


        // window.CF = this.getView();
        this.getViewModel().set('record', record);
        if (!Ext.isEmpty(record)) {
            this.getView().up().getViewModel().set('isModified', false)
            this.getView().up().getViewModel().set('isNew', false)
            if (typeof this.myPanel == 'undefined') {
                let ct = Ext.create;
                this.myPanel = ct('Tualo.jobs.lazy.v2.Panel', {
                    jobid: record.get('jobid'),
                    template: 'receipt',
                    reportType: record.get('tabellenzusatz'),
                    /* optionalFilter: optionalFilter */
                });
                this.getView().add(this.myPanel);
            }
            // this.myPanel.loadRecord(record);
        }
    }
});