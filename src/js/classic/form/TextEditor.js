Ext.define('Tualo.job.form.field.TextEditor', {
    extend: 'Ext.form.field.HtmlEditor',
    alias: ['widget.tualo_job_text_editor'],
    config: {
        record: null
    },

    applyRecord: function (record) {
        console.log('Tualo.job.form.field.TextEditor', 'applyRecord called', record)
        var me = this;
        me.record = record;
        return record;
    },

    updateRecord: function (record) {
        console.log('Tualo.job.form.field.TextEditor', 'updateRecord called', record)
        var me = this;
        me.record = record;
        return record;
    },

    setRecord: function (record) {
        console.log('Tualo.job.form.field.TextEditor', 'setRecord called', record)
        var me = this;
        me.record = record;
        me.createAndStoreTemplateData();
        return record;
    },


    createTemplateData: async function () {
        let me = this,
            templateData = {}

        if (!me.record) {
            return templateData;
        }
        let
            //tualo_job = view.getViewModel().getStore('tualo_job'),
            //briefanreden = view.getViewModel().getStore('briefanreden'),
            //jobRecord = tualo_job.getRange()[0],
            jobData = await me.queryJobData(me.record.get('jobid')),
            contactData = null
            //contactData = await this.queryContact(jobRecord.get('primary_contact')),
            ;




        templateData.job_name = me.record.get('job_name');
        templateData.order_date = Ext.util.Format.deDate(me.record.get('order_date'));
        templateData.briefanrede = 'Sehr geehrte Damen und Herren';


        if (!Ext.isEmpty(contactData)) {
            let br = briefanreden.findRecord('id', contactData[0].briefanrede, 0, false, true, true);
            if (!Ext.isEmpty(br)) {
                templateData.briefanrede = br.get('name') + ' ' + contactData[0].nachname;
            }
        }


        let dataTable = ['<table>'];
        jobData.forEach((item) => {

            dataTable.push('<tr><td>' + item.name + '</td><td>' + item.value + '</td></tr>');

        });
        dataTable.push('</table>');
        templateData.job_data = dataTable.join('');


        // templateData.job_name = jobRecord.get('job_name');
        return templateData;


    },

    _unclean: false,
    _uncleanData: null,

    createAndStoreTemplateData: async function () {
        this._unclean = true;
        let templateData = await this.createTemplateData();
        this.templateData = templateData;
        this._unclean = false;
        if (this._uncleanData) {
            this.setValue(this._uncleanData);
            this._uncleanData = null;
        }
        return templateData;
    },

    templateText: function (currentText) {
        var me = this;
        let tpl = new Ext.XTemplate(currentText);
        let newText = tpl.apply(me.templateData || {});
        return newText;
    },


    queryJobData: async function (id) {
        const formData = new FormData();
        let filter = [{ "property": "job_id", "value": id, "operator": "eq" } /*,{"property":"show_in_offer","value":1,"operator":"eq"}*/];
        let sorter = [{ "property": "position", "direction": "asc" }];
        formData.append("filter", JSON.stringify(filter));
        formData.append("sorter", JSON.stringify(sorter));

        let fd = {
            reference: JSON.stringify({ "job_id": id }),
            sort: JSON.stringify(sorter),
            limit: 1000
        }
        let params = new URLSearchParams(fd);

        let fetched = await fetch('./ds/tualo_job_data/read?' + params.toString(), {
            method: "GET",
        });
        let json = await fetched.json();
        return json.data;
    },


    setValue: function (v) {
        var me = this;
        if (!me._unclean) {
            v = this.templateText(v);
        } else {
            me._uncleanData = v;
        }
        me.callParent([v]);


    },


});

