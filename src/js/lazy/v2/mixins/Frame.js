
Ext.define('Tualo.jobs.lazy.v2.mixins.Frame', {
    frameLoaded: function () {
        console.log('Panel.frameLoaded');
    },
    frameContentChanged: function (event) {
        console.log('Panel.frameContentChanged');
        let me = this,
            elementID = event.srcElement.id,
            model = me.getViewModel(),
            store = model.getStore('data'),
            texts = model.get('reportType') == 'angebot' ? model.getStore('tualo_job_offer_text') : model.getStore('tualo_job_invoice_text'),
            previewFrame = this.getView().getComponent('previewOuterFrame').getComponent('previewFrame'),
            iframeDocument = previewFrame.getStageDocument(),
            parts = elementID.split("_"),
            id = parts.splice(0, 1)[0],
            field = parts.join("_"),
            firstRecord = store.findRecord('id', id, 0, false, false, true);

        let editableElement = event.target || event.srcElement;
        me.lastEditableElement = editableElement.closest
            ? editableElement.closest('.editable')
            : editableElement;

        if ((field == 'leistungsbeschreibung') || (field == 'pos_text')) {
            store.getRange().forEach((record) => {
                console.log('Panel.frameContentChanged.description.forEach');
                if (record.get('use_in_offer') == 0) return;
                if (record.get('gruppierung') == firstRecord.get('gruppierung')) {
                    me.lastFrameUpdate = (new Date()).getTime();
                    record.set(field, event.srcElement.innerHTML);
                }
            });
        }

        if (field == 'teilueberschrift') {
            let oldValue = firstRecord.get(field);
            store.getRange().forEach((record) => {
                console.log('Panel.frameContentChanged.heading.forEach');
                if (record.get('use_in_offer') == 0) return;
                if (record.get(field) == oldValue) {
                    me.lastFrameUpdate = (new Date()).getTime();
                    record.set(field, event.srcElement.innerHTML);
                }
            });
        }

        let list = texts.getRange();
        for (let i = 0; i < list.length; i++) {
            let texts_record = list[i];
            let elm = iframeDocument.getElementById(texts_record.id);
            if (elm) {
                texts_record.set('text', elm.innerHTML);
                /*
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
                }*/
            }
        }
    },
});