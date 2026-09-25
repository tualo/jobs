Ext.define('Tualo.jobs.data.field.NettoFormel', {
    extend: 'Ext.data.field.Number',
    alias: [
        'data.field.tualo_jobs_net_formula'
    ],
    depends: [
        'anzahl'
    ],
    critical: true,
    persist: true,
    queriedList: {},

    formel: 'if(use_real_amount=1, ist_anzahl*epreis, anzahl*epreis)',
    convert: function (currentValue, record) {
        let me = this;

        if (typeof me._math === 'undefined') {
            me._math = new Tualo.tualojs.Math();
        }
        me._math.addRecord(record);
        try {
            if (typeof record.isNonData === 'boolean' && record.isNonData === true) return currentValue;
            return me._math.parse(me.formel);
        } catch (e) {
            console.error(e);
            return currentValue;
        }
    }
});