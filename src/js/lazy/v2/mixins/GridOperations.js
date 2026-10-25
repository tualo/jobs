

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
                    sumUse += record.get('gruppenpreis_netto');
                    epreis = record.get('epreis');
                    total_amount += record.get('anzahl');


                }
            });
            records.forEach((record) => {
                console.log('Panel.updateSelectionData.records.forEach');
                selectedSum += record.get('gruppenpreis_netto');
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

});
