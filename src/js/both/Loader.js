Ext.define('Tualo.jobs.Loader', {
    singleton: true,

    constructor: function () {
        Ext.Loader.setPath('Tualo.jobs.lazy', './jsjobs');
    }
});
Ext.Loader.setPath('Tualo.jobs.lazy', './jsjobs');