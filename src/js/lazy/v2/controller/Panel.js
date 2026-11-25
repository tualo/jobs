Ext.define('Tualo.jobs.lazy.v2.controller.Panel', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.tualo_jobs_panel_v2',
    mixins: [

        'Tualo.jobs.lazy.v2.mixins.Report',
        'Tualo.jobs.lazy.v2.mixins.Save',
        'Tualo.jobs.lazy.v2.mixins.StoreLoad',
        'Tualo.jobs.lazy.v2.mixins.DataChange',
        'Tualo.jobs.lazy.v2.mixins.PrepareText',
        'Tualo.jobs.lazy.v2.mixins.CreateTemplateData',
        'Tualo.jobs.lazy.v2.mixins.GruppenPreise',
        'Tualo.jobs.lazy.v2.mixins.PreviewEditor',
        'Tualo.jobs.lazy.v2.mixins.GridOperations',
        'Tualo.jobs.lazy.v2.mixins.Frame',
        'Tualo.jobs.lazy.v2.mixins.Headline',
        'Tualo.jobs.lazy.v2.mixins.TemplateMenu'

    ],

    onReload: function () {
        console.log('Panel.onReload');

        let model = this.getViewModel(),
            store = model.getStore('data'),
            modifiedRecords = store.getModifiedRecords();

        if (modifiedRecords.length > 0) {
            Ext.Msg.confirm('Änderungen', 'Es gibt ungespeicherte Änderungen. Ohne Speichern fortfahren?', (btn) => {
                if (btn === 'yes') {
                    store.load();
                }
            });
            return;
        } else {
            store.load();
        }


    },
    canSaveReport: async function () {
        console.log('Panel.canSaveReport');
        let model = this.getViewModel();
        let response = await fetch('./jobs/cansave/' + model.get('reportType'));
        let result = await response.json();
        model.set('canSaveReport', result.success);
        return result.success;
    },

    checkCanCreateReport: async function () {
        console.log('Panel.checkCanCreateReport');
        let me = this,
            view = me.getView(),
            model = me.getViewModel(),
            banner = view.getComponent('previewOuterFrame').getDockedComponent('canCreateReportBanner');
        try {
            let response = await fetch('./jobs/cancreatereport/' + model.get('reportType') + '/' + model.get('jobid'));
            let result = await response.json();

            let warnings = Ext.isArray(result.warnings) ? result.warnings : [],
                errors = Ext.isArray(result.errors) ? result.errors : [],
                hasWarnings = (result.hasWarnings == true) || warnings.length > 0,
                hasErrors = errors.length > 0,
                success = result.success == true,
                color = '#2e7d32',
                icon = 'fa-solid fa-circle-check',
                lines = [];

            if (hasErrors) {
                color = '#c62828';
                icon = 'fa-solid fa-circle-exclamation';
            } else if (hasWarnings) {
                color = '#ef6c00';
                icon = 'fa-solid fa-triangle-exclamation';
            }

            errors.forEach((msg) => lines.push(Ext.String.htmlEncode(msg)));
            warnings.forEach((msg) => lines.push(Ext.String.htmlEncode(msg)));
            if (lines.length === 0) {
                lines.push(Ext.String.htmlEncode(result.msg || 'Der Beleg kann erstellt werden.'));
            }

            // success entscheidet, ob der Beleg erstellt werden darf – auch bei vorhandenen Fehlern
            model.set('canCreateReport', success);
            banner.setStyle('background-color', color);
            banner.setHtml('<i class="' + icon + '"></i> ' + lines.join('<br>'));
            banner.show();
            return success;
        } catch (e) {
            console.error('Panel.checkCanCreateReport', e);
            model.set('canCreateReport', true);
            banner.hide();
            return true;
        }
    },

    onChangeDocumentName: function (field, newValue, oldValue) {
        console.log('Panel.onChangeDocumentName');
        let me = this,
            model = me.getViewModel(),
            reporttype = model.get('reportType'),
            store = model.getStore('data');

        if (!store || Ext.isEmpty(newValue)) return;

        store.getRange().forEach((record) => {
            if (record.get('use_in_offer') == 1) {
                record.set(reporttype + '_title', newValue);
            }
        });
    },

    onChangeDocumentNameDD: function (field, newValue, oldValue) {
        console.log('Panel.onChangeDocumentNameDD');
        let me = this,
            model = me.getViewModel(),
            store = model.getStore('data');

        if (!store || Ext.isEmpty(newValue)) return;

        model.set('document_name_filter', newValue);
        store.load();
    },

    loadStore: function (store) {
        return new Promise((resolve, reject) => {
            console.log('loadStore', 'Loading store:', store.type, store);
            store.load({
                callback: (records, operation, success) => {
                    if (success) {
                        console.log('loadStore', 'success:', store.type, store);
                        resolve(records);
                    } else {
                        console.error('loadStore', 'failure:', store.type, store);

                        reject(operation.getError() || new Error('Store konnte nicht geladen werden'));
                    }
                }
            });
        });
    },

    syncStore: function (store) {
        return new Promise((resolve, reject) => {
            console.log('syncStore', 'Syncing store:', store.type, store);
            if (store.needsSync) {
                store.sync({
                    callback: function (batch, options) {
                        if (batch.hasException()) {
                            let exceptions = batch.getExceptions();
                            exceptions.forEach(exception => {
                                Ext.toast({
                                    html: 'Fehler beim Synchronisieren: ' + exception.getError(),
                                    title: 'Fehler',
                                    width: 400,
                                    align: 't'
                                });
                                console.error('syncStore', 'exception:', exception);
                            });
                            console.error('syncStore', 'callback failure:', store.type, store);
                            reject(new Error('Store konnte nicht synchronisiert werden'));
                        } else {

                            console.log('syncStore', 'callback success:', store.type, store);
                            resolve();
                        }
                    },
                    success: function () {
                        console.log('syncStore', 'success:', store.type, store);
                        resolve();
                    },
                    failure: function (batch, options) {
                        console.log('syncStore', 'failure:', store.type, store);
                        reject(new Error('Store konnte nicht synchronisiert werden'));
                    }
                });
            } else {
                resolve();
            }
        });
    },

    onBoxReady: function () {
        let me = this,
            view = me.getView(),
            model = me.getViewModel(),
            dataStore = model.getStore('data');
        console.log('Tualo.jobs.lazy.v2.controller.Panel', 'onBoxReady');
        me.showRealAmountColumns();
        me.fetchInformation();
    },

    showRealAmountColumns: function () {
        console.log('Panel.showRealAmountColumns');
        let model = this.getViewModel();
        window.c = this;
        if (model.get('reportType') === 'rechnung') {
            let grid = this.getView().getComponent('westPanel').getComponent('calculationGrid');
            try {
                grid.columns.forEach(column => {
                    console.log('Panel.showRealAmountColumns.columns.forEach');
                    if (column.dataIndex === 'use_real_amount' || column.dataIndex === 'ist_anzahl') {
                        column.setVisible(true);
                    }
                });
            } catch (e) {
                console.error(e);
            }

        } else {
            let grid = this.getView().getComponent('westPanel').getComponent('calculationGrid');
            try {
                grid.columns.forEach(column => {
                    console.log('Panel.showRealAmountColumns.columns.forEach');
                    if (column.dataIndex === 'use_real_amount' || column.dataIndex === 'ist_anzahl') {
                        column.setVisible(false);
                    }
                });
            } catch (e) {
                console.error(e);
            }
        }
    },

    onCalculationGridBeforeRender: function (grid) {
        grid.headerCt.insert(0, {
            itemId: 'groupColorColumn',
            text: '',
            tooltip: 'Gruppierung',
            dataIndex: 'gruppierung',
            width: 26,
            sortable: false,
            filter: false,
            menuDisabled: true,
            hideable: false,
            resizable: false,
            draggable: false,
            renderer: this.renderGroupColor
        });

        let model = this.getViewModel(),
            filterPlugin = grid.getPlugin('gridfilters');
        /*typenStore = model.getStore('typen');

    if (!filterPlugin) {
        Ext.raise('Grid filter plugin is not available on calculationGrid');
    }
    if (!typenStore) {
        Ext.raise('The typen store is not available in the Panel view model');
    }
    */
        filterPlugin.addFilter({
            dataIndex: 'reporting_type',
            type: 'list',

        });
        filterPlugin.addFilter({
            dataIndex: 'calculation_name',
            type: 'list',

        });
        filterPlugin.addFilter({
            dataIndex: 'kurztext',
            type: 'list'
        });
        filterPlugin.addFilter({
            dataIndex: 'rechnung_title',
            type: 'list'
        });
        filterPlugin.addFilter({
            dataIndex: 'angebot_title',
            type: 'list'
        });
    },
    renderGroupColor: function (value, metaData) {
        if (Ext.isEmpty(value) || value === 0 || value === '0') {
            return '';
        }

        let group = String(value),
            hash = 0;

        for (let index = 0; index < group.length; index++) {
            hash = (Math.imul(hash, 31) + group.charCodeAt(index)) | 0;
        }

        let hue = Math.floor(((hash >>> 0) * 137.508) % 360);
        metaData.tdAttr = 'data-qtip="' + Ext.String.htmlEncode('Gruppe: ' + group) + '"';

        return '<div style="width:8px;height:18px;margin:auto;border-radius:3px;' +
            'background-color:hsl(' + hue + ',45%,82%);' +
            'border:1px solid hsl(' + hue + ',35%,65%)"></div>';
    },
    renderDelay: 200,
    renderTimeout: null,
    renderPreview: function () {
        let me = this,
            view = me.getView(),
            model = me.getViewModel(),
            previewFrame = view.getComponent('previewOuterFrame').getComponent('previewFrame');

        if (me.renderTimeout) {
            clearTimeout(me.renderTimeout);
        }
        me.renderTimeout = setTimeout(() => {
            let report = me.getReport();
            console.log('Rendering report:', report);
            if (report) {
                //let oldScroll = me.getScrollPosition();
                previewFrame.setData({ report: report });
                //me.scrollPosition(oldScroll);
            } else {
                console.error('No report template available for rendering');
            }
        }, me.renderDelay);


    },
    getScrollPosition: function () {
        let me = this,
            view = me.getView(),
            previewFrame = view.getComponent('previewOuterFrame').getComponent('previewFrame');

        return {
            x: previewFrame.getEl().dom.querySelector('iframe').contentWindow.scrollX,
            y: previewFrame.getEl().dom.querySelector('iframe').contentWindow.scrollY
        };
    },
    scrollPosition: function (old) {
        let me = this,
            view = me.getView(),
            previewFrame = view.getComponent('previewOuterFrame').getComponent('previewFrame');

        previewFrame.getEl().dom.querySelector('iframe').contentWindow.scrollBy(old.x, old.y);
    },
    fetchInformation: async function () {
        let me = this,
            view = me.getView(),
            model = me.getViewModel();

        console.log('fetchInformation', 'Fetching information');
        await me.canSaveReport();
        await me.loadStore(model.getStore('tualo_job'));

        await me.queryAddress();
        await me.queryReportTemplate();
        await Promise.all([
            /*
            me.queryAddress(),
            me.canSaveReport(),
            */
            me.checkCanCreateReport(),
            me.loadStore(model.getStore('adressen')),
            me.loadStore(model.getStore('document_names')),
            me.loadStore(model.getStore('tualo_allowed_document_colors_rgb')),
            me.loadStore(model.getStore('briefanreden')),
            me.loadStore(model.getStore('tualo_job_offer_text')),
            me.loadStore(model.getStore('tualo_job_invoice_text')),
            me.loadStore(model.getStore('tualo_job_text_templates')),
            Promise.all([
                me.loadStore(model.getStore('templates')),
                me.loadStore(model.getStore('mengeneinheiten'))
            ]).then(() => me.loadStore(model.getStore('data'))),

        ]);
        me.onTextTemplatesLoad(model.getStore('tualo_job_text_templates').getRange());
        await me.loadStore(model.getStore('adressen'));
        await me.prepareTexts();

        let report = model.get('reportTemplate');
        report.address = model.get('address');
        model.set('reportTemplate', report);
        me.renderPreview();
        console.log('fetchInformation', 'Fetching done', model.get('reportTemplate'));
    },
    onTextTemplatesLoad: function (records) {
        let me = this,
            previewOuterFrame = me.getView().getComponent('previewOuterFrame'),
            menu = previewOuterFrame.down('#templateButton')
                .getMenu();

        menu.removeAll();
        records.forEach((record) => {
            menu.add({
                text: record.get('name'),
                listeners: {
                    scope: me,
                    click: function () {
                        me.onTemplateMenuClick(record);
                    }
                }
            });
        });
    },

    queryReportTemplate: async function () {
        let me = this,
            view = me.getView(),
            model = me.getViewModel(),
            data = await fetch('./jobs/template-report/' + model.get('reportType') + '/' + model.get('jobid'))
                .then(res => res.json())
                .then(res => res);
        if (data.success) {
            model.set('reportTemplate', data.report);
            return true;
        } else {
            console.error('Failed to fetch report template', data);
            Ext.toast({
                html: data.msg,
                title: 'Fehler',
                align: 't',
                iconCls: 'fa fa-warning'
            });
            return false;
        }
    },
    queryAddress: async function () {
        let me = this,
            view = me.getView(),
            model = me.getViewModel(),
            formData = new FormData(),
            filter = [{ "property": "id", "value": model.get('jobid'), "operator": "eq" }],
            _ = formData.append("filter", JSON.stringify(filter)),
            data = await fetch('./ds/view_tualo_job_address/read', {
                method: "POST",
                body: formData,
            })
                .then(res => res.json())
                .then(res => res);
        if (data.success) {
            model.set('address', data.data[0].address);

            return true;
        } else {
            console.error('Failed to fetch address', data);
            Ext.toast({
                html: data.msg,
                title: 'Fehler',
                align: 't',
                iconCls: 'fa fa-warning'
            });
            return false;
        }
    }




});
