create or replace view view_copy_calculation_dd as
select 
    concat(
        tualo_job.job_number,
        '-',
        h.document_name,
        '-#',
        h.id
    ) name,
    h.id
from 
blg_hdr_calculation h
join tualo_job 
on tualo_job.id = h.jobid;

SET FOREIGN_KEY_CHECKS=0;
INSERT INTO `ds` (`allowform`,`autosave`,`base_store_class`,`class_name`,`combined`,`default_pagesize`,`displayfield`,`existsreal`,`globalsearch`,`listselectionmodel`,`listviewbaseclass`,`modelbaseclass`,`phpexporter`,`phpexporterfilename`,`searchany`,`searchfield`,`showactionbtn`,`sortdirection`,`sortfield`,`syncable`,`table_name`,`title`,`use_history`,`use_insert_for_update`) VALUES ('0','0','Tualo.DataSets.data.Store','ERP','0','1000','name','1','0','cellmodel','Tualo.DataSets.ListView','Tualo.DataSets.model.Basic','XlsxWriter','view_copy_calculation_dd {DATE} {TIME}','1','name','1','DESC','name','0','view_copy_calculation_dd','view_copy_calculation_dd','0','0') ON DUPLICATE KEY UPDATE `allowform`=values(`allowform`),`autosave`=values(`autosave`),`base_store_class`=values(`base_store_class`),`class_name`=values(`class_name`),`combined`=values(`combined`),`default_pagesize`=values(`default_pagesize`),`displayfield`=values(`displayfield`),`existsreal`=values(`existsreal`),`globalsearch`=values(`globalsearch`),`listselectionmodel`=values(`listselectionmodel`),`listviewbaseclass`=values(`listviewbaseclass`),`modelbaseclass`=values(`modelbaseclass`),`phpexporter`=values(`phpexporter`),`phpexporterfilename`=values(`phpexporterfilename`),`searchany`=values(`searchany`),`searchfield`=values(`searchfield`),`showactionbtn`=values(`showactionbtn`),`sortdirection`=values(`sortdirection`),`sortfield`=values(`sortfield`),`syncable`=values(`syncable`),`table_name`=values(`table_name`),`title`=values(`title`),`use_history`=values(`use_history`),`use_insert_for_update`=values(`use_insert_for_update`); 
INSERT IGNORE INTO `ds_column` (`character_maximum_length`,`column_key`,`column_name`,`column_type`,`data_type`,`default_max_value`,`default_min_value`,`deferedload`,`existsreal`,`fieldtype`,`is_generated`,`is_nullable`,`is_primary`,`numeric_precision`,`numeric_scale`,`privileges`,`syncable`,`table_name`,`writeable`) VALUES ('0','','id','bigint(20)','bigint','0','0','0','1','','NEVER','NO','0','19','0','select,insert,update,references','0','view_copy_calculation_dd','1') ; 
INSERT IGNORE INTO `ds_column` (`character_maximum_length`,`character_set_name`,`column_key`,`column_name`,`column_type`,`data_type`,`default_max_value`,`default_min_value`,`deferedload`,`existsreal`,`fieldtype`,`is_generated`,`is_nullable`,`is_primary`,`numeric_precision`,`numeric_scale`,`privileges`,`syncable`,`table_name`,`writeable`) VALUES ('301','utf8mb4','','name','varchar(301)','varchar','0','0','0','1','','NEVER','YES','0','0','0','select,insert,update,references','0','view_copy_calculation_dd','1') ; 
update `ds_column` set `is_primary`='1' where `table_name`='view_copy_calculation_dd' and `column_name`='id';
INSERT IGNORE INTO `ds_column_list_label` (`active`,`align`,`column_name`,`config`,`editor`,`filterstore`,`flex`,`formatter`,`grouped`,`hidden`,`label`,`language`,`listfiltertype`,`position`,`renderer`,`summaryrenderer`,`summarytype`,`table_name`,`xtype`) VALUES ('1','start','id','{}','','','1','','0','0','id','DE','','999','','','','view_copy_calculation_dd','gridcolumn') ; 
INSERT IGNORE INTO `ds_column_list_label` (`active`,`align`,`column_name`,`config`,`editor`,`filterstore`,`flex`,`formatter`,`grouped`,`hidden`,`label`,`language`,`listfiltertype`,`position`,`renderer`,`summaryrenderer`,`summarytype`,`table_name`,`xtype`) VALUES ('1','start','name','{}','','','1','','0','0','name','DE','','999','','','','view_copy_calculation_dd','gridcolumn') ; 
INSERT IGNORE INTO `ds_column_form_label` (`active`,`allowempty`,`column_name`,`fieldgroup`,`field_path`,`flex`,`hidden`,`label`,`language`,`position`,`table_name`,`xtype`) VALUES ('1','0','id','','Allgemein','1','0','id','DE','999','view_copy_calculation_dd','displayfield') ; 
INSERT IGNORE INTO `ds_column_form_label` (`active`,`allowempty`,`column_name`,`fieldgroup`,`field_path`,`flex`,`hidden`,`label`,`language`,`position`,`table_name`,`xtype`) VALUES ('1','0','name','','Allgemein','1','0','name','DE','999','view_copy_calculation_dd','displayfield') ; 
INSERT IGNORE INTO `ds_dropdownfields` (`additional_fields`,`displayfield`,`idfield`,`name`,`table_name`) VALUES ('[]','name','id','id','view_copy_calculation_dd') ; 
INSERT IGNORE INTO `ds_access` (`append`,`delete`,`read`,`role`,`table_name`,`write`) VALUES ('0','0','0','_default_','view_copy_calculation_dd','0') ; 
INSERT IGNORE INTO `ds_access` (`append`,`delete`,`read`,`role`,`table_name`,`write`) VALUES ('0','0','1','administration','view_copy_calculation_dd','0') ; 
INSERT IGNORE INTO `ds_access` (`append`,`delete`,`read`,`role`,`table_name`,`write`) VALUES ('0','0','1','erp','view_copy_calculation_dd','0') ; 
REPLACE INTO `docsystem_ds` (`table_name`) VALUES ('view_copy_calculation_dd') ; 
SET FOREIGN_KEY_CHECKS=1;


