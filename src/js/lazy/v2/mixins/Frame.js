
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
            parts = elementID.split("_"),
            id = parts.splice(0, 1)[0],
            field = parts.join("_"),
            firstRecord = store.findRecord('id', id, 0, false, false, true);

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
    },
});