Ext.define('Tualo.jobs.lazy.models.Panel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.tualo_jobs_panel',
    data: {
        jobid: null,
        reportType: null,
        url: 'about:blank',
        job: null,
        record: null,
        total_net: 0,
        total_amount: 0,
        hasRecord: false,
        selectedRows: 0,
        selectedLeistungsbeschreibung: '',
        selectedTemplate: 'default',
        canSaveReport: false,
        renderedTemplate: '',
        selectedAggregation: 'sum',
        document_name: '',
        document_name_filter: '',
        selectedSum: 0,
        selectedMenge: 1,
        show_nettotal: 1,
        show_total: 0,
        show_subtotals: 1,
        address: ''
    },
    formulas: {
        name: function (get) {
            if (get('reportType') == 'angebot') return "Angebot";
            if (get('reportType') == 'rechnung') return "Rechnung*";
            return '<unbekannt>';
        },
        title: function (get) {
            let txt = 'unbekannt';
            if (get('reportType') == 'angebot') txt = "Kalkulation zu Angebot";
            if (get('reportType') == 'rechnung') txt = "Kalkulation zu Rechnung";
            if (!Ext.isEmpty(get('job'))) {
                txt += " " + get('job').get('job_number');
            }
            return txt;
        },
        canEdit: function (get) {
            return get('hasRecord') !== false;
        },
        template: function (get) {
            return "23782367n asjdhfhhjwed:  <b>" + Ext.util.Format.deValueRenderer(get('total_amount')) + " à " + Ext.util.Format.deValueRenderer(get('epreis')) + "</b>";
        },
        total_sum_html: function (get) {
            return "gewählte Summe: <b>" + Ext.util.Format.deColoredMoneyRenderer(get('selectedSum')) + "</b><br>"
                + "gesamt Summe: <b>" + Ext.util.Format.deColoredMoneyRenderer(get('total_net')) + "</b><br>";
        },
        iframeURL: function (get) {
            return get('url');
        },
        disableForm: function (get) {
            return get('selectedRows') == 0;
        },
        disableSaveOfferReport: function (get) {
            return get('canSaveReport') === false;
        },
        saveButtonText: function (get) {
            return get('reportType') == 'angebot' ? 'Angebot erstellen' : 'Rechnung erstellen';
        }
    },
    stores: {
        time_mat_entry: {
            type: 'view_staff_time_mat_entry_store',
            autoLoad: false,
            autoSync: false,
            pageSize: 100000
        },
        artikelgruppen: {
            type: 'artikelgruppen_store',
            // ******
            autoLoad: true,
            autoSync: false,
            pageSize: 100000
        },

        templates: {
            type: 'blg_config_position_templates_store',
            // ******
            autoLoad: true,
            autoSync: false,
            pageSize: 100000
        },

        blg_pos_calculation: {
            type: 'blg_pos_calculation_store',
            autoLoad: false,
            autoSync: false,
            pageSize: 100000
        },

        texts: {
            //type: 'tualo_job_offer_text_store',
            type: 'view_job_texts_store',
            // ******
            autoLoad: true,
            autoSync: false,
            pageSize: 100000,
            listeners: {
                beforeload: 'onTextStoreBeforeLoad',
                load: 'onTextStoreLoad',
            }
        },

        view_tualo_job_address: {
            type: 'view_tualo_job_address_store',
            autoLoad: false,
            autoSync: false,
            pageSize: 1,
            listeners: {
                load: 'onAddressStoreLoad',
            }



        },


        view_blg_brieffusstextspalten: {
            type: 'view_blg_brieffusstextspalten_store',
            // ******
            autoLoad: true,
            listeners: {
                load: 'onBrieffusstextspaltenStoreLoad',
            }
        },

        tualo_allowed_document_colors_rgb: {
            type: 'tualo_allowed_document_colors_rgb_store',
            // ******
            autoLoad: true,
            listeners: {
                load: 'onColorStoreLoad'
            }

        },

        document_names: {
            type: 'json',
            fields: ['name', 'id'],
            data: []
        },

        data: {
            type: 'view_job_calculation_to_report_store',
            // ******
            autoLoad: false,
            autoSync: false,
            pageSize: 100000,
            listeners: {
                beforeload: 'onDataStoreBeforeLoad',
                load: 'onDataStoreLoad',
                datachanged: 'onDataDataChanged',
                // update: 'onDataUpdate'
            }
        },

        tualo_job: {
            type: 'tualo_job_store',
            // ******
            autoLoad: true,
            autoSync: false,
            pageSize: 100000,
            listeners: {
                beforeload: 'onJobStoreBeforeLoad',
                load: 'onJobStoreLoad',
            }
        },
        briefanreden: {
            type: 'briefanreden_store',
            pageSize: 10000,
            // ******
            autoLoad: true
        }
    }
});