Ext.define('Tualo.jobs.lazy.v2.mixins.DataChange', {
    onDataDataChanged: function () {
        console.log('Panel.onDataDataChanged');
        /*
        localRecord.singleprice = localRecord.epreis;
        localRecord.net = localRecord.epreis * localRecord.amount;
        localRecord.tax = localRecord.steuersatz;
        localRecord.taxvalue = localRecord.steuersatz / 100 * localRecord.net;
        localRecord.gross = localRecord.net + localRecord.taxvalue;


        */
        // this.updatePreviewFrame();
        // Änderungen prüfen und ggf. Vorschau aktualisieren
    },
});