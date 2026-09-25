Ext.define('Tualo.jobs.data.field.NettoFormel', {
    extend: 'Ext.data.field.Number',
    alias: [
        'data.field.tualo_jobs_net_formula'
    ],
    depends: [
        'use_real_amount'

    ],
    critical: true,
    persist: true,
    queriedList: {},


    convert: function (currentValue, record) {
        let me = this;

        if (typeof me._math === 'undefined') {
            me._math = new Tualo.tualojs.Math();
        }
        me._math.addRecord(record);
        try {
            if (typeof record.isNonData === 'boolean' && record.isNonData === true) return currentValue;
            return (record.get('use_real_amount') == 1 && record.get('reporttype') == 'rechnung') ? record.get('ist_anzahl') * record.get('epreis') : record.get('anzahl') * record.get('epreis');
        } catch (e) {
            console.error(e);
            return currentValue;
        }
    }
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
    'Tualo.jobs.data.field.NettoFormel',
    'data.field.tualo_jobs_net_formula',
    'data.field.tualo_jobs_net_formula',
    'Ext.data.field.Number',
    'Ext.data.field.Number',
    'Tualo.jobs.data.field.NettoFormel',
    'Tualo',
    ''
);
*/