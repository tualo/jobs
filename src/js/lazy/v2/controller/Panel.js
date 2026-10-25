Ext.define('Tualo.jobs.lazy.v2.controller.Panel', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.tualo_jobs_panel_v2',
    mixins: [

        'Tualo.jobs.lazy.v2.mixins.Report',
        'Tualo.jobs.lazy.v2.mixins.Save',
        'Tualo.jobs.lazy.v2.mixins.StoreLoad',
        'Tualo.jobs.lazy.v2.mixins.DataChange',
        'Tualo.jobs.lazy.v2.mixins.PrepareText',
        'Tualo.jobs.lazy.v2.mixins.CreateTemplateData',

    ],
    onBoxReady: function () {
        let me = this,
            view = me.getView(),
            model = me.getViewModel(),
            dataStore = model.getStore('data');
        console.log('Tualo.jobs.lazy.v2.controller.Panel', 'onBoxReady');
        me.fetchInformation();
        dataStore.load();
    },
    checkedInitialRendering: function () {
        console.log('Panel.checkedInitialRendering');
        let me = this;
        me.checkedInitialRenderingAsync();
    },
    checkedInitialRenderingAsync: async function () {
        let me = this,
            view = me.getView(),
            model = me.getViewModel(),
            dataStore = model.getStore('data'),
            previewFrame = view.getComponent('previewOuterFrame').getComponent('previewFrame');

        let r = await me.prepareTexts(dataStore, dataStore.getRange())
        console.log('Prepared texts result:', r);
        if (r) {
            previewFrame.setData({ report: model.get('reportTemplate') });
        } else {
            console.error('Failed to prepare texts');

        }
        return true;
    },
    fetchInformation: async function () {
        let me = this;
        if (await me.queryReportTemplate()) {
            await me.queryAddress();
            me.checkedInitialRendering();
        }
    },
    queryReportTemplate: async function () {
        let me = this,
            view = me.getView(),
            model = me.getViewModel(),
            data = await fetch('./jobs/template-report/' + model.get('reportType') + '/' + model.get('jobid'))
                .then(res => res.json())
                .then(res => res);
        if (data.success) {
            model.set('reportTemplate', data.report);
            return true;
        } else {
            console.error('Failed to fetch report template', data);
            Ext.toast({
                html: data.msg,
                title: 'Fehler',
                align: 't',
                iconCls: 'fa fa-warning'
            });
            return false;
        }
    },
    queryAddress: async function () {
        let me = this,
            view = me.getView(),
            model = me.getViewModel(),
            formData = new FormData(),
            filter = [{ "property": "id", "value": model.get('jobid'), "operator": "eq" }],
            _ = formData.append("filter", JSON.stringify(filter)),
            data = await fetch('./ds/view_tualo_job_address/read', {
                method: "POST",
                body: formData,
            })
                .then(res => res.json())
                .then(res => res);
        if (data.success) {
            model.set('address', data.data[0].address);
            let report = model.get('reportTemplate');
            report.address = model.get('address');
            model.set('reportTemplate', report);
            return true;
        } else {
            console.error('Failed to fetch address', data);
            Ext.toast({
                html: data.msg,
                title: 'Fehler',
                align: 't',
                iconCls: 'fa fa-warning'
            });
            return false;
        }
    }




});

