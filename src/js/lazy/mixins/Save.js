Ext.define('Tualo.jobs.lazy.mixins.Save', {
    onSave: async function () {
        let model = this.getViewModel(),
            view = this.getView(),
            previewFrame = view.getComponent('previewOuterFrame').getComponent('previewFrame');
        let grid = view.getComponent('westPanel').getComponent('calculationGrid'),
            selection = grid.getSelectionModel().getSelection(),
            iframe = previewFrame.getEl().dom.firstChild,
            iframeDocument = iframe.contentWindow.document,
            texts = model.getStore('texts'),
            data = model.getStore('data'),
            reporttype = model.get('reportType'),
            blg_pos_calculation = model.getStore('blg_pos_calculation'),
            calcPositions = grid.getStore().getRange();

        let report = this.getReport();



        console.log('report', 'document_name', model.get('document_name'));

        if (model.get('document_name') == '') {
            Ext.MessageBox.prompt(
                'Dokument-Name',
                'Bitte geben Sie einen Dokumentnamen ein:',
                function (btn, txt) {
                    if (btn == 'ok') {
                        model.set('document_name', txt);
                        calcPositions.forEach((rec) => {
                            console.log('Setting title for record', rec.get('id'), 'to', txt, rec.get('use_in_offer'));
                            if (rec.get('use_in_offer') == 1) {
                                rec.set(reporttype + '_title', txt);
                            }
                        })
                    }
                },
                false,
                ''
            );
        }


        let calcStore = grid.getStore(),
            updatedRecords = calcStore.getUpdatedRecords(),
            changedFields = new Set();

        // union of all changed field names across dirty records
        updatedRecords.forEach((rec) => {
            Object.keys(rec.modified || {}).forEach((field) => changedFields.add(field));
        });

        // force every dirty record to report the same set of changed columns
        updatedRecords.forEach((rec) => {
            changedFields.forEach((field) => {
                if (!(field in rec.modified)) {
                    rec.modified[field] = rec.get(field);
                }
            });
        });



        view.setLoading('Wird gespeichert...');
        try {
            let list = texts.getRange();
            for (let i = 0; i < list.length; i++) {
                let texts_record = list[i];
                console.log('Processing text record', texts_record.id);
                let elm = iframeDocument.getElementById(texts_record.id);
                if (elm) {
                    console.log('elm', elm.innerHTML);
                    let tablename = 'tualo_job_offer_text';
                    if (model.get('reportType') === 'rechnung') {
                        tablename = 'tualo_job_invoice_text';
                    }
                    let response = await fetch('./ds/' + tablename + '/update', {
                        method: 'POST',
                        headers: {
                            "Accept": "application/json",
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            __table_name: tablename,
                            __id: texts_record.id,
                            id: texts_record.id,
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
            }

            if (calcStore.getNewRecords().length ||
                calcStore.getUpdatedRecords().length ||
                calcStore.getRemovedRecords().length) {
                await new Promise((resolve) => {
                    calcStore.sync({
                        success: function () {
                            console.log('Sync successful');
                        },
                        failure: function () {
                            Ext.toast({
                                html: "Fehler beim Synchronisieren",
                                title: 'Fehler',
                                width: 400,
                                align: 't'
                            });
                        },
                        callback: resolve
                    });
                });
            }
        } catch (error) {
            console.error('Fehler beim Speichern', error);
            Ext.toast({
                html: 'Fehler beim Speichern',
                title: 'Fehler',
                width: 400,
                align: 't'
            });
        } finally {
            if (!view.destroyed) {
                view.setLoading(false);
            }
        }

    }
});