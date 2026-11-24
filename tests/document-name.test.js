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
        app: { ViewController: class { } }
    };
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {
        Ext,
        console: { log() { }, error() { }, warn() { } },
        setTimeout
    });
    return definition;
}

function record(data) {
    return {
        data: { ...data },
        get(name) { return this.data[name]; },
        set(name, value) { this.data[name] = value; }
    };
}

function makeModel(values, store) {
    return {
        get: name => values[name],
        set: (name, value) => { values[name] = value; },
        getStore: () => store
    };
}

const controller = loadDefinition('src/js/lazy/v2/controller/Panel.js');

test('v2 controller defines the document name change handlers referenced by the view', () => {
    assert.equal(typeof controller.onChangeDocumentName, 'function');
    assert.equal(typeof controller.onChangeDocumentNameDD, 'function');
});

test('onChangeDocumentName sets the report type title on offer positions only', () => {
    const records = [
        record({ use_in_offer: 1, angebot_title: 'Alt' }),
        record({ use_in_offer: 0, angebot_title: 'Alt' })
    ];
    const store = { getRange: () => records };
    const model = makeModel({ reportType: 'angebot' }, store);

    controller.onChangeDocumentName.call({ getViewModel: () => model }, null, 'Neu', 'Alt');

    assert.equal(records[0].get('angebot_title'), 'Neu');
    assert.equal(records[1].get('angebot_title'), 'Alt');
});

test('onChangeDocumentNameDD updates the filter and reloads the store', () => {
    let loaded = 0;
    const store = { getRange: () => [], load: () => { loaded++; } };
    const values = { reportType: 'angebot' };
    const model = makeModel(values, store);
    const scope = { getViewModel: () => model };

    controller.onChangeDocumentNameDD.call(scope, null, 'Angebot 1', null);
    assert.equal(values.document_name_filter, 'Angebot 1');
    assert.equal(loaded, 1);

    controller.onChangeDocumentNameDD.call(scope, null, '', 'Angebot 1');
    assert.equal(loaded, 1, 'empty values must not trigger a reload');
});
