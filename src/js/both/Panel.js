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

Ext.define('Tualo.routes.jobs.Panel', {
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