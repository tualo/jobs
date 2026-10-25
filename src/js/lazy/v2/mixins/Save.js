Ext.define('Tualo.jobs.lazy.v2.mixins.Save', {


    saveReport: async function () {
        console.log('Panel.saveReport');
        let model = this.getViewModel(),
            view = this.getView(),
            reporttype = model.get('reportType');

        let res = await fetch('./report/' + reporttype + '/-1', {
            method: 'PUT',
            body: JSON.stringify(this.getReport(true))
        });

        res = await res.json();


        if (res.success !== true) {
            Ext.toast({
                html: res.msg,
                title: 'Fehler',
                align: 't',
                iconCls: 'fa fa-warning'
            });
        } else {
            Ext.getApplication().redirectTo('ds/tualo_job/id/' + model.get('jobid'));
        }
    },
    onSave: async function () {
        let me = this,
            model = this.getViewModel(),
            view = this.getView(),
            grid = view.getComponent('westPanel').getComponent('calculationGrid'),
            reporttype = model.get('reportType'),
            calcPositions = grid.getStore().getRange();




        console.log('report', 'document_name', model.get('document_name'));

        if (Ext.isEmpty(model.get('document_name'))) {
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
                        me.onSaveGoAhead();
                    }
                },
                false,
                ''
            );
        } else {
            this.onSaveGoAhead();
        }
    },
    onSaveGoAhead: async function () {

        let model = this.getViewModel(),
            view = this.getView(),
            grid = view.getComponent('westPanel').getComponent('calculationGrid'),
            previewFrame = this.getView().getComponent('previewOuterFrame').getComponent('previewFrame'),
            iframeDocument = previewFrame.getFrameDocument(),
            texts = model.getStore('texts'),
            calcStore = grid.getStore(),
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
                    console.log('elm', elm.innerHTML.substring(0, 10));
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


                window.calcStore = calcStore;
                let updateData = [],
                    filtered = calcStore.getData().getCount();

                for (let index = 0; index < filtered; index++) {
                    let rec = calcStore.getData().getAt(index);
                    //if (rec.get('use_in_offer') == 1) {
                    let record = rec.getData({
                        persist: true,
                        serialize: true
                    });
                    console.log('Record to update:', record);
                    updateData.push(record);
                    //}
                }

                console.log('Updating table:', updateData);
                let calc_response = await fetch('./ds/blg_pos_calculation/update', {
                    method: 'POST',
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(updateData)
                });

                let calcJsonData = await calc_response.json();
                if (calcJsonData.success !== true) {
                    Ext.toast({
                        html: calcJsonData.msg,
                        title: 'Fehler',
                        width: 400,
                        align: 't'
                    });
                } else {
                    calcStore.commitChanges();
                }
                /*
                        
    
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
                    */
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
