Ext.define('Tualo.routes.jobs.Copy', {
    statics: {
        load: async function () {
            return [
                {
                    name: 'Jobs Copy',
                    path: '#jobs-copy'
                }
            ]
        }
    },
    url: 'jobs-copy',
    handler: {
        action: function () {
            Ext.getApplication().addView('Tualo.jobs.lazy.Copy', {
            });

        },
        before: function (action) {
            action.resume();
        }

    }
});


