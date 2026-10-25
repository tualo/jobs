
Ext.define('Tualo.jobs.lazy.v2.mixins.GruppenPreise', {
    gruppenPreise: function () {
        console.log('Panel.gruppenPreise');
        let model = this.getViewModel(),
            store = model.getStore('data'),
            range = store.getRange(),
            reporttype = model.get('reportType'),
            gruppierungen = {};


        for (let i = 0; i < range.length; i++) {
            let record = range[i];
            if (record.get('use_in_offer') != 1) continue;
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
            if (record.get('use_in_offer') != 1) continue;
            record.set('gruppenpreis_netto', gruppierungen['k' + record.get('gruppierung')].netto);
            record.set('gruppenpreis_brutto', gruppierungen['k' + record.get('gruppierung')].brutto);
        }
        console.log('gruppenPreise', gruppierungen);
    },
});