Ext.define('Tualo.jobs.lazy.mixins.Save', {
    onSave: function () {
        let model = this.getViewModel(),
            view = this.getView(),
            previewFrame = view.getComponent('previewOuterFrame').getComponent('previewFrame');
        grid = view.getComponent('westPanel').getComponent('calculationGrid'),
            selection = grid.getSelectionModel().getSelection(),
            iframe = previewFrame.getEl().dom.firstChild,
            iframeDocument = iframe.contentWindow.document,
            texts = model.getStore('texts'),
            data = model.getStore('data'),
            blg_pos_calculation = model.getStore('blg_pos_calculation'),
            calcPositions = grid.getStore().getRange();
        report = this.getReport();



        grid.getStore().sync();


        texts.getRange().forEach((texts_record) => {
            let elm = iframeDocument.getElementById(texts_record.id);
            if (elm) {
                console.log('elm', elm.innerHTML);
                let fn = async function () {
                    let tablename = 'tualo_job_offer_text';
                    if (model.get('reporttype') === 'rechnung') {
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
                fn();
            }
        })



    }
});