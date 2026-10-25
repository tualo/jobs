Ext.define('Tualo.jobs.lazy.v2.mixins.CreateTemplateData', {

    createTemplateData: async function () {
        console.log('Panel.createTemplateData');
        let me = this,
            view = me.getView(),
            model = view.getViewModel(),
            tualo_job = model.getStore('tualo_job'),
            job = model.get('job'),
            briefanreden = model.getStore('briefanreden'),
            kunde = model.get('kunde'),

            jobRecord = tualo_job.getRange()[0],
            jobData = await this.queryJobData(jobRecord.get('__id')),
            contactData = await this.queryContact(jobRecord.get('primary_contact')),
            templateData = {};


        me.getViewModel().set('jobData', jobData);

        if (!Ext.isEmpty(kunde)) {
            templateData.kunde = kunde.getData()
        };

        if (!Ext.isEmpty(job)) {
            templateData.job = job.getData();

        }

        templateData.job_name = jobRecord.get('job_name');
        templateData.order_date = Ext.util.Format.deDate(jobRecord.get('order_date'));
        templateData.delivery_date = Ext.util.Format.deDate(jobRecord.get('delivery_date'));
        templateData.briefanrede = 'Sehr geehrte Damen und Herren';


        if (!Ext.isEmpty(contactData)) {
            let br = briefanreden.findRecord('id', contactData[0].briefanrede, 0, false, true, true);
            if (!Ext.isEmpty(br)) {
                templateData.briefanrede = br.get('name') + ' ' + contactData[0].nachname;
            }
        }


        let dataTable = ['<table>'];
        jobData.forEach((item) => {
            console.log('Panel.createTemplateData.jobData.forEach');

            dataTable.push('<tr><td>' + item.name + '</td><td>' + item.value + '</td></tr>');

        });
        dataTable.push('</table>');
        templateData.job_data = dataTable.join('');


        // templateData.job_name = jobRecord.get('job_name');
        return templateData;

    },

    queryJobData: async function (id) {
        console.log('Panel.queryJobData');
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

    queryContact: async function (id) {
        console.log('Panel.queryContact');
        const formData = new FormData();
        let sorter = [{ "property": "name", "direction": "asc" }];

        let fd = {
            reference: JSON.stringify({ "id": id }),
            limit: 1000
        };

        let params = new URLSearchParams(fd);
        let fetched = await fetch('./ds/ansprechpartner/read?' + params.toString(), {
            method: "GET",
        });
        let json = await fetched.json();

        return json.data;

    },





});