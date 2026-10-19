Ext.define('Tualo.jobs.lazy.controller.Copy', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.tualo_jobs_copy',
    mixins: [
    ],
    onBoxReady: function () {
        console.log('onBoxReady');
    },
    showNext: function () {
        this.doCardNavigation(1);
    },

    showPrevious: function (btn) {
        this.doCardNavigation(-1);
    },

    getCardIndex: function () {
        var me = this,
            view = me.getView(),
            l = view.getLayout(),
            id = l.activeItem.itemId || l.activeItem.getId();
        return view.items.indexMap[id];
    },
    doCardNavigation: function (incr) {
        window.v = this.getView();
        var me = this,
            view = me.getView(),
            l = view.getLayout(),
            currentId = l.activeItem.itemId;
        i = me.getCardIndex(),
            s = view.items.length,
            next = parseInt(i, 10) + incr;

        console.log('currentId', currentId, 'next', next, 'current', i);

        // me.getController().forceSelection();
        if (currentId == 'copy-options') {
            // me.getController().getTanModes();
            // alert('You are on the copy options card.');
            // me.next(next);
            me.queryJob(() => me.createJob(next));
        } else if (currentId == 'copy-source') {
            me.queryJob(() => {
                var me = this,
                    view = me.getView(),
                    jobData = view.getViewModel().get('jobData');

                view.getViewModel().set('kundennummer', jobData.kundennummer);
            });
        }


        console.log(currentId, 'next', next, 'current', i)
        me.next(next);
    },
    next: function (next) {
        var me = this,
            l = me.getView().getLayout();
        l.setActiveItem(next);
        me.getView().down('#card-prev').setDisabled(next === 0);
        me.getView().down('#card-next').setDisabled(next === s - 1);

    },


    queryJob: async function (next) {
        var me = this,
            view = me.getView(),
            jobId = view.getViewModel().get('jobid'),
            newJobData = {};
        fetchUrl = './ds/tualo_job/read/' + jobId;

        const response = await fetch(fetchUrl);
        const data = await response.json();

        if (!data || !data.success) {
            console.error('Failed to fetch job data:', data);
            Ext.Toast.show({
                title: 'Fehler',
                html: 'Fehler beim Laden der Job-Daten.',
                align: 't'
            });
            return;
        }
        console.log('Fetched job data:', data);

        newJobData = data.data[0];
        delete newJobData.id; // Reset the ID for the new job copy
        delete newJobData.__id; // Reset the creation date for the new job copy
        delete newJobData.job_number; // Reset the creation date for the new job copy
        newJobData.order_date = Ext.util.Format.date(new Date(), 'Y-m-d'); // Reset the creation date for the new job copy
        newJobData.status = 1; // Set the status for the new job copy
        newJobData.kundennummer = view.getViewModel().get('kundennummer');
        view.getViewModel().set('jobData', newJobData);

        next();

    },
    createJob: async function (next) {
        var me = this,
            view = me.getView(),
            jobData = view.getViewModel().get('jobData'),
            fetchUrl = './ds/tualo_job/create';

        const response = await fetch(fetchUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jobData)
        });

        const data = await response.json();

        if (!data || !data.success) {
            console.error('Failed to create job:', data);
            Ext.Toast.show({
                title: 'Fehler',
                html: 'Fehler beim Erstellen des neuen Jobs.',
                align: 't'
            });
            return;
        }

        console.log('Created new job:', data);
        view.getViewModel().set('jobData', data.data[0]);
        me.queryTechnicalData(next);
    },
    queryTechnicalData: async function (next) {
        var me = this,
            view = me.getView(),
            jobId = view.getViewModel().get('jobid'),

            newJobID = view.getViewModel().get('jobData').id,
            fetchUrl = './ds/tualo_job_data/read';

        let filter = [{ "property": "job_id", "value": jobId, "operator": "eq" }]
        fetchUrl += '?filter=' + encodeURIComponent(JSON.stringify(filter));

        const response = await fetch(fetchUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();

        if (!data || !data.success) {
            console.error('Failed to fetch technical data:', data);
            Ext.Toast.show({
                title: 'Fehler',
                html: 'Fehler beim Laden der technischen Daten.',
                align: 't'
            });
            return;
        }

        let list = data.data || [];
        list.forEach(item => {
            delete item.id; // Reset the ID for the new job copy
            delete item.__id; // Reset the creation date for the new job copy
            delete item.create_date; // Reset the creation date for the new job copy
            delete item.update_date; // Reset the update date for the new job copy
            delete item.login; // Reset the login for the new job copy
            item.job_id = newJobID; // Assign the new job ID to the technical data
        });

        console.log('Fetched technical data:', data);
        view.getViewModel().set('technicalData', list);
        me.createTechnicalData(next);
    },
    createTechnicalData: async function (next) {
        var me = this,
            view = me.getView(),
            technicalData = view.getViewModel().get('technicalData'),
            copyTechnicalData = view.getViewModel().get('copyTechnicalData'),
            newJobID = view.getViewModel().get('jobData').id,
            newJob_number = view.getViewModel().get('jobData').job_number,
            fetchUrl = './ds/tualo_job_data/create';

        if (copyTechnicalData === true) {
            const response = await fetch(fetchUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(technicalData)
            });

            const data = await response.json();

            if (!data || !data.success) {
                console.error('Failed to create technical data:', data);
                Ext.Toast.show({
                    title: 'Fehler',
                    html: 'Fehler beim Erstellen der technischen Daten.',
                    align: 't'
                });
                return;
            }

            console.log('Created technical data:', data);
        }
        // next();
        //return data.data;
        Ext.getApplication().redirectTo('ds/tualo_job/job_number/' + encodeURIComponent(newJob_number));
    }
});