Ext.define('Tualo.job.blg.Form', {
    extend: "Ext.form.Panel",
    alias: [
        'widget.job_report_panel'
    ],
    controller: 'job_report_panel',
    viewModel: {
        type: 'job_report_panel'
    },
    bind: {
        disabled: "{disabled}"
    },
    config: {
        record: null,
    },
    bodyPadding: 10,
    layout: 'fit',
    items: [

    ],
    loadRecord: function (record) {
        this.getController().loadRecord(record);
    }
});


