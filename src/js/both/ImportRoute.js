Ext.define('Tualo.routes.jobs.Import', {
    statics: {
        load: async function () {
            return [
                {
                    name: 'Jobs Import',
                    path: '#jobs-import'
                }
            ]
        }
    },
    url: 'jobs-import',
    handler: {
        action: function () {
            console.log('Adding Jobs view');
            Ext.getApplication().addView('Tualo.jobs.lazy.Panel', {
            });

        },
        before: function (action) {
            action.resume();
        }

    }
});