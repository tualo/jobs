const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function loadDefinition(file) {
    let definition;
    const Ext = {
        define: (name, value) => { definition = value; },
        isEmpty: value => value == null || value === '' || (Array.isArray(value) && value.length === 0),
        XTemplate: class {
            constructor(template) { this.template = template; }
            apply(data) {
                return this.template.replace(/\{(\w+)\}/g, (match, key) => data[key] ?? '');
            }
        }
    };
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {
        Ext,
        console: { log() {}, error() {} },
        setTimeout
    });
    return definition;
}

function record(data) {
    return {
        data: { ...data },
        get(name) { return this.data[name]; },
        set(name, value) { this.data[name] = value; },
        getData() { return { ...this.data }; },
        commit() {}
    };
}

function loadRecords(template, records) {
    const storeLoad = loadDefinition('src/js/lazy/v2/mixins/StoreLoad.js');
    const values = { reportType: 'angebot', selectedTemplate: 'default' };
    const model = {
        get: name => values[name],
        set: (name, value) => { values[name] = value; },
        getStore: name => name === 'templates'
            ? { findRecord: () => template == null ? null : record({ template }) }
            : null
    };
    storeLoad.onDataStoreLoad.call({ getViewModel: () => model }, null, records);
}

test('renders the selected template separately for each eligible position', () => {
    const records = [
        record({ use_in_offer: 1, leistungsbeschreibung: '', langtext: 'Fallback', artikel: 'A', anzahl: 2 }),
        record({ use_in_offer: 1, leistungsbeschreibung: '', langtext: 'Fallback', artikel: 'B', anzahl: 3 }),
        record({ use_in_offer: 1, leistungsbeschreibung: 'Vorhanden', langtext: 'Fallback', artikel: 'C' }),
        record({ use_in_offer: 0, leistungsbeschreibung: '', langtext: 'Fallback', artikel: 'D' })
    ];
    loadRecords('{artikel}: {anzahl}', records);
    assert.deepEqual(records.map(item => item.get('leistungsbeschreibung')), ['A: 2', 'B: 3', 'Vorhanden', '']);
});

test('falls back to langtext when the template is missing, empty, or renders empty', () => {
    for (const template of [null, '', '{missing}']) {
        const item = record({ use_in_offer: 1, leistungsbeschreibung: '', langtext: 'Langtext', artikel: 'A' });
        loadRecords(template, [item]);
        assert.equal(item.get('leistungsbeschreibung'), 'Langtext');
    }
});

test('keeps the existing article fallback when neither template nor langtext has a value', () => {
    const item = record({ use_in_offer: 1, leistungsbeschreibung: '', langtext: '', artikel: 'A', bemerkung: 'Notiz' });
    loadRecords('', [item]);
    assert.equal(item.get('leistungsbeschreibung'), 'A\nNotiz');
});

test('loads position templates and units before starting the positions store', async () => {
    const controller = loadDefinition('src/js/lazy/v2/controller/Panel.js');
    const stores = {};
    const calls = [];
    let resolveTemplates, resolveUnits;
    const templateLoad = new Promise(resolve => { resolveTemplates = resolve; });
    const unitLoad = new Promise(resolve => { resolveUnits = resolve; });
    const model = {
        getStore(name) {
            return stores[name] ||= { name, getRange: () => [] };
        },
        get(name) {
            if (name === 'reportTemplate') return {};
            return null;
        },
        set() {}
    };
    const context = {
        getView: () => ({}),
        getViewModel: () => model,
        canSaveReport: async () => {},
        queryAddress: async () => {},
        queryReportTemplate: async () => {},
        loadStore(store) {
            calls.push(store.name);
            if (store.name === 'templates') return templateLoad;
            if (store.name === 'mengeneinheiten') return unitLoad;
            return Promise.resolve();
        },
        onTextTemplatesLoad() {},
        prepareTexts: async () => {},
        renderPreview() {}
    };
    const loading = controller.fetchInformation.call(context);
    await new Promise(resolve => setImmediate(resolve));
    assert.ok(calls.includes('templates'));
    assert.ok(calls.includes('mengeneinheiten'));
    assert.ok(!calls.includes('data'));
    resolveTemplates();
    await new Promise(resolve => setImmediate(resolve));
    assert.ok(!calls.includes('data'));
    resolveUnits();
    await loading;
    assert.ok(calls.indexOf('data') > calls.indexOf('templates'));
    assert.ok(calls.indexOf('data') > calls.indexOf('mengeneinheiten'));
});