Ext.define('Tualo.job.form.field.TextEditorX', {
    extend: 'Ext.form.field.TextArea',
    alias: ['widget.tualo_job_text_editor_x'],
    language: null,
    height: 300,



    fieldSubTpl: [ // note: {id} here is really {inputId}, but {cmpId} is available 
        '<input id="{id}" data-ref="inputEl" type="hidden" {inputAttrTpl}',
        ' size="1"', // allows inputs to fully respect CSS widths across all browsers 
        '<tpl if="name"> name="{name}"</tpl>',
        '<tpl if="value"> value="{value}"</tpl>',
        '<tpl if="placeholder"> placeholder="{placeholder}"</tpl>',
        '{%if (values.maxLength !== undefined){%} maxlength="{maxLength}"{%}%}',
        '<tpl if="readOnly"> readonly="readonly"</tpl>',
        '<tpl if="disabled"> disabled="disabled"</tpl>',
        '<tpl if="tabIdx != null"> tabindex="{tabIdx}"</tpl>',
        '<tpl if="fieldStyle"> style="{fieldStyle}"</tpl>',
        '<tpl foreach="inputElAriaAttributes"> {$}="{.}"</tpl>',
        ' class="{fieldCls} {typeCls} {typeCls}-{ui} {editableCls} {inputCls}" autocomplete="off"/>',
        '<div id="{id}-quilleditor"  data-ref="inputEl" rows="1" {inputAttrTpl} style="background-color: white;">',
        '<tpl if="value">{[values.value]}</tpl>',
        '<div id="{id}-quilleditor-toolbar"></div>',
        '</div>'
        ,
        {
            disableFormats: true
        }
    ],

    config: {
        record: null
    },

    applyRecord: function (record) {
        console.log('Tualo.job.form.field.TextEditor', 'applyRecord called', record)
        return record;
    },

    updateRecord: function (record) {
        console.log('Tualo.job.form.field.TextEditor', 'updateRecord called', record)
        return record;
    },

    setRecord: function (record) {
        console.log('Tualo.job.form.field.TextEditor', 'setRecord called', record)
        return record;
    },


    createTemplateData: async function () {
        let me = this,
            templateData = {}

        if (!me.record) {
            return templateData;
        }
        let
            //tualo_job = view.getViewModel().getStore('tualo_job'),
            //briefanreden = view.getViewModel().getStore('briefanreden'),
            //jobRecord = tualo_job.getRange()[0],
            jobData = await me.queryJobData(me.record.get('jobid'))
            //contactData = await this.queryContact(jobRecord.get('primary_contact')),
            ;




        templateData.job_name = me.record.get('job_name');
        templateData.order_date = Ext.util.Format.deDate(me.record.get('order_date'));
        templateData.briefanrede = 'Sehr geehrte Damen und Herren';


        if (!Ext.isEmpty(contactData)) {
            let br = briefanreden.findRecord('id', contactData[0].briefanrede, 0, false, true, true);
            if (!Ext.isEmpty(br)) {
                templateData.briefanrede = br.get('name') + ' ' + contactData[0].nachname;
            }
        }


        let dataTable = ['<table>'];
        jobData.forEach((item) => {

            dataTable.push('<tr><td>' + item.name + '</td><td>' + item.value + '</td></tr>');

        });
        dataTable.push('</table>');
        templateData.job_data = dataTable.join('');


        // templateData.job_name = jobRecord.get('job_name');
        return templateData;


    },

    templateText: async function (currentText) {
        let templateData = await this.createTemplateData();
        let tpl = new Ext.XTemplate(currentText);
        let newText = tpl.apply(templateData);
        return newText;
    },


    queryJobData: async function (id) {
        const formData = new FormData();
        let filter = [{ "property": "job_id", "value": id, "operator": "eq" } /*,{"property":"show_in_offer","value":1,"operator":"eq"}*/];
        let sorter = [{ "property": "position", "direction": "asc" }];
        formData.append("filter", JSON.stringify(filter));
        formData.append("sorter", JSON.stringify(sorter));

        let fd = {
            reference: JSON.stringify({ "job_id": id }),
            sort: JSON.stringify(sorter),
            limit: 1000
        }
        let params = new URLSearchParams(fd);

        let fetched = await fetch('./ds/tualo_job_data/read?' + params.toString(), {
            method: "GET",
        });
        let json = await fetched.json();
        return json.data;
    },


    initComponent: function () {
        var me = this;
        me.callParent();
        console.log('Tualo.job.form.field.TextEditor', 'initComponent called');
        window.mEditor = this;

    },

    afterRender: function () {
        var me = this;
        me.callParent(arguments);
        try {
            me.editor = me.createEditor();
        } catch (e) {
            console.error(e);
        }
    },

    intern: false,
    createEditor: function (config) {
        var me = this,
            editor;

        Quill.prototype.getHtml = function () {
            return this.container.querySelector('.ql-editor').innerHTML;
        };


        var toolbarOptions = [
            [{ 'font': [] }],
            ['bold', 'italic', 'underline'],
            ['link'],
            ['blockquote', 'code-block'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'align': [] }],
            ['more']
        ];



        editor = new Quill('#' + this.id + '-inputEl-quilleditor', {
            modules: {
                toolbar: {
                    container: toolbarOptions,
                    handlers: {
                        'customControl': () => { console.log('customControl was clicked') }
                    }
                }
            },
            theme: 'snow'
        });

        /*
        try {
            var customButton = document.querySelectorAll('.ql-more');
            customButton = customButton[customButton.length - 1];
            customButton.innerHTML = 'TXT';
            customButton.addEventListener('click', this.initContextMenu.bind(this));
        } catch (E) { }
        */

        editor.on('text-change', function (delta, oldDelta, source) {
            me.intern = true;

            me.setValue(editor.getHtml());
            me.fireEvent('change', me, editor.getHtml());
            me.fireEvent('text-change', me, delta, oldDelta, source);

            me.intern = false;
        });
        editor.on('selection-change', function (range, oldRange, source) { me.fireEvent('selection-change', me, range, oldRange, source); });
        return editor;
    },
    initContextMenu: function (e) {


        var contextMenu = new Ext.menu.Menu({ items: [], width: 600, scrollable: 'y' });

        Tualo.Ajax.request({
            url: './ds/texttemplate/read',
            params: {
                limit: 1000,
                filter: JSON.stringify([{
                    operator: 'eq',
                    property: 'klasse',
                    value: this.templateid
                }])
            },
            scope: this,
            json: function (o) {
                if (o.success) {

                    o.data.forEach(element => {

                        contextMenu.add({
                            text: element.text.substring(0, 70) + '...',
                            fulltext: element.text,
                            scope: this,
                            handler: this.onItemClick
                        })

                    });
                    var xy = [e.x, e.y];
                    contextMenu.showAt(xy);
                }
            }
        });

    },
    onItemClick: function (e) {

        this.setValue(this.getValue() + "<br/>" + e.fulltext);
    },
    onDestroy: function () {
        // this.monacoeditor.dispose();
        this.callParent();
    },
    getSubmitValue: function () {
        var me = this;
        console.log('getSubmitValue', me);
        if (me.editor) {
            return me.editor.getHtml();
        }
        return me.callParent();
    },

    setValue: function (v) {
        var me = this,
            t = (new Date()).getTime(),

            cp = me.callParent.bind(me);

        me.callParent([v]);

        window.editor = me;
        window.currentText = v;

        let fn = async function (currentText) {

            currentText = await this.templateText(currentText)


            me.lastchange = t;

            if (currentText == null) currentText = '';
            if (me.intern !== true) {
                if (me.editor) {
                    me.editor.clipboard.dangerouslyPasteHTML(currentText, 'silent');
                    // me.editor.setContents(me.editor.clipboard.convert(v), 'silent');
                } else {
                    me.on('editorReady', function () {
                        if (me.editor.getHtml() != me.editor.clipboard.convert(currentText))
                            me.editor.clipboard.dangerouslyPasteHTML(currentText, 'silent');
                        // me.editor.setContents(me.editor.clipboard.convert(v), 'silent');
                    }, this, { single: true });
                }

            }
        }

        fn.bind(me)(v);



    },
});