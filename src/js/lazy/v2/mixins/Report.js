Ext.define('Tualo.jobs.lazy.v2.mixins.Report', {
    getReport: function (forSaving) {
        console.log('Report.getReport', forSaving);
        let me = this,
            model = me.getViewModel(),
            view = me.getView(),
            total_amount = 0,
            epreis = 0,
            store = model.getStore('data'),
            artikelgruppen = model.getStore('artikelgruppen'),
            texts = model.get('reportType') == 'angebot' ? model.getStore('tualo_job_offer_text') : model.getStore('tualo_job_invoice_text'),
            job = model.get('job'),
            reportTemplate = model.get('reportTemplate'),
            range = store.getData().items,
            positions = [],
            sumUse = 0,
            rowNumber = 1,
            service_period_start = (new Date()),
            service_period_stop = (new Date('2000-01-01')),
            taxes_Hash = {};



        me.gruppenPreise();

        range.forEach((record) => {
            let localRecord = { ...record.data };
            console.log(record.get('use_in_offer'))
            if (record.get('use_in_offer') == 0) return;

            localRecord.amount = localRecord.anzahl;
            if (localRecord.use_real_amount) {
                localRecord.amount = localRecord.ist_anzahl;
            }

            if (record.get('service_period_start')) {
                if (service_period_start > new Date(record.get('zeitraum_von'))) {
                    service_period_start = new Date(record.get('zeitraum_von'));
                }
            }
            if (record.get('zeitraum_bis')) {
                if (service_period_stop < new Date(record.get('zeitraum_bis'))) {
                    service_period_stop = new Date(record.get('zeitraum_bis'));
                }
            }


            localRecord.singleprice = localRecord.epreis;
            localRecord.net = localRecord.epreis * localRecord.amount;
            localRecord.tax = localRecord.steuersatz;
            localRecord.taxvalue = localRecord.steuersatz / 100 * localRecord.net;
            localRecord.gross = localRecord.net + localRecord.taxvalue;

            if (forSaving == true) {
                localRecord.article = localRecord.artikel;



                localRecord.vid = localRecord.id;

                localRecord.vzusatz = 'calculation';
                delete localRecord.__table_name;
                localRecord.id = -1;

                delete localRecord.__id;
            }



            if (localRecord.use_real_amount) {
                localRecord.net = localRecord.ist_netto;
                localRecord.amount = localRecord.amount;
                localRecord.gross = localRecord.ist_brutto;
            }

            localRecord.taxvalue = localRecord.gross - localRecord.net;
            // gegenprüfung, sicherstellen dass taxvalue zum steuersatz passt
            let expectedTaxValue = Math.round(localRecord.net * localRecord.tax * 100) / 100;
            if (Math.abs(localRecord.taxvalue - expectedTaxValue) > 0.01) {
                console.warn('Tax value mismatch for record:', localRecord);
                /*
                Ext.toast.show({
                    html: 'Tax value mismatch for record: ' + JSON.stringify(localRecord),
                    title: 'Warning',
                    width: 300,
                    align: 't'
                });
                */
            }

            // console.warn('Report record:', localRecord);


            if (Ext.isEmpty(localRecord.pos_text)) {
                localRecord.pos_text = rowNumber;
            }

            positions.push(localRecord);
            rowNumber++;
        });


        positions.forEach((localRecord) => {
            if (localRecord.use_in_offer == 0) return;
            if (typeof taxes_Hash["" + localRecord.steuersatz] === 'undefined') {
                taxes_Hash["" + localRecord.tax] =
                {
                    "category": "S",
                    "type": "VAT",
                    "rate": localRecord.tax,
                    "net": 0,
                    "gross": 0,
                    "tax": 0
                };
            }
            // console.log('Processing tax for record:', localRecord);

            taxes_Hash["" + localRecord.tax].net += localRecord.net;
            taxes_Hash["" + localRecord.tax].gross += localRecord.gross;
            taxes_Hash["" + localRecord.tax].tax += localRecord.taxvalue;



        });

        let texts_array = [];



        texts.getRange().forEach((texts_record) => {
            //if (model.get('reportType') === texts_record.get('reporttype')) {
            let o = {};
            o.text = texts_record.get('text');
            o.typ = texts_record.get('placement');
            o.type = texts_record.get('placement');
            o.id = texts_record.get('id');
            if (forSaving) {
                delete o.id;
            }
            texts_array.push(o);
            //}
        });

        let taxes = [];
        for (let key in taxes_Hash) {
            taxes.push(taxes_Hash[key]);
        }

        me.getViewModel().get('jobData');

        let tualo_job = view.getViewModel().getStore('tualo_job'),
            briefanreden = view.getViewModel().getStore('briefanreden'),
            jobRecord = tualo_job.getRange()[0];

        let report_taxes = [], sum = 0, sum_net = 0;

        if ((model.get('show_total') == 0) && model.get('reportType') != 'rechnung') {
            for (let key in taxes_Hash) {
                sum += taxes_Hash[key].gross;
                sum_net += taxes_Hash[key].net;

                /*
                let t = {
                    "cssattr": "tax",
                    "text": "Steuer (" + Tualo.tualojs.Format.Renderer.fullPercentRenderer(taxes_Hash[key].rate) + "):",
                    "wert": Tualo.tualojs.Format.Renderer.euroRenderer(taxes_Hash[key].tax)
                };
                let o = {
                    "cssattr": "totalnet",
                    "text": "Netto (" + Tualo.tualojs.Format.Renderer.fullPercentRenderer(taxes_Hash[key].rate) + "):",
                    "wert": Tualo.tualojs.Format.Renderer.euroRenderer(taxes_Hash[key].net)
                };
                report_taxes.push(t);
                report_taxes.push(o);
                */
            }
            report_taxes.push({
                "cssattr": "totalnet",
                "text": "Gesamt:",
                "wert": Tualo.tualojs.Format.Renderer.euroRenderer(sum_net)
            });
        } else {

            for (let key in taxes_Hash) {
                sum += taxes_Hash[key].gross;
                sum_net += taxes_Hash[key].net;

                let t = {
                    "cssattr": "tax",
                    "text": "Steuer (" + Tualo.tualojs.Format.Renderer.fullPercentRenderer(taxes_Hash[key].rate) + "):",
                    "wert": Tualo.tualojs.Format.Renderer.euroRenderer(taxes_Hash[key].tax)
                };
                let o = {
                    "cssattr": "totalnet",
                    "text": "Netto (" + Tualo.tualojs.Format.Renderer.fullPercentRenderer(taxes_Hash[key].rate) + "):",
                    "wert": Tualo.tualojs.Format.Renderer.euroRenderer(taxes_Hash[key].net)
                };
                report_taxes.push(t);
                report_taxes.push(o);
            }

            report_taxes.push({
                "cssattr": "total",
                "text": "Gesamt:",
                "wert": Tualo.tualojs.Format.Renderer.euroRenderer(sum)
            });
        }

        reportTemplate.show_nettotal = model.get('show_nettotal');
        reportTemplate.show_total = model.get('show_total');
        reportTemplate.show_subtotals = model.get('show_subtotals');

        reportTemplate.bookingdate = Ext.util.Format.date(new Date(), "Y-m-d");
        reportTemplate.date = Ext.util.Format.date(new Date(), "Y-m-d");
        reportTemplate.service_period_stop = Ext.util.Format.date(jobRecord.get('delivery_date'), "Y-m-d");
        reportTemplate.service_period_start = Ext.util.Format.date(jobRecord.get('delivery_date'), "Y-m-d");
        reportTemplate.document_name = model.get('document_name');
        reportTemplate.report_taxes = report_taxes;
        reportTemplate.texts = texts_array;
        reportTemplate.positions = positions;
        reportTemplate.kundennummer = job.get('kundennummer');
        reportTemplate.referencenr = job.get('kundennummer');


        reportTemplate.service_period_start = Ext.util.Format.date(service_period_start, "Y-m-d");
        reportTemplate.service_period_stop = Ext.util.Format.date(service_period_stop, "Y-m-d");

        let zahltage = Number(model.get('customer').get('zahlungsziel'));
        let payUntilDate = new Date();
        payUntilDate.setDate(payUntilDate.getDate() + zahltage);
        reportTemplate.paydays = zahltage;

        reportTemplate.payuntildate =
            Ext.util.Format.date(payUntilDate, "Y-m-d");

        reportTemplate.costcenter = 0;
        delete reportTemplate.id

        reportTemplate.jobid = model.get('jobid');





        return reportTemplate;
    },
});