create or replace view view_copy_job_dd as
select 
    concat(
        tualo_job.job_number,
        ' (#', tualo_job.id, ')'
        
    ) name,
    tualo_job.id
from 
 
tualo_job 
where status < 4;


SET FOREIGN_KEY_CHECKS=0;
INSERT INTO `ds` (`allowform`,`autosave`,`base_store_class`,`class_name`,`combined`,`default_pagesize`,`displayfield`,`existsreal`,`globalsearch`,`listselectionmodel`,`listviewbaseclass`,`modelbaseclass`,`phpexporter`,`phpexporterfilename`,`searchany`,`searchfield`,`showactionbtn`,`sortdirection`,`sortfield`,`syncable`,`table_name`,`title`,`use_history`,`use_insert_for_update`) VALUES ('0','0','Tualo.DataSets.data.Store','ERP','0','1000','name','1','0','cellmodel','Tualo.DataSets.ListView','Tualo.DataSets.model.Basic','XlsxWriter','view_copy_job_dd {DATE} {TIME}','1','name','1','DESC','name','0','view_copy_job_dd','view_copy_job_dd','0','0') ON DUPLICATE KEY UPDATE `allowform`=values(`allowform`),`autosave`=values(`autosave`),`base_store_class`=values(`base_store_class`),`class_name`=values(`class_name`),`combined`=values(`combined`),`default_pagesize`=values(`default_pagesize`),`displayfield`=values(`displayfield`),`existsreal`=values(`existsreal`),`globalsearch`=values(`globalsearch`),`listselectionmodel`=values(`listselectionmodel`),`listviewbaseclass`=values(`listviewbaseclass`),`modelbaseclass`=values(`modelbaseclass`),`phpexporter`=values(`phpexporter`),`phpexporterfilename`=values(`phpexporterfilename`),`searchany`=values(`searchany`),`searchfield`=values(`searchfield`),`showactionbtn`=values(`showactionbtn`),`sortdirection`=values(`sortdirection`),`sortfield`=values(`sortfield`),`syncable`=values(`syncable`),`table_name`=values(`table_name`),`title`=values(`title`),`use_history`=values(`use_history`),`use_insert_for_update`=values(`use_insert_for_update`); 
INSERT IGNORE INTO `ds_column` (`character_maximum_length`,`column_key`,`column_name`,`column_type`,`data_type`,`default_max_value`,`default_min_value`,`deferedload`,`existsreal`,`fieldtype`,`is_generated`,`is_nullable`,`is_primary`,`numeric_precision`,`numeric_scale`,`privileges`,`syncable`,`table_name`,`writeable`) VALUES ('0','','id','bigint(20)','bigint','0','0','0','1','','NEVER','NO','0','19','0','select,insert,update,references','0','view_copy_job_dd','1') ; 
INSERT IGNORE INTO `ds_column` (`character_maximum_length`,`character_set_name`,`column_key`,`column_name`,`column_type`,`data_type`,`default_max_value`,`default_min_value`,`deferedload`,`existsreal`,`fieldtype`,`is_generated`,`is_nullable`,`is_primary`,`numeric_precision`,`numeric_scale`,`privileges`,`syncable`,`table_name`,`writeable`) VALUES ('301','utf8mb4','','name','varchar(301)','varchar','0','0','0','1','','NEVER','YES','0','0','0','select,insert,update,references','0','view_copy_job_dd','1') ; 
update `ds_column` set `is_primary`='1' where `table_name`='view_copy_job_dd' and `column_name`='id';
INSERT IGNORE INTO `ds_column_list_label` (`active`,`align`,`column_name`,`config`,`editor`,`filterstore`,`flex`,`formatter`,`grouped`,`hidden`,`label`,`language`,`listfiltertype`,`position`,`renderer`,`summaryrenderer`,`summarytype`,`table_name`,`xtype`) VALUES ('1','start','id','{}','','','1','','0','0','id','DE','','999','','','','view_copy_job_dd','gridcolumn') ; 
INSERT IGNORE INTO `ds_column_list_label` (`active`,`align`,`column_name`,`config`,`editor`,`filterstore`,`flex`,`formatter`,`grouped`,`hidden`,`label`,`language`,`listfiltertype`,`position`,`renderer`,`summaryrenderer`,`summarytype`,`table_name`,`xtype`) VALUES ('1','start','name','{}','','','1','','0','0','name','DE','','999','','','','view_copy_job_dd','gridcolumn') ; 
INSERT IGNORE INTO `ds_column_form_label` (`active`,`allowempty`,`column_name`,`fieldgroup`,`field_path`,`flex`,`hidden`,`label`,`language`,`position`,`table_name`,`xtype`) VALUES ('1','0','id','','Allgemein','1','0','id','DE','999','view_copy_job_dd','displayfield') ; 
INSERT IGNORE INTO `ds_column_form_label` (`active`,`allowempty`,`column_name`,`fieldgroup`,`field_path`,`flex`,`hidden`,`label`,`language`,`position`,`table_name`,`xtype`) VALUES ('1','0','name','','Allgemein','1','0','name','DE','999','view_copy_job_dd','displayfield') ; 
INSERT IGNORE INTO `ds_dropdownfields` (`additional_fields`,`displayfield`,`idfield`,`name`,`table_name`) VALUES ('[]','name','id','id','view_copy_job_dd') ; 
INSERT IGNORE INTO `ds_access` (`append`,`delete`,`read`,`role`,`table_name`,`write`) VALUES ('0','0','0','_default_','view_copy_job_dd','0') ; 
INSERT IGNORE INTO `ds_access` (`append`,`delete`,`read`,`role`,`table_name`,`write`) VALUES ('0','0','1','administration','view_copy_job_dd','0') ; 
INSERT IGNORE INTO `ds_access` (`append`,`delete`,`read`,`role`,`table_name`,`write`) VALUES ('0','0','1','erp','view_copy_job_dd','0') ; 
REPLACE INTO `docsystem_ds` (`table_name`) VALUES ('view_copy_job_dd') ; 
SET FOREIGN_KEY_CHECKS=1;

