

Ext.define('Tualo.jobs.lazy.v2.mixins.GridOperations', {
    onGrouping: function () {
        console.log('Panel.onGrouping');
        let me = this,
            model = me.getViewModel(),
            view = me.getView(),
            grid = view.getComponent('westPanel').getComponent('calculationGrid'),
            selection = grid.getSelectionModel().getSelection(),
            grouingId = (new Date()).getTime();

        if (!model.get('mixedGrouping')) {
            selection.forEach((record) => {
                record.set('gruppierung', (new Date()).getTime());
            });
        } else {

            selection.forEach((record) => {
                console.log('Panel.onUseRow.selection.forEach');
                record.set('gruppierung', grouingId);
                record.set('use_in_offer', 1);
                if (model.get('renderedTemplate') != '') {
                    let text = model.get('renderedTemplate');
                    record.set('leistungsbeschreibung', text);
                }
                console.log('onUseRow record', record);
                record.set('gruppenmenge', model.get('selectedMenge'));
            });
        }

        // me.gruppenPreise();

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
        let groups = {};
        records.forEach((record) => {
            let groupId = record.get('gruppierung');
            if (!groups[groupId]) {
                groups[groupId] = [];
            }
            groups[groupId].push(record);
        });
        if (Object.keys(groups).length > 1) {
            model.set('mixedGrouping', true);
        } else {
            model.set('mixedGrouping', false);
        }

        //mixedGrouping
        this.updateSelectionData();
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

});
