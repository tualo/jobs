Ext.define('Tualo.jobs.lazy.models.CopyCalculation', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.tualo_jobs_copy_calculation',
    data: {
        calculationId: null,
        calculationNumber: null,

        targetJobId: null,

        copyJobData: true,
        copyTechnicalData: false,
        copyCalculation: false,

        copyJobDataDone: false,
        copyTechnicalDataDone: false,
        copyCalculationDone: false,


    }
});