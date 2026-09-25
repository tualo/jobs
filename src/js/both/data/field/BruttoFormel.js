Ext.define('Tualo.jobs.data.field.BruttoFormel', {
    extend: 'Ext.data.field.Number',
    alias: [
        'data.field.tualo_jobs_brutto_formula'
    ],
    /*
    depends: [
        'ist_netto'
    ],*/
    critical: true,
    persist: true,
    queriedList: {},

    // formel: 'if((use_real_amount==1), ist_anzahl*epreis, anzahl*epreis)',
    calculate: function (data) {
        return data.netto * (1 + data.steuersatz);
    },
    /*
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
    }*/
});

/*



INSERT IGNORE INTO `custom_types`  
(
        id,
        xtype_long_classic,
        xtype_long_modern,
        extendsxtype_classic,
        extendsxtype_modern,
        name,
        vendor,
        description
) VALUES
(
    'Tualo.jobs.data.field.BruttoFormel',
    'data.field.tualo_jobs_brutto_formula',
    'data.field.tualo_jobs_brutto_formula',
    'Ext.data.field.Number',
    'Ext.data.field.Number',
    'Tualo.jobs.data.field.BruttoFormel',
    'Tualo',
    ''
);
*/