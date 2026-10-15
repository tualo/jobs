delimiter ;
insert into
    extjs_base_types (
        id,
        classname,
        baseclass,
        xtype_long_modern,
        xtype_long_classic,
        name,
        vendor
    )
values
    (
        'Tualo.job.form.field.TextEditor (widget.tualo_job_text_editor)',
        'Tualo.job.form.field.TextEditor',
        'Ext.field.Field',
        'widget.tualo_job_text_editor',
        'widget.tualo_job_text_editor',
        'Tualo.job.form.field.TextEditor',
        'tualo solutions GmbH'
    ) on duplicate key
update
    xtype_long_modern = values(xtype_long_modern),
    xtype_long_classic = values(xtype_long_classic);
