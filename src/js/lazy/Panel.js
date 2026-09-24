Ext.define('Tualo.jobs.lazy.Panel', {
    /*** */
    extend: 'Ext.panel.Panel',
    alias: 'widget.tualo_jobs_panel',
    title: 'Kalkulation zu Angebot',
    requires: [
        'Tualo.jobs.lazy.controller.Panel',
        'Tualo.jobs.lazy.models.Panel'
    ],
    layout: {
        type: 'border',
        // align: 'stretch'
    },

    config: {
        jobid: null,
        reportType: null
    },
    applyJobid: function (jobid) {
        this.getViewModel().set('jobid', jobid);
    },
    applyReportType: function (reportType) {
        this.getViewModel().set('reportType', reportType);
    },
    controller: 'tualo_jobs_panel',
    viewModel: {
        type: 'tualo_jobs_panel'
    },
    getWindowTitle: function () { return "Kalkulation konvertieren" },
    tools: [
    ],

    bbar: [
        '->',
        {
            text: 'Zurück',
            handler: function () {
                Ext.History.back();
            }
        }
    ],
    items: [

        {
            xtype: 'panel',
            itemId: 'westPanel',
            flex: 2,
            split: true,
            collapsible: true,
            region: 'west',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [
                {
                    flex: 1,
                    itemId: 'calculationGrid',
                    title: 'Kalkulationen',
                    scrollable: true,
                    xtype: 'dslist_view_job_calculation_to_offer',
                    selModel: {
                        type: 'tualomultirowmodel'
                    },
                    /*
                    features: [{
                        ftype: 'grouping',
                        // groupHeaderTpl: 'Subject: {name}',
                        showSummaryRow: true
                    }],
                    */
                    bind: {
                        store: '{data}'
                    },

                    /*
                    viewConfig: {
                        listeners: {
                            drop: 'onDropGrid'
                        }
                    },
                    */

                    listeners: {
                        selectionchange: 'onSelectionchange',
                        drop: 'onDropGrid'
                    }
                },
                {
                    // region: 'south',
                    border: true,
                    layout: {
                        type: 'vbox',
                        // align: 'strech'
                    },
                    items: [
                        {
                            xtype: 'form',
                            layout: {
                                "type": "table",
                                "columns": "4",
                                "tableAttrs": {
                                    "style": {
                                        "width": "100%"
                                    }
                                },
                                "tdAttrs": {
                                    "style": {
                                        "alignContent": "flex-start",
                                        "paddingLeft": "8px",
                                        "paddingRight": "8px"
                                    }
                                }

                            },

                            "defaults": {
                                "labelAlign": "top",
                                // "width": "100%"

                            },
                            // height: 228,

                            items: [
                                {
                                    fieldLabel: 'Template',
                                    xtype: 'combobox_blg_config_position_templates_id',
                                    bind: {
                                        value: '{selectedTemplate}'
                                    },
                                    listeners: {
                                        change: 'updateSelectionData'
                                    }
                                }, {
                                    fieldLabel: 'Leistungsbeschreibung',
                                    xtype: 'textfield',
                                    bind: {
                                        value: '{renderedTemplate}'
                                    }
                                },
                                {

                                    fieldLabel: 'Berechnung',
                                    store: {
                                        type: 'json',
                                        fields: ['id', 'name'],
                                        data: [
                                            { "id": "sum", "name": "Summe" },
                                            { "id": "min", "name": "Minimum" },
                                            { "id": "max", "name": "Maximum" },
                                            { "id": "tmax", "name": "T.Max." }
                                        ]
                                    },
                                    queryMode: 'local',
                                    xtype: 'combobox',
                                    displayField: 'name',
                                    valueField: 'id',
                                    bind: {
                                        value: '{selectedAggregation}'
                                    },
                                    listeners: {
                                        change: 'updateSelectionData'
                                    }
                                },
                                {
                                    fieldLabel: 'Menge',
                                    xtype: 'numberfield',
                                    bind: {
                                        value: '{selectedMenge}'
                                    }
                                }
                            ]/*,
                            buttons:[
                                '->',
                                {
                                    text: 'Speichern',
                                    handler: 'onSave'
                                }
                            ]*/

                        },

                        {
                            xtype: 'form',
                            layout: {
                                "type": "table",
                                "columns": "3",
                                "tableAttrs": {
                                    "style": {
                                        "width": "100%"
                                    }
                                },
                                "tdAttrs": {
                                    "style": {
                                        "alignContent": "flex-start",
                                        "paddingLeft": "8px",
                                        "paddingRight": "8px"
                                    }
                                }

                            },
                            "defaults": {
                                "labelAlign": "top",
                                // labelWidth: 140,
                                //"width": "100%"

                            },

                            items: [
                                {
                                    fieldLabel: 'Zwischensummen',
                                    xtype: 'checkbox',
                                    bind: {
                                        value: '{show_subtotals}'
                                    },
                                    listeners: {
                                        change: 'runCalculation'
                                    }
                                }, {
                                    fieldLabel: 'Nettosumme',
                                    xtype: 'checkbox',
                                    bind: {
                                        value: '{show_nettotal}'
                                    },
                                    listeners: {
                                        change: 'runCalculation'
                                    }
                                }, {
                                    fieldLabel: 'Bruttosumme',
                                    xtype: 'checkbox',
                                    bind: {
                                        value: '{show_total}'
                                    },
                                    listeners: {
                                        change: 'runCalculation'
                                    }
                                },
                                {
                                    xtype: 'panel',

                                    height: 64,
                                    bind: {
                                        html: '{total_sum_html}'
                                    }
                                }
                            ]

                        }

                    ],
                    buttons: [
                        '->',
                        {
                            bind: {
                                disabled: '{disableForm}'
                            },
                            text: 'Als Gruppe verwenden',
                            handler: 'onUseRow'
                        },

                        {
                            text: 'Auffrischen',
                            handler: 'onReload'
                        },
                        {
                            /*
                            bind: {
                                disabled: '{disableForm}'
                            },
                            */
                            text: 'Speichern',
                            handler: 'onSave'
                        }, {
                            bind: {
                                disabled: '{disableForm}',
                                text: '{saveButtonText}'
                            },
                            // text: 'Angebot erstellen',
                            handler: 'saveOfferReport'

                        }
                    ]

                }


            ]
        },
        {
            flex: 2,
            region: 'center',
            xtype: 'panel',
            itemId: 'previewOuterFrame',
            layout: 'fit',
            tbar: [
                {
                    xtype: 'button',
                    // text: 'Vorschau',
                    iconCls: 'fa fa-solid fa-bold',
                    handler: 'onBoldClick'
                },
                {
                    xtype: 'button',
                    // text: 'Vorschau',
                    iconCls: 'fa fa-solid fa-italic',
                    handler: 'onItalicClick'
                },
                {
                    xtype: 'button',
                    iconCls: 'fa fa-paint-roller',
                    itemId: 'colorButton',
                    menu: []
                },
                '-',
                {
                    xtype: 'button',
                    // text: 'Vorschau',
                    iconCls: 'fa fa-duotone fa-solid fa-text-slash',
                    handler: 'onClearClick'
                },
                '->',

                {
                    xtype: 'button',
                    text: 'Vorschau',
                    iconCls: 'fa fa-print',
                    handler: 'onPrintClick'
                }
            ],
            items: [
                {
                    itemId: 'previewFrame',
                    xtype: 'tualoiframe',
                    src: 'about:blank',
                }
            ]
        },




    ]
});
