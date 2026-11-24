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
        data: { Model: { EDIT: 'edit' } },
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
    storeLoad.onDataStoreLoad.call({ ...storeLoad, getViewModel: () => model }, null, records);
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

function updateContext(template) {
    const storeLoad = loadDefinition('src/js/lazy/v2/mixins/StoreLoad.js');
    const dataChange = loadDefinition('src/js/lazy/v2/mixins/DataChange.js');
    const model = {
        get: name => name === 'selectedTemplate' ? 'default' : null,
        getStore: name => name === 'templates'
            ? { findRecord: () => template == null ? null : record({ template }) }
            : null
    };
    return { ...storeLoad, ...dataChange, getViewModel: () => model };
}

test('activating a position renders its selected template using that position', () => {
    const context = updateContext('{artikel}: {anzahl}');
    const rows = [
        record({ use_in_offer: 1, leistungsbeschreibung: '', artikel: 'A', anzahl: 2 }),
        record({ use_in_offer: 1, leistungsbeschreibung: '', artikel: 'B', anzahl: 3 })
    ];
    for (const row of rows) {
        row.commit = () => { throw new Error('an edited record must not be committed'); };
        context.onDataUpdate(null, row, 'edit', ['use_in_offer']);
    }
    assert.deepEqual(rows.map(row => row.get('leistungsbeschreibung')), ['A: 2', 'B: 3']);
});

test('only activation of an empty description applies the template', () => {
    const context = updateContext('{artikel}');
    const existing = record({ use_in_offer: 1, leistungsbeschreibung: 'Manuell', artikel: 'A' });
    const unchecked = record({ use_in_offer: 0, leistungsbeschreibung: '', artikel: 'B' });
    const unrelated = record({ use_in_offer: 1, leistungsbeschreibung: '', artikel: 'C' });
    const committed = record({ use_in_offer: 1, leistungsbeschreibung: '', artikel: 'D' });
    context.onDataUpdate(null, existing, 'edit', ['use_in_offer']);
    context.onDataUpdate(null, unchecked, 'edit', ['use_in_offer']);
    context.onDataUpdate(null, unrelated, 'edit', ['anzahl']);
    context.onDataUpdate(null, committed, 'commit', ['use_in_offer']);
    assert.equal(existing.get('leistungsbeschreibung'), 'Manuell');
    assert.equal(unchecked.get('leistungsbeschreibung'), '');
    assert.equal(unrelated.get('leistungsbeschreibung'), '');
    assert.equal(committed.get('leistungsbeschreibung'), '');
});

test('activation uses the same description fallback as loading', () => {
    for (const [template, data, expected] of [
        ['', { langtext: 'Langtext', artikel: 'A' }, 'Langtext'],
        ['{missing}', { langtext: '', artikel: 'A', bemerkung: 'Notiz' }, 'A\nNotiz']
    ]) {
        const row = record({ use_in_offer: 1, leistungsbeschreibung: '', ...data });
        row.commit = () => { throw new Error('an edited record must not be committed'); };
        updateContext(template).onDataUpdate(null, row, 'edit', ['use_in_offer']);
        assert.equal(row.get('leistungsbeschreibung'), expected);
    }
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
