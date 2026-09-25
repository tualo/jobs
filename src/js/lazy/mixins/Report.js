Ext.define('Tualo.jobs.lazy.mixins.Report', {
    getReport: function (forSaving) {

        let me = this,
            model = me.getViewModel(),
            view = me.getView(),
            total_amount = 0,
            epreis = 0,
            store = model.getStore('data'),
            artikelgruppen = model.getStore('artikelgruppen'),
            texts = model.getStore('texts'),

            range = store.getRange(),
            positions = [],
            sumUse = 0,
            rowNumber = 1;
        taxes_Hash = {};

        range.forEach((record) => {
            let localRecord = { ...record.data };
            if (record.get('use_in_offer') == 0) return;

            localRecord.amount = localRecord.anzahl;
            if (localRecord.use_real_amount) {
                localRecord.amount = localRecord.ist_anzahl;
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




            localRecord.net = localRecord.ist_netto;
            localRecord.amount = localRecord.amount;
            localRecord.gross = localRecord.brutto;


            if (Ext.isEmpty(localRecord.pos_text)) {
                localRecord.pos_text = rowNumber;
            }

            if (typeof taxes_Hash["" + localRecord.steuersatz] === 'undefined') {
                taxes_Hash["" + localRecord.steuersatz] =
                {
                    "category": "S",
                    "type": "VAT",
                    "rate": localRecord.steuersatz,
                    "net": 0,
                    "gross": 0,
                    "tax": 0
                };
            }

            taxes_Hash["" + localRecord.steuersatz].net += localRecord.ist_netto;
            taxes_Hash["" + localRecord.steuersatz].gross += localRecord.brutto;
            taxes_Hash["" + localRecord.steuersatz].tax += localRecord.steuer;


            positions.push(localRecord);
            rowNumber++;
        });

        let texts_array = [];


        texts.getRange().forEach((texts_record) => {
            if (model.get('reportType') === texts_record.get('reporttype')) {
                texts_array.push({
                    text: texts_record.get('text'),
                    typ: texts_record.get('placement')
                })
            }
        });

        let taxes = [];
        for (let key in taxes_Hash) {
            taxes.push(taxes_Hash[key]);
        }

        let reportTemplate = {

            "show_nettotal": model.get('show_nettotal'),
            "show_total": model.get('show_total'),
            "show_subtotals": model.get('show_subtotals'),

            "bookingdate": Ext.util.Format.date(new Date(), "Y-m-d"),
            "buchungskreis": "0000",

            "currency_link": 1,

            "date": Ext.util.Format.date(new Date(), "Y-m-d"),


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
            "service_period_stop": Ext.util.Format.date(new Date(), "Y-m-d"),
            "service_period_start": Ext.util.Format.date(new Date(), "Y-m-d"),
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
                }
            ],
            "report_title": "Vorschau",
            "report_taxes": [
                {
                    "beleg": 47297,
                    "_prio": 200000,
                    "cssattr": "tax",
                    "text": "Steuer (0%):",
                    "wert": "0,00 €",
                    "pos_text": "Steuer (0%):",
                    "pos_wert": "0,00 €"
                },
                {
                    "beleg": 47297,
                    "_prio": 100000,
                    "cssattr": "totalnet",
                    "text": "Netto (0%):",
                    "wert": "2.552,72 €",
                    "pos_text": "Netto (0%, 0,00EUR):",
                    "pos_wert": "2.552,72 €"
                },
                {
                    "beleg": 47297,
                    "_prio": 900000,
                    "cssattr": "total",
                    "text": "Gesamt:",
                    "wert": "2.552,72 €",
                    "pos_text": "Gesamt:",
                    "pos_wert": "2.552,72 €"
                }
            ],
            "report_images": [],
            "offen": 2552.72,
            "sender_address": false
        };



        return reportTemplate;
    },
});