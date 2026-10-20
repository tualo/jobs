Ext.define('Tualo.routes.jobs.CopyCalculation', {
    statics: {
        load: async function () {
            return [
                {
                    name: 'Jobs Copy Calculation   ',
                    path: '#jobs-copy-calculation'
                }
            ]
        }
    },
    url: 'jobs-copy-calculation(/:{id})',
    handler: {
        action: function (values) {
            Ext.getApplication().addView('Tualo.jobs.lazy.CopyCalculation', {
                calculationId: values.id
            });

        },
        before: function (values, action) {
            action.resume();
        }

    }
});