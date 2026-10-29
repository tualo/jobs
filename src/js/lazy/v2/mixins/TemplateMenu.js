Ext.define('Tualo.jobs.lazy.v2.mixins.TemplateMenu', {
    onTemplateMenuClick: async function (record) {
        let me = this,
            model = me.getViewModel(),
            action = 'cancel',
            templateText = record.get('text'),
            previewFrame = me.getView()
                .getComponent('previewOuterFrame')
                .getComponent('previewFrame'),
            iframeDocument = previewFrame.getStageDocument(),
            texts = model.get('reportType') == 'angebot' ? model.getStore('tualo_job_offer_text') : model.getStore('tualo_job_invoice_text'),
            texte = texts.getRange(),
            filtered = texte.filter(rec => record.get('placement') == rec.get('placement')),
            maxPosition = texte.reduce((max, rec) => record.get('placement') == rec.get('placement') ? Math.max(max, rec.get('pos') || 0) : max, 0);

        if (!['head', 'foot'].includes(record.get('placement'))) {
            Ext.toast({
                html: 'Der Vorlagentext ist ungültig, Bitte nur Kopf- oder Fußzeilen verwenden.',
                title: 'Fehler',
                align: 't',
                iconCls: 'fa fa-warning'
            });
            return;
        }

        if (filtered.length == 1) {
            action = await me.templateAppendOrReplace();
        } else {
            action = 'no';
        }
        if (action === 'cancel') {
            return;
        }

        console.log('TemplateMenu.onTemplateMenuClick', 'action:', action);
        if (action === 'no') {
            texts.add({
                pos: maxPosition + 1,
                type: record.get('type'),
                placement: record.get('placement'),
                text: templateText,
                used_template_id: record.get('id')
            });
        } else if (action === 'yes') {
            let existingRecord = filtered[0];
            existingRecord.set('text', templateText);
            existingRecord.set('used_template_id', record.get('id'));
        }
        await this.prepareTexts();
        this.renderPreview();


    },
    templateAppendOrReplace: function () {
        return new Promise((resolve, reject) => {

            Ext.Msg.show({
                title: 'Vorlage einfügen',
                message: 'Soll der aktuelle Inhalt ersetzt oder die Vorlage unten angefügt werden?',
                buttons: Ext.Msg.YESNOCANCEL,
                buttonText: {
                    yes: 'Ersetzen',
                    no: 'Anfügen',
                    cancel: 'Abbrechen'
                },
                fn: function (buttonId) {
                    if (buttonId === 'yes') {
                        resolve('yes');
                    } else if (buttonId === 'no') {
                        resolve('no');
                    } else {
                        resolve('cancel');
                    }

                }
            });

        });

    },
});