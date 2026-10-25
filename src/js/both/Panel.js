Ext.define('Tualo.routes.jobs.Panel', {
    statics: {
        load: async function () {
            return [
                {
                    name: 'job2offer/panel',
                    path: '#job2offer/panel'
                }
            ]
        }
    },
    url: 'job2offer/panel(/:{jobid})',
    handler: {
        action: function (values) {
            Ext.getApplication().addView('Tualo.jobs.lazy.Panel', {
                jobid: values.jobid,
                reportType: 'angebot'
            });
        },
        before: function (values, action) {
            action.resume();
        }
    }
});




Ext.define('Tualo.routes.jobs.PanelInvoice', {
    statics: {
        load: async function () {
            return [
                {
                    name: 'job2invoice/panel',
                    path: '#job2invoice/panel'
                }
            ]
        }
    },
    url: 'job2invoice/panel(/:{jobid})',
    handler: {
        action: function (values) {
            Ext.getApplication().addView('Tualo.jobs.lazy.Panel', {
                jobid: values.jobid,
                reportType: 'rechnung'
            });
        },
        before: function (values, action) {
            action.resume();
        }
    }
});


Ext.define('Tualo.routes.jobs.PanelReport', {
    statics: {
        load: async function () {
            return [
                {
                    name: 'job2report/panel',
                    path: '#job2report/panel'
                }
            ]
        }
    },
    url: 'job2report/:{template}/:{reportType}/:{jobid}(/:{optional})',
    handler: {
        action: function (values) {
            let optionalFilter = [];
            try {
                optionalFilter = JSON.parse(uriDecode(values.optional))
            } catch (e) {
                optionalFilter = [];
            }
            Ext.getApplication().addView('Tualo.jobs.lazy.v2.Panel', {
                jobid: values.jobid,
                template: values.template,
                reportType: values.reportType,
                optionalFilter: optionalFilter
            });
        },
        before: function (values, action) {
            action.resume();
        }
    }
});

Ext.define('Tualo.routes.jobs.CopyPanel', {
    statics: {
        load: async function () {
            return [
                {
                    name: 'jobs-copy',
                    path: '#jobs-copy'
                }
            ]
        }
    },
    url: 'jobs-copy(/:{jobnumber})',
    handler: {
        action: function (values) {
            Ext.getApplication().addView('Tualo.jobs.lazy.Copy', {
                jobnumber: values.jobnumber,
            });
        },
        before: function (values, action) {
            action.resume();
        }
    }
});