/*
let reportTemplateX = {

            "show_nettotal": model.get('show_nettotal'),
            "show_total": model.get('show_total'),
            "show_subtotals": model.get('show_subtotals'),

            "bookingdate": Ext.util.Format.date(new Date(), "Y-m-d"),
            "buchungskreis": "0000",

            "currency_link": 1,

            "date": Ext.util.Format.date(new Date(), "Y-m-d"),

            "service_period_stop": Ext.util.Format.date(jobRecord.get('delivery_date'), "Y-m-d"),
            "service_period_start": Ext.util.Format.date(jobRecord.get('delivery_date'), "Y-m-d"),


            "document_name": model.get('document_name'),


            "id": -1,

            "jobid": model.get('jobid'),
            "layout": {
                "positions": [
                    {
                        "table_name": "view_report_blg_pos_calculation",
                        "column_name": "additionaltext",
                        "language": "DE",
                        "label": "additionaltext",
                        "xtype": "gridcolumn",
                        "editor": "",
                        "position": 999,
                        "summaryrenderer": "",
                        "renderer": "",
                        "summarytype": "",
                        "hidden": false,
                        "active": true,
                        "filterstore": "",
                        "grouped": false,
                        "flex": 1,
                        "direction": null,
                        "align": "start",
                        "listfiltertype": "",
                        "hint": "NULL",
                        "width": 0,
                        "config": "{}"
                    }
                ]
            },
            "letzte_zahlung": null,
            "letzte_zahlung_datum": null,
            "login": "thomas.hoffmann@tualo.de",
            "mahnstufe": 0,
            "separeference": null,
            "minderung": 0,
            "net": 2552.72,
            "netto": 2552.72,
            "open": 2552.72,
            "kindofbill": "netto",
            "provision_brutto": 0,
            "provision_netto": 0,
            "reference": "",
            "skonto_brutto": 0,
            "skonto_netto": 0,
            "sperre": 0,
            "steuer": 0,
            "taxid": null,
            "reporttype": model.get('reportType'),
            "vertriebsweg": null,
            "warehouse": 0,
            "paytype": "bar",
            "zbeleg": null,
            "zbeleg_zusatz": null,
            "zurueck": 0,
            "address": model.get('address'),
            "companycode": "0000",
            "referencenr": model.get('kundennummer'),
            "costcenter": 0,
            "positions": positions,
            "payments": [],
            "reductions": [],
            "signum": [],
            "texts": texts_array,
            "locks": [],
            "tax_registration": [],
            "seller_information": [],
            "buyer_information": {
                "city": "",
                "line1": "",
                "line2": "",
                "line3": "",
                "postcode": ""
            },
            "seller_global_ids": [],
            "taxes": taxes,
            "report_footer": [

                {
                    "spalte": "01",
                    "name": "SP1",
                    "zeilen": [
                        {
                            "wert": "WVD Dialog Marketing GmbH",
                            "position": 0,
                            "start_am": "2026-02-26",
                            "ende_am": "2099-12-31",
                            "buchungskreis_id": "0000"
                        },
                        {
                            "wert": "Kauffahrtei 25, Haus 2",
                            "position": 1,
                            "start_am": "2026-02-26",
                            "ende_am": "2099-12-31",
                            "buchungskreis_id": "0000"
                        },
                        {
                            "wert": "09120 Chemnitz",
                            "position": 2,
                            "start_am": "2026-02-26",
                            "ende_am": "2099-12-31",
                            "buchungskreis_id": "0000"
                        }
                    ]
                },
                {
                    "spalte": "02",
                    "name": "SP2",
                    "zeilen": [
                        {
                            "wert": "Geschäftsführung",
                            "position": 3,
                            "start_am": "2026-02-26",
                            "ende_am": "2099-12-31",
                            "buchungskreis_id": "0000"
                        },
                        {
                            "wert": "Kathrin Matthes",
                            "position": 4,
                            "start_am": "2026-02-26",
                            "ende_am": "2099-12-31",
                            "buchungskreis_id": "0000"
                        },
                        {
                            "wert": "Björn Reißig",
                            "position": 5,
                            "start_am": "2026-02-26",
                            "ende_am": "2099-12-31",
                            "buchungskreis_id": "0000"
                        }
                    ]
                },
                {
                    "spalte": "03",
                    "name": "SP3",
                    "zeilen": [
                        {
                            "wert": "Register-Nr. / USt-IdNr./ W-IdNr.",
                            "position": 6,
                            "start_am": "2026-02-26",
                            "ende_am": "2099-12-31",
                            "buchungskreis_id": "0000"
                        },
                        {
                            "wert": "Chemnitz HRB 6502",
                            "position": 7,
                            "start_am": "2026-02-26",
                            "ende_am": "2099-12-31",
                            "buchungskreis_id": "0000"
                        },
                        {
                            "wert": "USt-ID-Nummer: DE811177434",
                            "position": 8,
                            "start_am": "2026-02-26",
                            "ende_am": "2099-12-31",
                            "buchungskreis_id": "0000"
                        },
                        {
                            "wert": "Wirtschafts- Identifikationsnummer: DE811177434-00001",
                            "position": 9,
                            "start_am": "2026-02-26",
                            "ende_am": "2099-12-31",
                            "buchungskreis_id": "0000"
                        }
                    ]
                },
                {
                    "spalte": "04",
                    "name": "SP4",
                    "zeilen": [{ "wert": "Sparkasse Chemnitz", "position": 10, "start_am": "2026-10-21", "ende_am": "2099-12-31", "buchungskreis_id": "0000" }, { "wert": "BIC-Code: CHEKDE81", "position": 11, "start_am": "2026-10-21", "ende_am": "2099-12-31", "buchungskreis_id": "0000" }, { "wert": "IBAN: DE29 8705 0000 3140 0127", "position": 12, "start_am": "2026-10-21", "ende_am": "2099-12-31", "buchungskreis_id": "0000" }]
                }
            ],
            "report_title": "Vorschau",
            "report_taxes": report_taxes,
            "report_images": [],
            "offen": 2552.72,
            "sender_address": false
        };
*/