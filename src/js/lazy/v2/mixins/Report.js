Ext.define('Tualo.jobs.lazy.v2.mixins.Report', {
    getSinglePricePrintPrecision: function (price, amount, net) {
        if (!Number.isFinite(price) || !Number.isFinite(Number(amount)) || !Number.isFinite(Number(net))) {
            throw new Error('Die Genauigkeit des Einzelpreises kann nicht ermittelt werden.');
        }

        if (Number(amount) === 0) return 2;

        let targetCents = Math.round(Number(net) * 100);
        if (!Number.isSafeInteger(targetCents)) {
            throw new Error('Der Positionsbetrag ist für die Genauigkeitsprüfung zu groß.');
        }
        for (let precision = 2; precision <= 15; precision++) {
            let displayedPrice = Number(price.toFixed(precision));
            if (Math.round(displayedPrice * Number(amount) * 100) === targetCents) {
                return precision;
            }
        }
        throw new Error('Der Positionsbetrag kann mit bis zu 15 Nachkommastellen nicht dargestellt werden.');
    },

    hasSinglePricePrecisionLoss: function (price) {
        let rounded = Number(price.toFixed(5));
        return Math.abs(price - rounded) > Number.EPSILON * Math.abs(price) * 4;
    },

    getReport: function (forSaving) {
        console.log('Report.getReport', forSaving);
        let me = this,
            model = me.getViewModel(),
            view = me.getView(),
            total_amount = 0,
            epreis = 0,
            store = model.getStore('data'),
            artikelgruppen = model.getStore('artikelgruppen'),
            texts = me.getTextStore(),
            job = model.get('job'),
            reportTemplate = model.get('reportTemplate'),
            range = store.getData().items,
            positions = [],
            sumUse = 0,
            gruppierungen = {},
            service_period_start = (new Date()),
            service_period_stop = (new Date('2000-01-01')),
            taxes_Hash = {};


        if (!reportTemplate) throw new Error('No report template specified');

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

            console.warn('Report record:', localRecord);


            if (Ext.isEmpty(localRecord.pos_text)) {
                localRecord.pos_text = positions.length + 1;
            }

            positions.push(localRecord);
        });

        // guppentest
        positions = [];
        let groupSizes = new Map();
        let groupReferences = Object.create(null);
        range.forEach((record) => {
            if (record.get('use_in_offer') == 0) return;
            let group = record.get('gruppierung');
            groupSizes.set(group, (groupSizes.get(group) || 0) + 1);
            if (!groupReferences[group]) {
                groupReferences[group] = [];
            }
            groupReferences[group].push({ vid: record.get('id'), vzusatz: 'calculation' });
        });

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

            if (gruppierungen[localRecord.gruppierung]) {
                return;
            }
            gruppierungen[localRecord.gruppierung] = true;
            localRecord.vid_references = groupReferences[localRecord.gruppierung];

            let useGroupAmount = !Ext.isEmpty(localRecord.gruppierung) &&
                !Ext.isEmpty(localRecord.gruppenmenge) &&
                !(groupSizes.get(localRecord.gruppierung) === 1 && localRecord.gruppenmenge == 0);
            if (useGroupAmount) {
                localRecord.amount = localRecord.gruppenmenge;
                localRecord.anzahl = localRecord.gruppenmenge;
            }

            let groupUnit = localRecord.gruppenfunktion === 'one' ? 7 : localRecord.gruppeneinheit;
            if (!Ext.isEmpty(groupUnit)) {
                let unit = model.getStore('mengeneinheiten').findRecord('id', groupUnit, 0, false, true, true);
                if (!unit) {
                    let message = 'Mengeneinheit ' + groupUnit + ' wurde nicht gefunden.';
                    Ext.toast({ html: message, title: 'Fehler', align: 't' });
                    throw new Error(message);
                }
                localRecord.einheit = groupUnit;
                localRecord.unit = groupUnit;
                localRecord.einheit_symbol = unit.get('symbol');
                localRecord.einheit_faktor = unit.get('faktor');
            }

            localRecord.singleprice = localRecord.amount == 0 ? 0 : localRecord.gruppenpreis_netto / localRecord.amount;
            localRecord.net = Math.round(localRecord.gruppenpreis_netto * 100) / 100;

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



            if (localRecord.use_real_amount && !useGroupAmount) {
                localRecord.net = localRecord.ist_netto;
                localRecord.amount = localRecord.amount;
                localRecord.gross = localRecord.ist_brutto;
                localRecord.singleprice = localRecord.amount == 0 ? 0 : localRecord.net / localRecord.amount;
            }

            localRecord.singleprice_print_precision = me.getSinglePricePrintPrecision(
                localRecord.singleprice, localRecord.amount, localRecord.net
            );

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
                localRecord.pos_text = positions.length + 1;
            }

            positions.push(localRecord);
        });

        // Zuschlag/Rabatt: je Steuersatz eine Pauschalposition am Belegende ergänzen.
        // Die Spalte "zuschlag" enthält einen prozentualen Wert mit Vorzeichen (20 = 20%).
        let zuschlagHash = {};
        positions.forEach((localRecord) => {
            let zuschlag = Number(localRecord.zuschlag);
            if (!Number.isFinite(zuschlag) || zuschlag === 0) return;
            let key = "" + localRecord.tax;
            if (typeof zuschlagHash[key] === 'undefined') {
                zuschlagHash[key] = {
                    tax: localRecord.tax,
                    value: 0,
                    percents: [],
                    firstRecord: localRecord
                };
            }
            zuschlagHash[key].value += localRecord.net * zuschlag / 100;
            if (zuschlagHash[key].percents.indexOf(zuschlag) === -1) {
                zuschlagHash[key].percents.push(zuschlag);
            }
        });

        for (let key in zuschlagHash) {
            let entry = zuschlagHash[key],
                net = Math.round(entry.value * 100) / 100;
            if (net === 0) continue;

            let unit = model.getStore('mengeneinheiten').findRecord('id', 7, 0, false, true, true);
            if (!unit) {
                let message = 'Mengeneinheit 7 (Pauschale) wurde nicht gefunden.';
                Ext.toast({ html: message, title: 'Fehler', align: 't' });
                throw new Error(message);
            }

            let label = net < 0 ? 'Rabatt' : 'Zuschlag';
            if (entry.percents.length === 1) {
                label += ' ' + Tualo.tualojs.Format.Renderer.fullPercentRenderer(Math.abs(entry.percents[0]));
            }

            let zuschlagRecord = {
                use_in_offer: 1,
                artikel: entry.firstRecord.artikel,
                konto: entry.firstRecord.konto,
                account: entry.firstRecord.account,
                leistungsbeschreibung: label,
                bemerkung: '',
                zusatztext: '',
                anzahl: 1,
                amount: 1,
                gruppierung: (new Date()).getTime() + positions.length,
                gruppenmenge: 1,
                gruppeneinheit: 7,
                gruppenfunktion: 'one',
                gruppenpreis_netto: net,
                einheit: 7,
                unit: 7,
                einheit_symbol: unit.get('symbol'),
                einheit_faktor: unit.get('faktor'),
                singleprice: net,
                epreis: net,
                net: net,
                tax: entry.tax,
                steuersatz: entry.tax,
                zuschlag: 0,
                pos_text: positions.length + 1,
                pos: 999999,
                position: 999999
            };
            zuschlagRecord.taxvalue = Math.round(net * entry.tax) / 100;
            zuschlagRecord.gross = zuschlagRecord.net + zuschlagRecord.taxvalue;
            zuschlagRecord.gruppenpreis_brutto = zuschlagRecord.gross;
            zuschlagRecord.singleprice_print_precision = me.getSinglePricePrintPrecision(
                zuschlagRecord.singleprice, zuschlagRecord.amount, zuschlagRecord.net
            );

            if (forSaving == true) {
                zuschlagRecord.article = zuschlagRecord.artikel;
                zuschlagRecord.vid = entry.firstRecord.vid;
                zuschlagRecord.vzusatz = 'calculation';
                zuschlagRecord.id = -1;
            }

            positions.push(zuschlagRecord);
        }

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
                "_prio": 90000,
                "cssattr": "totalnet",
                "text": "Gesamt:",
                "wert": Tualo.tualojs.Format.Renderer.euroRenderer(sum_net)
            });
        } else {

            for (let key in taxes_Hash) {
                sum += taxes_Hash[key].gross;
                sum_net += taxes_Hash[key].net;

                let t = {
                    "_prio": 10000 + taxes_Hash[key].rate,
                    "cssattr": "tax",
                    "text": "Steuer (" + Tualo.tualojs.Format.Renderer.fullPercentRenderer(taxes_Hash[key].rate) + "):",
                    "wert": Tualo.tualojs.Format.Renderer.euroRenderer(taxes_Hash[key].tax)
                };
                let o = {
                    "_prio": 20000 + taxes_Hash[key].rate,
                    "cssattr": "totalnet",
                    "text": "Netto (" + Tualo.tualojs.Format.Renderer.fullPercentRenderer(taxes_Hash[key].rate) + "):",
                    "wert": Tualo.tualojs.Format.Renderer.euroRenderer(taxes_Hash[key].net)
                };
                report_taxes.push(t);
                report_taxes.push(o);
            }

            report_taxes.push({
                "_prio": 30000,
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

        // reportTemplate.empfaenger = model.get('empfaenger');
        if (model.get('blgConfig').get('adress_bezug') == 'adressen') {
            reportTemplate.kundennummer = job.get('kundennummer');
            reportTemplate.referencenr = job.get('kundennummer');
        } else {
            reportTemplate.kundennummer = model.get('empfaenger').get('referencenr');
            reportTemplate.referencenr = model.get('empfaenger').get('referencenr');
        }


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
