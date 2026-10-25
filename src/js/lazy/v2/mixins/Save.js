Ext.define('Tualo.jobs.lazy.v2.mixins.Save', {
    onSave: async function () {
        let model = this.getViewModel(),
            view = this.getView(),
            grid = view.getComponent('westPanel').getComponent('calculationGrid'),
            selection = grid.getSelectionModel().getSelection(),
            previewFrame = this.getView().getComponent('previewOuterFrame').getComponent('previewFrame'),
            iframeDocument = previewFrame.getFrameDocument(),
            texts = model.getStore('texts'),
            data = model.getStore('data'),
            reporttype = model.get('reportType'),
            blg_pos_calculation = model.getStore('blg_pos_calculation'),
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
                    let record = calcStore.getData().getAt(index).getData({
                        persist: true,
                        serialize: true
                    });
                    updateData.push(record);
                }
                console.log('Updating table:', updateData);
                /*
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

Ext.define('Tualo.jobs.lazy.v2.mixins.SaveXYZ', {
    syncVisibleChanges: async function (store) {
        let visibleRecords = new Set(store.getRange()),
            filters = store.getFilters().getRange(),
            matchesFilters = function (record) {
                return filters.every((filter) => {
                    if (filter.getDisabled && filter.getDisabled()) {
                        return true;
                    }
                    let filterFn = filter.getFilterFn();
                    return !filterFn || filterFn(record);
                });
            },
            deferredRecords = new Map(),
            deferredRemoved = [],
            removedRecords = store.getRemovedRecords(),
            syncRemoved = removedRecords.filter(matchesFilters);

        store.getNewRecords().concat(store.getUpdatedRecords()).forEach((record) => {
            if (!visibleRecords.has(record)) {
                deferredRecords.set(record, {
                    dirty: record.dirty,
                    phantom: record.phantom
                });
                record.dirty = false;
                record.phantom = false;
            }
        });

        deferredRemoved.push(...removedRecords.filter((record) => !syncRemoved.includes(record)));
        store.removed = syncRemoved;

        try {
            await new Promise((resolve) => {
                store.sync({
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
        } finally {
            deferredRecords.forEach((state, record) => {
                record.dirty = state.dirty;
                record.phantom = state.phantom;
            });

            let remainingRemoved = store.getRemovedRecords();
            store.removed = remainingRemoved.concat(
                deferredRemoved.filter((record) => !remainingRemoved.includes(record))
            );
        }
    },

    onSave: async function () {

        let model = this.getViewModel(),
            view = this.getView(),
            grid = view.getComponent('westPanel').getComponent('calculationGrid'),
            selection = grid.getSelectionModel().getSelection(),
            previewFrame = this.getView().getComponent('previewOuterFrame').getComponent('previewFrame'),
            iframeDocument = previewFrame.getFrameDocument(),
            texts = model.getStore('texts'),
            data = model.getStore('data'),
            reporttype = model.get('reportType'),
            blg_pos_calculation = model.getStore('blg_pos_calculation'),
            calcPositions = grid.getStore().getRange();


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

                // Nur aktuell sichtbare Änderungen synchronisieren.
                await this.syncVisibleChanges(calcStore);
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