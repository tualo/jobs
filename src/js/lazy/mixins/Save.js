Ext.define('Tualo.jobs.lazy.mixins.Save', {
    onSave: function () {
        let model = this.getViewModel(),
            view = this.getView(),
            previewFrame = view.getComponent('previewOuterFrame').getComponent('previewFrame');
        grid = view.getComponent('westPanel').getComponent('calculationGrid'),
            selection = grid.getSelectionModel().getSelection(),
            iframe = previewFrame.getEl().dom.firstChild,
            iframeDocument = iframe.contentWindow.document,
            tualo_job_offer_text = model.getStore('tualo_job_offer_text'),
            data = model.getStore('data'),
            blg_pos_calculation = model.getStore('blg_pos_calculation'),
            calcPositions = grid.getStore().getRange();
        report = this.getReport();



        grid.getStore().sync();
        /*
        calcPositions.forEach((record) => {
            let reportPosition = record.data;
            let r = data.findRecord('id', reportPosition.id, 0, false, true, true);
            let fn = async function () {
                let response = await fetch('./ds/blg_pos_calculation/update', {
                    method: 'POST',
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        __table_name: 'blg_pos_calculation',
                        __id: reportPosition.id,
                        id: reportPosition.id,
                        use_in_offer: r.get('use_row'),
                        gruppierung: r.get('gruppierung'),
                        leistungsbeschreibung: record.get('leistungsbeschreibung'),
                        pos_text: record.get('pos_text'),
                        pos: record.get('position'),
                        teilueberschrift: record.get('teilueberschrift'),
                        gruppenpreis_netto: record.get('gruppenpreis_netto'),
                        gruppenpreis_brutto: record.get('gruppenpreis_brutto')
                    })
                });
                let jsonData = await response.json();
                if (jsonData.success !== true) {
                    Ext.toast({
                        html: jsonData.msg,
                        title: 'Fehler',
                        width: 400,
                        align: 't'
                    });
                }

                record.commit();
            }
            fn();

        })
        */

        tualo_job_offer_text.getRange().forEach((tualo_job_offer_text_record) => {
            let elm = iframeDocument.getElementById(tualo_job_offer_text_record.id);
            if (elm) {
                console.log('elm', elm.innerHTML);
                let fn = async function () {
                    let response = await fetch('./ds/tualo_job_offer_text/update', {
                        method: 'POST',
                        headers: {
                            "Accept": "application/json",
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            __table_name: 'tualo_job_offer_text',
                            __id: tualo_job_offer_text_record.id,
                            id: tualo_job_offer_text_record.id,
                            text: elm.innerHTML
                        })
                    });
                    let jsonData = await response.json();
                    if (jsonData.success !== true) {
                        Ext.toast({
                            html: jsonData.msg,
                            title: 'Fehler',
                            width: 400,
                            align: 't'
                        });
                    }
                }
                fn();
            }
        })


        // this.refreshBlgPosCalculation();

        //blg_pos_calculation.sync();


    }
});