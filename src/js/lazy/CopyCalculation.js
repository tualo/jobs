Ext.define('Tualo.jobs.lazy.CopyCalculation', {
    /*** */
    extend: 'Ext.panel.Panel',
    alias: 'widget.tualo_jobs_copy_calculation',

    requires: [
        'Tualo.jobs.lazy.controller.CopyCalculation',
        'Tualo.jobs.lazy.models.CopyCalculation'
    ],
    layout: {
        type: 'card',
    },

    config: {
        calculationId: null
    },
    bind: {
        title: '{title}'
    },
    controller: 'tualo_jobs_copy_calculation',
    viewModel: {
        type: 'tualo_jobs_copy_calculation'
    },
    listeners: {
        boxready: 'onBoxReady'
    },

    setCalculationId: function (val) {
        console.log('setCalculationId called with:', val);
        this.getController().setCalculationId(val);
        return val;
    },

    bbar: [{
        itemId: 'card-cancle',
        text: 'Abbrechen',
        handler: function () {
            Ext.History.back()
        },
        disabled: false
    }, '->',
    {
        itemId: 'card-prev',
        text: '&laquo; Zurück',
        handler: 'showPrevious',
        disabled: true
    },
    {
        itemId: 'card-next',
        text: 'Weiter &raquo;',
        handler: 'showNext'
    }
    ],

    items: [
        {
            xtype: 'panel',
            layout: {
                type: 'vbox',
                align: 'center'
            },

            itemId: 'copy-source',
            items: [
                {
                    xtype: 'component',
                    cls: 'lds-container-compact',

                    html: '<div style="margin-top: 1rem;margin-bottom: 2rem;"><i class="fa-solid fa-copy" style="font-size: 4rem;"></i>'
                        + '<div><h3>Kalkulation-Kopieren</h3>'
                        + '<span>Suchen Sie eine Kalkulation aus, die Sie kopieren möchten.</span></div></div>'
                },

                {
                    formLabel: 'Job',
                    xtype: 'combobox_view_copy_calculation_dd_id',
                    store: {
                        type: 'view_copy_calculation_dd_store',
                        autoLoad: true
                    },
                    placeHolder: 'Wählen Sie einen Quell-Job aus',
                    minWidth: 300,
                    itemId: 'combobox_view_copy_calculation_dd',
                    bind: {
                        value: '{calculationId}'
                    }
                },
            ]
        },
        {
            xtype: 'panel',
            layout: {
                type: 'vbox',
                align: 'center'
            },
            itemId: 'copy-options',


            items: [

                {
                    xtype: 'component',
                    cls: 'lds-container-compact',

                    html: '<div style="margin-top: 1rem;margin-bottom: 2rem;"><i class="fa-solid fa-copy" style="font-size: 4rem;"></i>'
                        + '<div><h3>Kalkulation-Kopieren</h3>'
                        + '<span>Wählen Sie die Daten aus, die Sie kopieren möchten.</span></div></div>'
                },
                {
                    xtype: 'panel',
                    itemId: 'copy-options2',
                    layout: {
                        type: 'vbox',
                        align: 'start'
                    },
                    items: [
                        {
                            itemId: 'copy-options3',
                            xtype: 'form',
                            items: [
                                {
                                    itemId: 'combobox_view_copy_job_dd_id',
                                    fieldLabel: 'Ziel-Job',
                                    xtype: 'combobox_view_copy_job_dd_id',
                                    placeHolder: 'Wählen Sie einen Ziel-Job aus',
                                    minWidth: 300,

                                }
                            ]
                        }

                    ]
                }
            ]
        },
        {
            xtype: 'panel',
            layout: {
                type: 'vbox',
                align: 'center'
            },
            itemId: 'copy-state',


            items: [

                {
                    xtype: 'component',
                    cls: 'lds-container-compact',

                    html: '<div style="margin-top: 1rem;margin-bottom: 2rem;"><i class="fa-solid fa-copy" style="font-size: 4rem;"></i>'
                        + '<div><h3>Kalkulation-Kopieren</h3>'
                        + '<span>Kopie läuft ...</span></div></div>'
                }
            ]
        }
    ]
});