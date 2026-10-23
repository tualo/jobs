Ext.define('Tualo.jobs.lazy.controller.Panel', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.tualo_jobs_panel',
    mixins: [

        'Tualo.jobs.lazy.mixins.Report',
        'Tualo.jobs.lazy.mixins.Save'

    ],
    onBoxReady: function () {
        console.log('Panel.onBoxReady');
        console.log('onBoxReady');

        setTimeout(() => {
            this.showRealAmountColumns();
        }, 100);

        setTimeout(() => {
            this.getView().getComponent('westPanel').getComponent('calculationGrid').updateLayout();
        }, 1000);

        this.canSaveReport();

    },

    onReload: function () {
        console.log('Panel.onReload');
        let model = this.getViewModel(),
            store = model.getStore('data');
        store.load();



    },

    showRealAmountColumns: function () {
        console.log('Panel.showRealAmountColumns');
        let model = this.getViewModel();
        window.c = this;
        if (model.get('reportType') === 'rechnung') {
            let grid = this.getView().getComponent('westPanel').getComponent('calculationGrid');
            try {
                grid.columns.forEach(column => {
                    console.log('Panel.showRealAmountColumns.columns.forEach');
                    if (column.dataIndex === 'use_real_amount' || column.dataIndex === 'ist_anzahl') {
                        column.setVisible(true);
                    }
                });
            } catch (e) {
                console.error(e);
            }

        } else {
            let grid = this.getView().getComponent('westPanel').getComponent('calculationGrid');
            try {
                grid.columns.forEach(column => {
                    console.log('Panel.showRealAmountColumns.columns.forEach');
                    if (column.dataIndex === 'use_real_amount' || column.dataIndex === 'ist_anzahl') {
                        column.setVisible(false);
                    }
                });
            } catch (e) {
                console.error(e);
            }
        }
    },

    onDropGrid: function () {
        console.log('Panel.onDropGrid');
        this.numberRows();
    },

    numberRows: function () {
        console.log('Panel.numberRows');
        var i,
            view = this.getView(),
            model = this.getViewModel(),
            grid = view.getComponent('westPanel').getComponent('calculationGrid'),
            store = grid.getStore(),
            records = store.getRange(),
            min = Number.POSITIVE_INFINITY,
            fld_name = 'position';
        if (!Ext.isEmpty(fld_name)) {
            //vc.getView().getComponent('list').getStore().getRange();


            for (i = 0; i < records.length; i++) {
                min = Math.min(min, records[i].get(fld_name));
            }
            min = 0;

            for (i = 0; i < records.length; i++) {
                console.log('onDropGrid', records[i], fld_name, min + i);
                records[i].set(fld_name, min + i);
            }
        }
    },


    // shared
    loadAddress: function () {
        console.log('Panel.loadAddress');
        let model = this.getViewModel(),
            view = this.getView(),
            store = model.getStore('view_tualo_job_address'),
            listfilter = store.getFilters(),
            listsorters = store.getSorters(),
            filters = [],
            sorters = [],
            extraParams = store.getProxy().getExtraParams();

        filters.push({
            property: 'id',
            value: model.get('jobid'),
            operator: 'eq'
        });


        extraParams.filter = Ext.JSON.encode(filters);
        extraParams.sort = Ext.JSON.encode(sorters);
        store.getProxy().setExtraParams(extraParams);
        store.load();


    },
    // shared
    onAddressStoreLoad: function () {
        console.log('Panel.onAddressStoreLoad');
        let model = this.getViewModel(),
            store = model.getStore('view_tualo_job_address'),
            data = store.getRange();

        if (data.length > 0) {
            model.set('address', data[0].get('address'));
            model.set('kundennummer', data[0].get('kundennummer'));
        }

    },

    onDocumentNamesStoreBeforeLoad: function (store, operation) {
        console.log('Panel.onDocumentNamesStoreBeforeLoad');
        let model = this.getViewModel(),
            view = model.getView(),
            filters = [],
            extraParams = store.getProxy().getExtraParams();


        filters.push({
            property: 'jobid',
            value: model.get('jobid'),
            operator: 'eq'
        });


        extraParams.filter = Ext.JSON.encode(filters);
        store.getProxy().setExtraParams(extraParams);
    },

    // shared
    onDataStoreBeforeLoad: function (store, operation) {
        console.trace('Panel data store beforeload');
        console.log('Panel.onDataStoreBeforeLoad', store);
        let model = this.getViewModel(),
            view = this.getView(),
            listfilter = store.getFilters(),
            listsorters = store.getSorters(),
            filters = [],
            sorters = [],
            extraParams = store.getProxy().getExtraParams();



        listsorters.each(function (item) {
            console.log('Panel.onDataStoreBeforeLoad.sorters.each');
            sorters.push(item.getConfig());
        });
        listfilter.each(function (item) {
            console.log('Panel.onDataStoreBeforeLoad.filters.each');
            filters.push(item.getConfig());
        });
        if (Ext.isEmpty(extraParams)) { extraParams = {}; };



        filters.push({
            property: 'jobid',
            value: model.get('jobid'),
            operator: 'eq'
        });


        filters.push({
            property: 'reporttype',
            value: model.get('reportType'),
            operator: 'eq'
        });
        if (!Ext.isEmpty(model.get('document_name_filter'))) {
            filters.push({
                property: 'document_name',
                value: model.get('document_name_filter'),
                operator: 'eq'
            });
        }

        extraParams.filter = Ext.JSON.encode(filters);
        extraParams.sort = Ext.JSON.encode(sorters);
        store.getProxy().setExtraParams(extraParams);

        //this.refreshBlgPosCalculation();
        this.loadAddress();

        return true;

    },

    onDataStoreLoad: function (store, records, successful, operation, eOpts) {
        console.log('Panel.onDataStoreLoad');
        let model = this.getViewModel(),
            reporttype = model.get('reportType'),
            artikelgruppen = model.getStore('artikelgruppen');


        records.forEach((record) => {
            console.log('Panel.onDataStoreLoad.records.forEach');
            if (Ext.isEmpty(record.get('leistungsbeschreibung')) && (!Ext.isEmpty(record.get('langtext')))) {
                record.set('leistungsbeschreibung', record.get('langtext'));
            }
            if (Ext.isEmpty(record.get('leistungsbeschreibung'))) {
                let artikel = artikelgruppen.findRecord('gruppen_id', record.get('artikel'), 0, false, true, true);
                record.set('leistungsbeschreibung', record.get('artikel'));
                if (!Ext.isEmpty(artikel)) {
                    record.set('leistungsbeschreibung', artikel.get('langtext'));
                }
                if (!Ext.isEmpty(record.get('bemerkung'))) {
                    record.set('leistungsbeschreibung', record.get('leistungsbeschreibung') + "\n" + record.get('bemerkung'));
                }

                record.commit();
            }

            if (Ext.isEmpty(record.get('gruppierung'))) {
                record.set('gruppierung', (new Date()).getTime() + Math.floor(Math.random() * 1000));
            }

            if (record.get('use_in_offer') == 1) {
                model.set('document_name', record.get(reporttype + '_title'))
            }

            /*
 
            if (Ext.isEmpty(record.get('gruppenpreis_netto'))) {
                record.set('gruppenpreis_netto', record.get('ist_netto'));
            }
            if (Ext.isEmpty(record.get('gruppenpreis_brutto'))) {
                record.set('gruppenpreis_brutto', record.get('brutto'));
            }
 
            // bitte später entfernen, wenn nicht mehr benötigt
            record.set('netto', Math.round(record.get('epreis') * record.get('anzahl') * 100) / 100);
            */

        });
        setTimeout(() => {
            this.documentNames(records);
        }, 1000);
        // this.documentNames(records);
        this.gruppenPreise();
    },

    /*
    documentNames: function (records) {
        let model = this.getViewModel(),
            store = model.getStore('document_names'),
            reporttype = model.get('reportType'),
            hash = {},
            list = [];

        records.forEach((record) => {
            if (record.get('use_in_offer') == 1) {
                let name = record.get(reporttype + '_title');
                if (Ext.isEmpty(model.get('document_name'))) {
                    model.set('document_name', name);
                }
                if (!hash[name]) {
                    hash[name] = true;
                    list.push({ "name": name, id: name });
                }
            }
        });

        console.log('documentNames', list);
        store.loadData(list);

    },
    */


    gruppenPreise: function () {
        console.log('Panel.gruppenPreise');
        let model = this.getViewModel(),
            store = model.getStore('data'),
            range = store.getRange(),
            reporttype = model.get('reportType'),
            gruppierungen = {};


        for (let i = 0; i < range.length; i++) {
            let record = range[i];
            if (!gruppierungen['k' + record.get('gruppierung')]) {
                gruppierungen['k' + record.get('gruppierung')] = {
                    netto: 0,
                    brutto: 0
                };
            }
            console.log('Panel.gruppenPreise.each', record.get('ist_netto'));
            if ((record.get('use_real_amount') == 1) && (reporttype == 'rechnung')) {
                gruppierungen['k' + record.get('gruppierung')].netto += record.get('ist_netto');
                gruppierungen['k' + record.get('gruppierung')].brutto += record.get('ist_brutto');
            } else {
                gruppierungen['k' + record.get('gruppierung')].netto += record.get('netto');
                gruppierungen['k' + record.get('gruppierung')].brutto += record.get('brutto');
            }
        }

        for (let i = 0; i < range.length; i++) {
            let record = range[i];
            console.log('Panel.gruppenPreise.assign.each');
            record.set('gruppenpreis_netto', gruppierungen['k' + record.get('gruppierung')].netto);
            record.set('gruppenpreis_brutto', gruppierungen['k' + record.get('gruppierung')].brutto);
        }
        console.log('gruppenPreise', gruppierungen);
    },

    refreshBlgPosCalculation: function () {
        console.log('Panel.refreshBlgPosCalculation');
        let model = this.getViewModel(),
            view = this.getView(),
            store = model.getStore('blg_pos_calculation'),
            listfilter = store.getFilters(),
            listsorters = store.getSorters(),
            filters = [],
            sorters = [],
            extraParams = store.getProxy().getExtraParams();

        filters.push({
            property: 'jobid',
            value: model.get('jobid'),
            operator: 'eq'
        });


        extraParams.filter = Ext.JSON.encode(filters);
        extraParams.sort = Ext.JSON.encode(sorters);
        store.getProxy().setExtraParams(extraParams);
        store.load();
    },


    onTextStoreBeforeLoad: function (store, operation, eOpts) {
        console.log('Panel.onTextStoreBeforeLoad');
        let extraParams = store.getProxy().getExtraParams(),
            filters = [];

        filters.push({
            property: 'tualo_job_id',
            value: this.getViewModel().get('jobid'),
            operator: 'eq'
        });
        extraParams.filter = Ext.JSON.encode(filters);
        store.getProxy().setExtraParams(extraParams);
    },







    runCalculation: function () {
        console.log('Panel.runCalculation');


        // this.gruppenPreise();
        this.updatePreviewFrame();
        console.log('runCalculation', 'stop');

    },

    updateSelectionData: function () {
        console.log('Panel.updateSelectionData');
        let fn = () => {
            console.log('Panel.updateSelectionData.timeout');
            let model = this.getViewModel(),
                view = this.getView(),
                store = model.getStore('data'),
                initialValue = 0,
                reporttype = model.get('reportType'),
                aggregation = model.get('selectedAggregation'),
                grid = view.getComponent('westPanel').getComponent('calculationGrid'),
                records = grid.getSelectionModel().getSelection(),
                total_amount = 0,
                epreis = 0,
                selectedSum = 0,
                sumUse = 0;

            store.each((record) => {
                console.log('Panel.updateSelectionData.store.each');
                if (record.get('use_in_offer') == 1) {
                    sumUse += record.get('ist_netto');
                    epreis = record.get('epreis');
                    total_amount += record.get('anzahl');


                }
            });
            records.forEach((record) => {
                console.log('Panel.updateSelectionData.records.forEach');
                selectedSum += record.get('ist_netto');
            });

            model.set('total_net', sumUse);
            model.set('epreis', epreis);
            model.set('total_amount', total_amount);
            model.set('selectedSum', selectedSum);

            switch (aggregation) {
                case "zero":
                    initialValue = 0;
                    break;
                case "one":
                    initialValue = 1;
                    break;
                case "min":
                    initialValue = Number.MAX_SAFE_INTEGER;
                    break;
                case "max":
                    initialValue = Number.MIN_SAFE_INTEGER;
                    break;
                case "tmax":
                    initialValue = Number.MIN_SAFE_INTEGER;
                    break;
                default:
                    initialValue = 0;
            }

            let acc = 0;
            model.set('selectedMenge',
                records.reduce((acc, current) => {
                    console.log('Panel.updateSelectionData.records.reduce');
                    console.log('aggregation', aggregation, acc, current);
                    switch (aggregation) {
                        case "zero":
                            return 0;
                        case "one":
                            return 1;
                        case "min":
                            return Math.min(acc, current.get('anzahl'));
                        case "max":
                            return Math.max(acc, current.get('anzahl'));
                        case "tmax":
                            return Math.round(Math.max(acc, current.get('anzahl')) / 1000) * 1000;
                        default:
                            return acc + current.get('anzahl');
                    }

                }, initialValue)
            );

            this.calculateTemplate();
        }
        setTimeout(fn, 100);

    },
    onFramedLoaded: function () {
        console.log('Panel.onFramedLoaded');
        let me = this,
            view = me.getView(),
            previewFrame = view.getComponent('previewOuterFrame').getComponent('previewFrame');

        previewFrame.getEl().dom.querySelector('iframe').contentWindow.document.querySelectorAll(".editable").forEach(function (element) {
            console.log('Panel.onFramedLoaded.editable.forEach');
            element.addEventListener("input", me.frameContentChanged.bind(me), false);
        });
    },
    frameContentChanged: function (event) {
        console.log('Panel.frameContentChanged');
        let me = this,
            elementID = event.srcElement.id,
            model = me.getViewModel(),
            store = model.getStore('data'),
            parts = elementID.split("_"),
            id = parts.splice(0, 1)[0],
            field = parts.join("_"),
            firstRecord = store.findRecord('id', id, 0, false, false, true);

        if ((field == 'leistungsbeschreibung') || (field == 'pos_text')) {
            store.getRange().forEach((record) => {
                console.log('Panel.frameContentChanged.description.forEach');
                if (record.get('gruppierung') == firstRecord.get('gruppierung')) {
                    me.lastFrameUpdate = (new Date()).getTime();
                    record.set(field, event.srcElement.innerHTML);
                }
            });
        }

        if (field == 'teilueberschrift') {
            let oldValue = firstRecord.get(field);
            store.getRange().forEach((record) => {
                console.log('Panel.frameContentChanged.heading.forEach');
                if (record.get(field) == oldValue) {
                    me.lastFrameUpdate = (new Date()).getTime();
                    record.set(field, event.srcElement.innerHTML);
                }
            });
        }
    },

    onChangeDocumentName: function (field, newValue, oldValue) {
        console.log('Panel.onChangeDocumentName');
        let me = this,
            model = me.getViewModel(),
            store = model.getStore('data'),
            range = store.getRange();

        if (!Ext.isEmpty(newValue)) {
            model.set('document_name_filter', newValue);
            store.load();
        }
        /*
        range.forEach((record) => {
            console.log('Panel.onChangeDocumentName.range.forEach');
            if (record.get('use_in_offer') == 1) {
                record.set('document_name', newValue);
            }
        });
        */

        // model.set('document_name', newValue);

    },

    canSaveReport: async function () {
        console.log('Panel.canSaveReport');
        let model = this.getViewModel();
        let response = await fetch('./jobs/cansave/' + model.get('reportType'));
        let result = await response.json();
        model.set('canSaveReport', result.success);
        return result.success;
    },
    hasInitializedFrameEventLoaded: false,
    lastFrameUpdate: 0,
    updatePreviewFrame: async function () {
        console.log('Panel.updatePreviewFrame');
        let model = this.getViewModel(),
            view = this.getView(),
            store = model.getStore('data'),
            usedRecords = 0,
            previewFrame = view.getComponent('previewOuterFrame').getComponent('previewFrame');
        //this.gruppenPreise()
        if (this.lastFrameUpdate + 1000 > (new Date()).getTime()) {
            return;
        }
        this.lastFrameUpdate = (new Date()).getTime();
        if (!this.hasInitializedFrameEventLoaded) {
            previewFrame.getEl().dom.querySelector('iframe').addEventListener('load', () => {
                console.log('Panel.updatePreviewFrame.iframe.load');
                this.onFramedLoaded();
            });
            this.hasInitializedFrameEventLoaded = true;
        }

        store.each((record) => {
            console.log('Panel.updatePreviewFrame.store.each');
            if (record.get('use_in_offer') == 1) {
                usedRecords++;
            }
        });

        if (usedRecords > 0) {
            if ('about:blank' == previewFrame.src) {
                console.log('previewFrame', previewFrame.src);
                previewFrame.src = './pugreporthtml/view_blg_list_calculation/report_invoice/-1';
            }

            let res = await (await fetch('./usercache', {
                method: 'PUT',
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
                body: JSON.stringify(this.getReport()),
            })).json();
            console.log('saved cache', res);
            if (res.success) {
                let oldYPos = previewFrame.getEl().dom.querySelector('iframe').contentWindow.scrollY;
                let oldXPos = previewFrame.getEl().dom.querySelector('iframe').contentWindow.scrollX;

                console.log('>>>>>>>>>>>>>>><', oldXPos, oldYPos);

                previewFrame.load(previewFrame.src + "?key=" + res.key);


                setTimeout(() => {
                    console.log('Panel.updatePreviewFrame.firstTimeout');
                    previewFrame.src = './pugreporthtml/view_blg_list_calculation/report_invoice/-1';
                    previewFrame.load(previewFrame.src + "?key=" + res.key);

                    setTimeout(() => {
                        console.log('Panel.updatePreviewFrame.secondTimeout');
                        previewFrame.getEl().dom.querySelector('iframe').contentWindow.scrollBy(oldXPos, oldYPos);
                    }, 4000);


                }, 100);

            }


        }

    },



    onSelectionchange: function (view, records) {
        console.log('Panel.onSelectionchange');
        let model = this.getViewModel(),
            initialValue = 0,
            aggregation = model.get('selectedAggregation');
        model.set('selectedRows', records.length);
        if (records.length > 0) {
            model.set('selectedRecord', records[0]);
        }
        this.updateSelectionData();
    },

    calculateTemplate: function () {
        console.log('Panel.calculateTemplate');
        let model = this.getViewModel(),
            view = this.getView(),
            selectedTemplate = model.get('selectedTemplate'),
            record = model.get('selectedRecord'),
            templateStore = model.getStore('templates'),
            templateRecord = templateStore.findRecord('id', selectedTemplate, 0, false, true, true);
        if (templateRecord) {
            console.log('templateRecord', templateRecord.get('template'));

            let tpl = new Ext.XTemplate(templateRecord.get('template'));

            let object = record.data;
            object.anzahl = model.get('selectedMenge');

            model.set('renderedTemplate', tpl.apply(object))
        }

    },

    onUseRow: function () {
        console.log('Panel.onUseRow');
        let me = this,
            model = me.getViewModel(),
            view = me.getView(),
            grid = view.getComponent('westPanel').getComponent('calculationGrid'),
            selection = grid.getSelectionModel().getSelection(),
            grouingId = (new Date()).getTime();

        selection.forEach((record) => {
            console.log('Panel.onUseRow.selection.forEach');
            record.set('gruppierung', grouingId);
            record.set('use_in_offer', 1);
            record.set('use_in_offer', 1);
            if (model.get('renderedTemplate') != '') {
                let text = model.get('renderedTemplate');
                record.set('leistungsbeschreibung', text);
            }
            console.log('onUseRow record', record);
            record.set('gruppenmenge', model.get('selectedMenge'));
        });
        me.gruppenPreise();

        grid.getStore().sync({
            callback: function (batch, options) {
                console.log('Panel.onUseRow.sync.callback');
                console.log('onUseRow sync', batch, options);
                me.runCalculation.call(me);
            }
        });
    },

    onDataDataChanged: function () {
        console.log('Panel.onDataDataChanged');
        /*
        localRecord.singleprice = localRecord.epreis;
                localRecord.net = localRecord.epreis * localRecord.amount;
                localRecord.tax = localRecord.steuersatz;
                localRecord.taxvalue = localRecord.steuersatz / 100 * localRecord.net;
                localRecord.gross = localRecord.net + localRecord.taxvalue;


                */


        this.updatePreviewFrame();
    },




    onPrintClick: function () {
        console.log('Panel.onPrintClick');
        var me = this,
            view = me.getView(),
            previewFrame = view.getComponent('previewOuterFrame').getComponent('previewFrame'),
            wnd = previewFrame.getEl().dom.querySelector('iframe').contentWindow;
        wnd.print();
    },

    onBoldClick: function () {
        console.log('Panel.onBoldClick');
        var me = this,
            view = me.getView(),
            previewFrame = view.getComponent('previewOuterFrame').getComponent('previewFrame'),
            wnd = previewFrame.getEl().dom.querySelector('iframe').contentWindow;
        if (wnd)
            wnd.document.execCommand('bold', false, null);
    },
    onItalicClick: function () {
        console.log('Panel.onItalicClick');
        var me = this,
            view = me.getView(),
            previewFrame = view.getComponent('previewOuterFrame').getComponent('previewFrame'),
            wnd = previewFrame.getEl().dom.querySelector('iframe').contentWindow;
        if (wnd)
            wnd.document.execCommand('italic', false, null);

    },


    onColorClick: function (btn) {
        console.log('Panel.onColorClick');
        var me = this,
            newValue = btn.rgb,
            view = me.getView(),
            previewFrame = view.getComponent('previewOuterFrame').getComponent('previewFrame'),
            wnd = previewFrame.getEl().dom.querySelector('iframe').contentWindow;
        if (wnd)
            wnd.document.execCommand('foreColor', false, newValue);

    },

    onColorStoreLoad: function (store, records) {
        console.log('Panel.onColorStoreLoad');
        var me = this,
            view = me.getView(),
            previewOuterFrame = view.getComponent('previewOuterFrame'),
            button = previewOuterFrame.getDockedItems()[0].getComponent('colorButton'),
            menu = button.getMenu();

        records.forEach(element => {
            console.log('Panel.onColorStoreLoad.records.forEach');
            menu.add({
                text: element.get('name'),
                rgb: element.get('rgb'),
                listeners: {
                    scope: me,
                    click: me.onColorClick
                }
            })
        });

    },
    onClearClick: function () {
        console.log('Panel.onClearClick');
        var me = this,
            view = me.getView(),
            previewFrame = view.getComponent('previewOuterFrame').getComponent('previewFrame'),
            wnd = previewFrame.getEl().dom.querySelector('iframe').contentWindow;
        if (wnd)
            wnd.document.execCommand('removeFormat', false, null);
    },



    onJobStoreBeforeLoad: function (store) {
        console.log('Panel.onJobStoreBeforeLoad');
        let model = this.getViewModel(),
            view = this.getView(),
            listfilter = store.getFilters(),
            listsorters = store.getSorters(),
            filters = [],
            sorters = [],
            extraParams = store.getProxy().getExtraParams();



        listsorters.each(function (item) {
            console.log('Panel.onJobStoreBeforeLoad.sorters.each');
            sorters.push(item.getConfig());
        });
        listfilter.each(function (item) {
            console.log('Panel.onJobStoreBeforeLoad.filters.each');
            filters.push(item.getConfig());
        });
        if (Ext.isEmpty(extraParams)) { extraParams = {}; };



        filters.push({
            property: 'id',
            value: model.get('jobid'),
            operator: 'eq'
        });


        console.log('Filters applied:', filters);

        extraParams.filter = Ext.JSON.encode(filters);
        extraParams.sort = Ext.JSON.encode(sorters);
        store.getProxy().setExtraParams(extraParams);
    },
    onJobStoreLoad: function (store, records) {
        let me = this,
            view = me.getView(),
            model = view.getViewModel();
        console.log('Panel.onJobStoreLoad');
        if (records.length == 0) {
            console.log('No job records found');
            return;
        }
        model.set('job', records[0]);

    },

    openJob: function () {
        let me = this,
            view = me.getView(),
            model = view.getViewModel(),
            job = model.get('job');
        if (job) {
            console.log('Opening job:', job.get('job_number'));
            Ext.getApplication().redirectTo("ds/tualo_job/job_number/" + encodeURIComponent(job.get('job_number')));
        } else {
            console.log('No job to open');
        }
    },

    onTextStoreLoad: function (store, records) {
        console.log('Panel.onTextStoreLoad');
        this.prepareTexts(store, records);
    },

    prepareTexts: async function (store, records) {
        console.log('Panel.prepareTexts');
        let i = 0,
            l = records.length;
        let me = this,
            view = this.getView(),
            model = view.getViewModel(),
            tualo_job = view.getViewModel().getStore('tualo_job'),
            jobRecord = tualo_job.getRange();
        if (Ext.isEmpty(model.get('jobid'))) return;
        if (jobRecord.length == 0) return;

        let templateData = await this.createTemplateData(),
            syncNeeded = false;

        if (records && records.length == 0) {
            console.log('NO Records found:', records);
            // alert('No records found');
        }

        // console.log('onTextStoreLoad',store,records);
        for (i = 0; i < l; i++) {
            let currentText = records[i].get('text');
            let tpl = new Ext.XTemplate(currentText);
            let newText = tpl.apply(templateData);
            //console.log("-----",currentText!=newText,currentText,newText);
            if (currentText != newText) {
                records[i].set('text', newText);
                syncNeeded = true;
            }
        }
        if (syncNeeded) {
            store.sync();
        }
    },

    onBrieffusstextspaltenStoreLoad: function (store, records) {
        console.log('Panel.onBrieffusstextspaltenStoreLoad');
        console.log('Brieffusstextspalten Store Loaded:', records);
    },

    createTemplateData: async function () {
        console.log('Panel.createTemplateData');
        let me = this,
            view = this.getView(),
            tualo_job = view.getViewModel().getStore('tualo_job'),
            briefanreden = view.getViewModel().getStore('briefanreden'),
            jobRecord = tualo_job.getRange()[0],
            jobData = await this.queryJobData(jobRecord.get('__id')),
            contactData = await this.queryContact(jobRecord.get('primary_contact')),
            templateData = {};


        me.getViewModel().set('jobData', jobData);



        templateData.job_name = jobRecord.get('job_name');
        templateData.order_date = Ext.util.Format.deDate(jobRecord.get('order_date'));
        templateData.delivery_date = Ext.util.Format.deDate(jobRecord.get('delivery_date'));
        templateData.briefanrede = 'Sehr geehrte Damen und Herren';


        if (!Ext.isEmpty(contactData)) {
            let br = briefanreden.findRecord('id', contactData[0].briefanrede, 0, false, true, true);
            if (!Ext.isEmpty(br)) {
                templateData.briefanrede = br.get('name') + ' ' + contactData[0].nachname;
            }
        }


        let dataTable = ['<table>'];
        jobData.forEach((item) => {
            console.log('Panel.createTemplateData.jobData.forEach');

            dataTable.push('<tr><td>' + item.name + '</td><td>' + item.value + '</td></tr>');

        });
        dataTable.push('</table>');
        templateData.job_data = dataTable.join('');


        // templateData.job_name = jobRecord.get('job_name');
        return templateData;

    },

    queryJobData: async function (id) {
        console.log('Panel.queryJobData');
        const formData = new FormData();
        let filter = [{ "property": "job_id", "value": id, "operator": "eq" } /*,{"property":"show_in_offer","value":1,"operator":"eq"}*/];
        let sorter = [{ "property": "position", "direction": "asc" }];
        formData.append("filter", JSON.stringify(filter));
        formData.append("sorter", JSON.stringify(sorter));

        let fd = {
            reference: JSON.stringify({ "job_id": id }),
            sort: JSON.stringify(sorter),
            limit: 1000
        }
        let params = new URLSearchParams(fd);

        let fetched = await fetch('./ds/tualo_job_data/read?' + params.toString(), {
            method: "GET",
        });
        let json = await fetched.json();
        return json.data;
    },

    queryContact: async function (id) {
        console.log('Panel.queryContact');
        const formData = new FormData();
        let sorter = [{ "property": "name", "direction": "asc" }];

        let fd = {
            reference: JSON.stringify({ "id": id }),
            limit: 1000
        };

        let params = new URLSearchParams(fd);
        let fetched = await fetch('./ds/ansprechpartner/read?' + params.toString(), {
            method: "GET",
        });
        let json = await fetched.json();
        return json.data;

    },






    saveOfferReport: async function () {
        console.log('Panel.saveOfferReport');
        let model = this.getViewModel(),
            view = this.getView(),
            reporttype = model.get('reportType');

        let res = await fetch('./report/' + reporttype + '/-1', {
            method: 'PUT',
            body: JSON.stringify(this.getReport(true))
        });

        res = await res.json();


        if (res.success !== true) {
            Ext.toast({
                html: res.msg,
                title: 'Fehler',
                align: 't',
                iconCls: 'fa fa-warning'
            });
        } else {
            Ext.getApplication().redirectTo('ds/tualo_job/id/' + model.get('jobid'));
        }
    }

});