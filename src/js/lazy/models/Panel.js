Ext.define('Tualo.jobs.lazy.models.Panel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.tualo_jobs_panel',
    data: {
        jobid: null,
        reportType: null,
        url: 'about:blank',
        record: null,
        total_net: 0,
        total_amount: 0,
        hasRecord: false,
        selectedRows: 0,
        selectedLeistungsbeschreibung: '',
        selectedTemplate: 'default',
        renderedTemplate: '',
        selectedAggregation: 'sum',
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
            if (get('reportType') == 'rechnung') return "Rechnung";
            return '<unbekannt>';
        },
        title: function (get) {
            if (get('reportType') == 'angebot') return "Kalkulation zu Angebot";
            if (get('reportType') == 'rechnung') return "Kalkulation zu Rechnung";
            return '<unbekannt>';
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
            autoLoad: true,
            autoSync: false,
            pageSize: 100000
        },

        templates: {
            type: 'blg_config_position_templates_store',
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
            autoLoad: false,
            autoSync: false,
            pageSize: 100000,
            listeners: {
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
            autoLoad: true
        },

        tualo_allowed_document_colors_rgb: {
            type: 'tualo_allowed_document_colors_rgb_store',
            autoLoad: true,
            listeners: {
                load: 'onColorStoreLoad'
            }

        },

        data: {
            type: 'view_job_calculation_to_report_store',
            autoLoad: true,
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
            autoLoad: true,
            autoSync: false,
            pageSize: 100000,
            listeners: {
                beforeload: 'onJobStoreBeforeLoad',
            }
        },
        briefanreden: {
            type: 'briefanreden_store',
            pageSize: 10000,
            autoLoad: true
        }
    }
});