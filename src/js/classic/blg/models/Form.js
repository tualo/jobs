Ext.define('Tualo.job.blg.models.Form', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.job_report_panel',
    data: {
        saving: false,
        initialized: false,
        record: null
    },
    formulas: {
        disabled: function (get) {
            return Ext.isEmpty(get('record')) || get('saving');
        }
    }
});