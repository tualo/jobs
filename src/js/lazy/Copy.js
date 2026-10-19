Ext.define('Tualo.jobs.lazy.Copy', {
    /*** */
    extend: 'Ext.panel.Panel',
    alias: 'widget.tualo_jobs_copy',

    requires: [
        'Tualo.jobs.lazy.controller.Copy',
        'Tualo.jobs.lazy.models.Copy'
    ],
    layout: {
        type: 'card',
    },

    config: {
        jobid: null
    },
    bind: {
        title: '{title}'
    },
    controller: 'tualo_jobs_copy',
    viewModel: {
        type: 'tualo_jobs_copy'
    },
    listeners: {
        boxready: 'onBoxReady'
    },

    setJobNumber: function (val) {
        this.getController().setJobNumber(val);
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
                        + '<div><h3>Job-Kopieren</h3>'
                        + '<span>Suchen Sie einen Job aus, den Sie kopieren möchten.</span></div></div>'
                },

                {
                    formLabel: 'Job',
                    xtype: 'combobox_tualo_job_id',
                    placeHolder: 'Wählen Sie einen Quell-Job aus',
                    minWidth: 300,
                    itemId: 'combobox_jobid',
                    bind: {
                        value: '{jobid}'
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
                        + '<div><h3>Job-Kopieren</h3>'
                        + '<span>Wählen Sie die Daten aus, die Sie kopieren möchten. Lassen Sie den Ziel-Job leer, um die Daten in einen neuen Job zu kopieren.</span></div></div>'
                },
                {
                    xtype: 'panel',
                    layout: {
                        type: 'vbox',
                        align: 'start'
                    },
                    items: [


                        /*{
                            formLabel: 'Ziel-Job',
                            xtype: 'combobox_tualo_job_id',
                            placeHolder: 'Wählen Sie einen Job aus',
                            minWidth: 300,
                            bind: {
                                value: '{targetJobId}'
                            }
                        },
                        */
                        {
                            formLabel: 'Ziel-Kunde',
                            xtype: 'combobox_adressen_kundennummer',
                            placeHolder: 'Wählen Sie einen Kunden aus',
                            minWidth: 300,
                            bind: {
                                value: '{kundennummer}'
                            }
                        },
                        {
                            boxLabel: 'Job-Stammdaten kopieren',
                            xtype: 'checkbox',
                            bind: {
                                value: '{copyJobData}'
                            }
                        },
                        {
                            boxLabel: 'technische Daten',
                            xtype: 'checkbox',
                            bind: {
                                value: '{copyTechnicalData}'
                            }
                        }/*,
                        {
                            boxLabel: 'Kalkulation',
                            xtype: 'checkbox',
                            bind: {
                                value: '{copyCalculation}'
                            }
                        }*/
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
                        + '<div><h3>Job-Kopieren</h3>'
                        + '<span>Kopie läuft ...</span></div></div>'
                },
                {
                    xtype: 'panel',
                    layout: {
                        type: 'vbox',
                        align: 'start'
                    },
                    items: [
                        {
                            boxLabel: 'Job-Stammdaten kopieren',
                            xtype: 'checkbox',
                            disabled: true,
                            bind: {
                                value: '{copyJobDataDone}'
                            }
                        },
                        {
                            boxLabel: 'technische Daten',
                            xtype: 'checkbox',
                            disabled: true,
                            bind: {
                                value: '{copyTechnicalDataDone}'
                            }
                        },
                        {
                            boxLabel: 'Kalkulation',
                            xtype: 'checkbox',
                            disabled: true,
                            bind: {
                                value: '{copyCalculationDone}'
                            }
                        }
                    ]
                }
            ]
        }
    ]
});