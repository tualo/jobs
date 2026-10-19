Ext.define('Tualo.jobs.lazy.models.Copy', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.tualo_jobs_copy',
    data: {
        jobid: null,
        jobnumber: null,

        targetJobId: null,

        copyJobData: true,
        copyTechnicalData: false,
        copyCalculation: false,

        copyJobDataDone: false,
        copyTechnicalDataDone: false,
        copyCalculationDone: false,


    }
});