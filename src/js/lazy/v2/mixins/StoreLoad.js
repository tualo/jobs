Ext.define('Tualo.jobs.lazy.v2.mixins.StoreLoad', {
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
        // this.loadAddress();

        return true;

    },

    onDataStoreLoad: function (store, records, successful, operation, eOpts) {
        console.log('Panel.onDataStoreLoad');
        let me = this,
            model = me.getViewModel(),
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

        // this.documentNames(records);
        // this.gruppenPreise();
        // this.updateSelectionData();
        me.checkedInitialRendering();
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
    onTextStoreLoad: function (store, records) {
        console.log('Panel.onTextStoreLoad');
        let me = this;
        me.checkedInitialRendering();
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
        me.checkedInitialRendering();

    },
});