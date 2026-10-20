Ext.define('Tualo.jobs.lazy.controller.CopyCalculation', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.tualo_jobs_copy_calculation',
    mixins: [
    ],
    onBoxReady: function () {
        console.log('onBoxReady');
        let store = this.getView().getComponent('copy-source').getComponent('combobox_view_copy_calculation_dd').getStore();
        let view = this.getView();

        if (!Ext.isEmpty(view.getViewModel().get('calculationId'))) {
            this.getView().getComponent('copy-source').getComponent('combobox_view_copy_calculation_dd').doQuery('#' + view.getViewModel().get('calculationId'));
        }
    },
    setCalculationId: function (val) {
        console.log('setCalculationId called with:', val);
        let view = this.getView();

        view.getViewModel().set('calculationId', val);
        return val;
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
            me.query(() => me.create(next));
        } else if (currentId == 'copy-source') {
            me.query(() => {
                var me = this,
                    view = me.getView(),
                    data = view.getViewModel().get('data');

                // referencenr
                // jobid
                view.getViewModel().set('jobId', data.jobid);
                window.view = view;
                view
                    .getComponent('copy-options')
                    .getComponent('copy-options2')
                    .getComponent('copy-options3')
                    .getComponent('combobox_view_copy_job_dd_id')
                    .doQuery('#' + view.getViewModel().get('jobId'));

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
        me.getView().down('#card-next').setDisabled(next === me.getView().items.length - 1);

    },


    query: async function (next) {
        var me = this,
            view = me.getView(),
            calculationId = view.getViewModel().get('calculationId'),
            newData = {};
        fetchUrl = './report/calculation/' + calculationId;

        let response = await fetch(fetchUrl);
        let data = await response.json();

        if (!data || !data.success) {
            console.error('Failed to fetch calculation data:', data);
            Ext.Toast.show({
                title: 'Fehler',
                html: 'Fehler beim Laden der Kalkulations-Daten.',
                align: 't'
            });
            return;
        }
        console.log('Fetched calculation data:', data);

        newData = data.data;
        /*
        delete newData.id; // Reset the ID for the new job copy
        delete newData.__id; // Reset the creation date for the new job copy
        delete newJobData.job_number; // Reset the creation date for the new job copy
        delete newJobData.create_date; // Reset the creation date for the new job copy
        newJobData.order_date = Ext.util.Format.date(new Date(), 'Y-m-d'); // Reset the creation date for the new job copy
        newJobData.status = 1; // Set the status for the new job copy
        newJobData.kundennummer = view.getViewModel().get('kundennummer');
        */
        view.getViewModel().set('data', newData);


        fetchUrl = './ds/tualo_job/read/' + newData.jobid + '';

        response = await fetch(fetchUrl);
        data = await response.json();

        if (!data || !data.success) {
            console.error('Failed to fetch job data:', data);
            Ext.Toast.show({
                title: 'Fehler',
                html: 'Fehler beim Laden der Job-Daten.',
                align: 't'
            });
            return;
        }
        console.log('Fetched job data:', data.data[0]);


        view.getViewModel().set('sourcejob', data.data[0]);

        next();

    },
    create: async function (next) {
        var me = this,
            view = me.getView(),
            data = view.getViewModel().get('data'),
            jobId = view.getViewModel().get('jobId'),
            fetchUrl = './report/calculation/-1',
            value = view
                .getComponent('copy-options')
                .getComponent('copy-options2')
                .getComponent('copy-options3')
                .getComponent('combobox_view_copy_job_dd_id')
                .getSelection().get('__id')

        console.log('Creating new job with data:', data, jobId, value);

        delete data.id
        data.jobid = value;
        data.referencenr = value;
        data.document_name = 'Kopie von ' + data.document_name + '  (' + Ext.util.Format.date(new Date(), 'd.m H:i') + ')';
        data.positions.forEach(position => {
            delete position.reportnr; // Reset the ID for the new job copy
            delete position.id; // Reset the ID for the new job copy
            delete position.oid;
            delete position.ozusatz;
            delete position.xid;
            delete position.xzusatz;
            delete position.vid;
            delete position.vzusatz;
            delete position.zid;
            delete position.zzusatz;

            // Reset the creation date for the new job copy
        });

        console.log('Creating new job with data:', data);

        const response = await fetch(fetchUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        console.log('Response from creating new job:', result);
        Ext.getApplication().redirectTo('#ds/tualo_job/id/' + result.data.jobid, {
            force: true
        });

        return;

        /*
        const response = await fetch(fetchUrl, {
            method: 'PUT',
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
        */
    }
});