const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function loadMixin(name) {
    let definition;
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/js/lazy/v2/mixins', name + '.js'), 'utf8'), {
        Ext: {
            define: (name, value) => { definition = value; },
            isEmpty: value => value == null || value === '',
            toast() {},
            util: { Format: { date: () => '2026-11-24' } }
        },
        Tualo: { tualojs: { Format: { Renderer: { euroRenderer: value => String(value) } } } },
        console: { log() {}, warn() {} },
        setTimeout: fn => fn()
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

function group(records, aggregation, mixedGrouping = true) {
    const values = {
        selectedAggregation: aggregation,
        selectedMenge: aggregation === 'one' ? 1 : 5,
        renderedTemplate: '',
        mixedGrouping
    };
    const grid = { getSelectionModel: () => ({ getSelection: () => records }) };
    const context = {
        getViewModel: () => ({ get: name => values[name] }),
        getView: () => ({ getComponent: () => ({ getComponent: () => grid }) })
    };
    loadMixin('GridOperations').onGrouping.call(context);
}

function report(records, forSaving) {
    const values = {
        reportTemplate: {},
        reportType: 'angebot',
        show_total: 0,
        job: record({ kundennummer: '123' }),
        customer: record({ zahlungsziel: 14 })
    };
    const stores = {
        data: { getData: () => ({ items: records }) },
        mengeneinheiten: {
            findRecord: (name, value) => String(value) === '7'
                ? record({ id: 7, symbol: 'Paket', faktor: 1 })
                : null
        },
        tualo_job_offer_text: { getRange: () => [] },
        tualo_job: { getRange: () => [record({ delivery_date: '2026-11-24' })] }
    };
    const model = { get: name => values[name], getStore: name => stores[name] };
    return loadMixin('Report').getReport.call({
        getViewModel: () => model,
        getView: () => ({ getViewModel: () => model }),
        gruppenPreise() {}
    }, forSaving);
}

test('includes all selected calculation references for each report position', () => {
    const makeRow = (id, group, useInOffer = 1) => record({
        id, gruppierung: group, use_in_offer: useInOffer,
        anzahl: 1, epreis: 10, gruppenpreis_netto: 10, steuersatz: 0
    });
    const rows = [
        makeRow(1, 'group'),
        makeRow(2, 'single'),
        makeRow(3, 'group', 0),
        makeRow(4, 'group'),
        makeRow(5, 'excluded', 0)
    ];

    for (const saving of [false, true]) {
        const positions = report(rows, saving).positions;
        const references = JSON.parse(JSON.stringify(positions.map(position => position.vid_references)));
        assert.deepEqual(references, [
            [{ vid: 1, vzusatz: 'calculation' }, { vid: 4, vzusatz: 'calculation' }],
            [{ vid: 2, vzusatz: 'calculation' }]
        ]);
        if (saving) {
            assert.equal(positions[0].vid, 1);
            assert.equal(positions[0].vzusatz, 'calculation');
            assert.equal(positions[0].id, -1);
        }
    }
    assert.equal(rows[0].data.vid_references, undefined);
});

test('numbers empty position texts according to the final report positions', () => {
    const makeRow = (group, posText, useInOffer = 1) => record({
        use_in_offer: useInOffer, gruppierung: group, pos_text: posText,
        anzahl: 1, epreis: 10, gruppenpreis_netto: 10, steuersatz: 0
    });
    const rows = [
        makeRow('excluded', '', 0),
        makeRow('first', ''),
        makeRow('first', ''),
        makeRow('second', 'Eigene Position'),
        makeRow('third', null),
        makeRow('fourth', 0),
        makeRow('fifth', undefined)
    ];

    for (const saving of [false, true]) {
        const positions = report(rows, saving).positions;
        assert.deepEqual(Array.from(positions, position => position.pos_text),
            [1, 'Eigene Position', 3, 0, 5]);
    }
    assert.equal(rows[1].get('pos_text'), '');
    assert.equal(rows[4].get('pos_text'), null);
});

test('one stores unit 7 per group and exports it without changing the source unit', () => {
    const rows = [1, 2].map(id => record({
        id, use_in_offer: 1, anzahl: 2, epreis: 10, netto: 20,
        brutto: 20, steuersatz: 0, gruppenpreis_netto: 40, einheit: 3,
        einheit_symbol: 'Stk.', einheit_faktor: 100
    }));
    group(rows, 'one');
    for (const row of rows) {
        assert.equal(row.get('gruppeneinheit'), 7);
        assert.equal(row.get('gruppenfunktion'), 'one');
        assert.equal(row.get('einheit'), 3);
    }
    for (const saving of [false, true]) {
        const result = report(rows, saving);
        assert.equal(result.positions.length, 1);
        assert.equal(result.positions[0].einheit, 7);
        assert.equal(result.positions[0].unit, 7);
        assert.equal(result.positions[0].einheit_symbol, 'Paket');
        assert.equal(result.positions[0].einheit_faktor, 1);
        assert.equal(result.positions[0].amount, 1);
        assert.equal(result.positions[0].anzahl, 1);
        assert.equal(result.positions[0].singleprice, 40);
        assert.equal(result.positions[0].net, 40);
        assert.equal(rows[0].get('anzahl'), 2);
        assert.equal(rows[0].get('einheit'), 3);
        assert.equal(rows[0].get('einheit_symbol'), 'Stk.');
    }
});

test('restores the package unit and symbol after reloading a one group', () => {
    for (const storedUnit of ['7', null, '5']) {
        const row = record({
            use_in_offer: 1, gruppierung: 'group', gruppenfunktion: 'one',
            gruppenmenge: '1', gruppeneinheit: storedUnit, anzahl: 5, epreis: 10,
            netto: 50, brutto: 50, steuersatz: 0, gruppenpreis_netto: 50,
            einheit: '5', einheit_symbol: 'alte Einheit', einheit_faktor: 5
        });
        for (const saving of [false, true]) {
            const position = report([row], saving).positions[0];
            assert.equal(position.einheit, 7);
            assert.equal(position.unit, 7);
            assert.equal(position.einheit_symbol, 'Paket');
            assert.equal(position.einheit_faktor, 1);
        }
        assert.equal(row.get('einheit'), '5');
        assert.equal(row.get('einheit_symbol'), 'alte Einheit');
    }
});

test('reports an error when the grouped unit is missing from the unit store', () => {
    const row = record({
        use_in_offer: 1, gruppierung: 'group', gruppenmenge: 1,
        gruppeneinheit: '42', anzahl: 1, epreis: 10, netto: 10, brutto: 10,
        steuersatz: 0, gruppenpreis_netto: 10
    });
    assert.throws(() => report([row], true), /Mengeneinheit 42 wurde nicht gefunden/);
});

test('regrouping with another aggregation clears the unit override', () => {
    const rows = [record({
        use_in_offer: 1, anzahl: 2, epreis: 10, netto: 20,
        brutto: 20, steuersatz: 0, gruppenpreis_netto: 20, einheit: 3
    })];
    group(rows, 'one');
    group(rows, 'sum');
    assert.equal(rows[0].get('gruppeneinheit'), null);
    assert.equal(rows[0].get('gruppenfunktion'), 'sum');
    assert.equal(report(rows, true).positions[0].einheit, 3);
});

test('ungrouping clears the unit override on all selected positions', () => {
    const rows = [record({ einheit: 3 }), record({ einheit: 4 })];
    group(rows, 'one');
    group(rows, 'one', false);
    assert.deepEqual(rows.map(row => row.get('gruppeneinheit')), [null, null]);
    assert.deepEqual(rows.map(row => row.get('gruppenmenge')), [null, null]);
    assert.deepEqual(rows.map(row => row.get('gruppenfunktion')), [null, null]);
    assert.deepEqual(rows.map(row => row.get('einheit')), [3, 4]);
});

function selectRows(rows, selection) {
    const operations = loadMixin('GridOperations');
    const values = { selectedAggregation: 'sum', reportType: 'angebot' };
    const model = {
        get: name => values[name],
        set: (name, value) => { values[name] = value; },
        getStore: () => ({ each: fn => rows.forEach(fn) })
    };
    const grid = { getSelectionModel: () => ({ getSelection: () => selection }) };
    const context = {
        ...operations,
        getViewModel: () => model,
        getView: () => ({ getComponent: () => ({ getComponent: () => grid }) }),
        calculateTemplate() {}
    };
    operations.onSelectionchange.call(context, null, selection);
    return { values, context };
}

test('restores a saved group function and quantity after reload', () => {
    const rows = [1, 2].map(id => record({
        id, use_in_offer: 1, anzahl: id + 2, netto: 10, gruppenpreis_netto: 20,
        brutto: 10, steuersatz: 0
    }));
    group(rows, 'one');
    const loaded = rows.map(row => record(JSON.parse(JSON.stringify(row.data))));
    const { values, context } = selectRows(loaded, loaded);
    assert.equal(values.selectedAggregation, 'one');
    assert.equal(values.selectedMenge, 1);
    assert.equal(report(loaded, true).positions[0].amount, 1);

    values.selectedAggregation = 'sum';
    context.updateSelectionData();
    assert.equal(values.selectedMenge, 7);
});

test('restores the saved quantity when only part of a group is selected', () => {
    const rows = [1, 2].map(id => record({
        id, use_in_offer: 1, anzahl: id + 2, netto: 10
    }));
    group(rows, 'sum');
    const { values } = selectRows(rows, [rows[0]]);
    assert.equal(values.selectedAggregation, 'sum');
    assert.equal(values.selectedMenge, 5);
});

test('restores each saved calculation mode', () => {
    for (const aggregation of ['sum', 'min', 'max', 'tmax', 'one']) {
        const rows = [1, 2].map(id => record({
            id, use_in_offer: 1, anzahl: id + 2, netto: 10
        }));
        group(rows, aggregation);
        const loaded = rows.map(row => record(JSON.parse(JSON.stringify(row.data))));
        const { values } = selectRows(loaded, loaded);
        assert.equal(values.selectedAggregation, aggregation);
        assert.equal(values.selectedMenge, aggregation === 'one' ? 1 : 5);
    }
});

test('recognizes legacy package groups and leaves mixed selections unchanged', () => {
    const legacy = [1, 2].map(id => record({
        id, use_in_offer: 1, gruppierung: 'group', gruppenfunktion: null,
        gruppeneinheit: '7', gruppenmenge: '1', anzahl: 3, netto: 10
    }));
    assert.equal(selectRows(legacy, legacy).values.selectedAggregation, 'one');

    const other = record({
        use_in_offer: 1, gruppierung: 'other', gruppenfunktion: 'max',
        gruppenmenge: 3, anzahl: 3, netto: 10
    });
    const values = selectRows([...legacy, other], [legacy[0], other]).values;
    assert.equal(values.selectedAggregation, 'sum');
    assert.equal(values.selectedMenge, 6);
});

test('exports group quantity and preserves the group total even when using actual amounts', () => {
    const row = record({
        use_in_offer: 1, gruppierung: 'group', gruppenmenge: '5',
        anzahl: 2, ist_anzahl: 3, use_real_amount: 1, epreis: 10,
        netto: 20, brutto: 20, ist_netto: 30, ist_brutto: 30,
        steuersatz: 0, gruppenpreis_netto: 100
    });
    for (const saving of [false, true]) {
        const position = report([row], saving).positions[0];
        assert.equal(position.amount, '5');
        assert.equal(position.anzahl, '5');
        assert.equal(position.singleprice, 20);
        assert.equal(position.net, 100);
        assert.equal(position.gross, 100);
    }
});

test('keeps the original quantity when no group quantity is available', () => {
    for (const useRealAmount of [0, 1]) {
        const row = record({
            use_in_offer: 1, gruppierung: 'single', gruppenmenge: null,
            anzahl: 2, ist_anzahl: 3, use_real_amount: useRealAmount,
            epreis: 10, netto: 20, brutto: 20, ist_netto: 30, ist_brutto: 30,
            steuersatz: 0, gruppenpreis_netto: 20
        });
        assert.equal(report([row], true).positions[0].amount, useRealAmount ? 3 : 2);
    }
});

test('uses the position quantity for a single position with a zero group quantity', () => {
    for (const groupAmount of [0, '0', '0.00000']) {
        for (const useRealAmount of [0, 1]) {
            const row = record({
                use_in_offer: 1, gruppierung: 'random-id', gruppenmenge: groupAmount,
                anzahl: 2, ist_anzahl: 3, use_real_amount: useRealAmount,
                epreis: 10, netto: 20, brutto: 20, ist_netto: 30, ist_brutto: 30,
                steuersatz: 0, gruppenpreis_netto: useRealAmount ? 30 : 20
            });
            for (const saving of [false, true]) {
                const position = report([row], saving).positions[0];
                assert.equal(position.amount, useRealAmount ? 3 : 2);
                assert.equal(position.singleprice, 10);
                assert.equal(position.net, useRealAmount ? 30 : 20);
            }
        }
    }
});

test('a zero group quantity does not produce infinite prices or NaN totals', () => {
    const rows = [1, 2].map(id => record({
        id,
        use_in_offer: 1, gruppierung: 'group', gruppenmenge: 0,
        anzahl: 2, epreis: 10, netto: 20, brutto: 20,
        steuersatz: 0, gruppenpreis_netto: 40
    }));
    const position = report(rows, true).positions[0];
    assert.equal(position.amount, 0);
    assert.equal(position.singleprice, 0);
    assert.equal(position.net, 40);
    assert.equal(position.gross, 40);
});
