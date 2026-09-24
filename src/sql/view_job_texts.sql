DELIMITER;

create or replace view view_job_texts as 
select 
    id,
    'angebot' reporttype,
    type,
    placement,
    tualo_job_id,
    pos,
    text,
    used_template_id
from tualo_job_offer_text

union all

select 
    id,
    'rechnung' reporttype,
    type,
    placement,
    tualo_job_id,
    pos,
    text,
    used_template_id
from tualo_job_invoice_text;


SET FOREIGN_KEY_CHECKS=0;
INSERT INTO `ds` (`allowform`,`alternativeformxtype`,`autosave`,`base_store_class`,`class_name`,`combined`,`default_pagesize`,`displayfield`,`existsreal`,`globalsearch`,`listselectionmodel`,`listviewbaseclass`,`modelbaseclass`,`phpexporter`,`phpexporterfilename`,`reorderfield`,`searchany`,`searchfield`,`showactionbtn`,`sortdirection`,`sortfield`,`syncable`,`table_name`,`title`,`use_history`,`use_insert_for_update`) VALUES
 ('0','','0','Tualo.DataSets.data.Store','ERP','0','1000','id','1','0','cellmodel','Tualo.DataSets.ListView','Tualo.DataSets.model.Basic','XlsxWriter','view_job_texts {DATE} {TIME}','pos','1','text','1','ASC','pos','0','view_job_texts','Job-Panel-Texte','0','0') 
ON DUPLICATE KEY UPDATE `allowform`=values(`allowform`),`alternativeformxtype`=values(`alternativeformxtype`),`autosave`=values(`autosave`),`base_store_class`=values(`base_store_class`),`class_name`=values(`class_name`),`combined`=values(`combined`),`default_pagesize`=values(`default_pagesize`),`displayfield`=values(`displayfield`),`existsreal`=values(`existsreal`),`globalsearch`=values(`globalsearch`),`listselectionmodel`=values(`listselectionmodel`),`listviewbaseclass`=values(`listviewbaseclass`),`modelbaseclass`=values(`modelbaseclass`),`phpexporter`=values(`phpexporter`),`phpexporterfilename`=values(`phpexporterfilename`),`reorderfield`=values(`reorderfield`),`searchany`=values(`searchany`),`searchfield`=values(`searchfield`),`showactionbtn`=values(`showactionbtn`),`sortdirection`=values(`sortdirection`),`sortfield`=values(`sortfield`),`syncable`=values(`syncable`),`table_name`=values(`table_name`),`title`=values(`title`),`use_history`=values(`use_history`),`use_insert_for_update`=values(`use_insert_for_update`); 
INSERT IGNORE INTO `ds_column` (`character_maximum_length`,`character_set_name`,`column_key`,`column_name`,`column_type`,`data_type`,`default_max_value`,`default_min_value`,`default_value`,`deferedload`,`existsreal`,`fieldtype`,`is_generated`,`is_nullable`,`is_primary`,`numeric_precision`,`numeric_scale`,`privileges`,`syncable`,`table_name`,`writeable`) VALUES ('36','utf8mb4','PRI','id','varchar(36)','varchar','0','0','{:uuid()}','0','1','','NEVER','NO','1','0','0','select,insert,update,references','0','view_job_texts','1') ; 
INSERT IGNORE INTO `ds_column` (`character_maximum_length`,`character_set_name`,`column_key`,`column_name`,`column_type`,`data_type`,`default_max_value`,`default_min_value`,`default_value`,`deferedload`,`existsreal`,`fieldtype`,`is_generated`,`is_nullable`,`is_primary`,`numeric_precision`,`numeric_scale`,`privileges`,`syncable`,`table_name`,`writeable`) VALUES ('36','utf8mb4','','placement','varchar(36)','varchar','0','0','head','0','1','','NEVER','YES','0','0','0','select,insert,update,references','0','view_job_texts','1') ; 
INSERT IGNORE INTO `ds_column` (`character_maximum_length`,`column_key`,`column_name`,`column_type`,`data_type`,`default_max_value`,`default_min_value`,`default_value`,`deferedload`,`existsreal`,`fieldtype`,`is_generated`,`is_nullable`,`is_primary`,`numeric_precision`,`numeric_scale`,`privileges`,`syncable`,`table_name`,`writeable`) VALUES ('0','','pos','int(11)','int','0','0','999','0','1','','NEVER','YES','0','10','0','select,insert,update,references','0','view_job_texts','1') ; 
INSERT IGNORE INTO `ds_column` (`character_maximum_length`,`character_set_name`,`column_key`,`column_name`,`column_type`,`data_type`,`default_max_value`,`default_min_value`,`deferedload`,`existsreal`,`fieldtype`,`is_generated`,`is_nullable`,`is_primary`,`numeric_precision`,`numeric_scale`,`privileges`,`syncable`,`table_name`,`writeable`) VALUES ('4294967295','utf8mb4','','text','longtext','longtext','0','0','0','1','','NEVER','YES','0','0','0','select,insert,update,references','0','view_job_texts','1') ; 
INSERT IGNORE INTO `ds_column` (`character_maximum_length`,`character_set_name`,`column_key`,`column_name`,`column_type`,`data_type`,`default_max_value`,`default_min_value`,`deferedload`,`existsreal`,`fieldtype`,`is_generated`,`is_nullable`,`is_primary`,`numeric_precision`,`numeric_scale`,`privileges`,`syncable`,`table_name`,`writeable`) VALUES ('36','utf8mb4','MUL','tualo_job_id','varchar(36)','varchar','0','0','0','1','','NEVER','NO','0','0','0','select,insert,update,references','0','view_job_texts','1') ; 
INSERT IGNORE INTO `ds_column` (`character_maximum_length`,`character_set_name`,`column_key`,`column_name`,`column_type`,`data_type`,`default_max_value`,`default_min_value`,`default_value`,`deferedload`,`existsreal`,`fieldtype`,`is_generated`,`is_nullable`,`is_primary`,`numeric_precision`,`numeric_scale`,`privileges`,`syncable`,`table_name`,`writeable`) VALUES ('36','utf8mb4','','type','varchar(36)','varchar','0','0','html','0','1','','NEVER','NO','0','0','0','select,insert,update,references','0','view_job_texts','1') ; 
INSERT IGNORE INTO `ds_column` (`character_maximum_length`,`character_set_name`,`column_key`,`column_name`,`column_type`,`data_type`,`default_max_value`,`default_min_value`,`deferedload`,`existsreal`,`fieldtype`,`is_generated`,`is_nullable`,`is_primary`,`numeric_precision`,`numeric_scale`,`privileges`,`syncable`,`table_name`,`writeable`) VALUES ('36','utf8mb4','','used_template_id','varchar(36)','varchar','0','0','0','1','','NEVER','YES','0','0','0','select,insert,update,references','0','view_job_texts','1') ; 
INSERT IGNORE INTO `ds_column_list_label` (`active`,`align`,`column_name`,`config`,`editor`,`filterstore`,`flex`,`formatter`,`grouped`,`hidden`,`label`,`language`,`listfiltertype`,`position`,`renderer`,`summaryrenderer`,`summarytype`,`table_name`,`xtype`) VALUES ('1','left','id','{}','','','1','','0','1','ID','DE','','0','','','','view_job_texts','gridcolumn') ; 
INSERT IGNORE INTO `ds_column_list_label` (`active`,`align`,`column_name`,`config`,`editor`,`filterstore`,`flex`,`formatter`,`grouped`,`hidden`,`label`,`language`,`listfiltertype`,`position`,`renderer`,`summaryrenderer`,`summarytype`,`table_name`,`xtype`) VALUES ('1','left','placement','{}','','','1','','0','0','Platzierung','DE','','4','','','','view_job_texts','column_text_placements_id') ; 
INSERT IGNORE INTO `ds_column_list_label` (`active`,`align`,`column_name`,`config`,`editor`,`filterstore`,`flex`,`formatter`,`grouped`,`hidden`,`label`,`language`,`listfiltertype`,`position`,`renderer`,`summaryrenderer`,`summarytype`,`table_name`,`xtype`) VALUES ('1','end','pos','{}','','','1','','0','0','Position','DE','','2','','','','view_job_texts','numbercolumn') ; 
INSERT IGNORE INTO `ds_column_list_label` (`active`,`align`,`column_name`,`config`,`editor`,`filterstore`,`flex`,`formatter`,`grouped`,`hidden`,`label`,`language`,`listfiltertype`,`position`,`renderer`,`summaryrenderer`,`summarytype`,`table_name`,`xtype`) VALUES ('1','left','text','{}','','','1','stripedHtml300','0','0','Text','DE','','5','','','','view_job_texts','gridcolumn') ; 
INSERT IGNORE INTO `ds_column_list_label` (`active`,`align`,`column_name`,`config`,`editor`,`filterstore`,`flex`,`formatter`,`grouped`,`hidden`,`label`,`language`,`listfiltertype`,`position`,`renderer`,`summaryrenderer`,`summarytype`,`table_name`,`xtype`) VALUES ('1','left','tualo_job_id','{}','','','1','','0','1','Job','DE','','1','','','','view_job_texts','gridcolumn') ; 
INSERT IGNORE INTO `ds_column_list_label` (`active`,`align`,`column_name`,`config`,`editor`,`filterstore`,`flex`,`formatter`,`grouped`,`hidden`,`label`,`language`,`listfiltertype`,`position`,`renderer`,`summaryrenderer`,`summarytype`,`table_name`,`xtype`) VALUES ('1','left','type','{}','','','1','','0','1','Typ','DE','','3','','','','view_job_texts','gridcolumn') ; 
INSERT IGNORE INTO `ds_column_list_label` (`active`,`align`,`column_name`,`config`,`editor`,`filterstore`,`flex`,`formatter`,`grouped`,`hidden`,`label`,`language`,`listfiltertype`,`position`,`renderer`,`summaryrenderer`,`summarytype`,`table_name`,`xtype`) VALUES ('0','start','used_template_id','{}','','','1','','0','1','used_template_id','DE','','999','','','','view_job_texts','gridcolumn') ; 
INSERT IGNORE INTO `ds_column_form_label` (`active`,`allowempty`,`column_name`,`fieldgroup`,`field_path`,`flex`,`hidden`,`label`,`language`,`position`,`table_name`,`xtype`) VALUES ('1','0','id','','Allgemein/Angaben','1','1','ID','DE','0','view_job_texts','displayfield') ; 
INSERT IGNORE INTO `ds_column_form_label` (`active`,`allowempty`,`column_name`,`fieldgroup`,`field_path`,`flex`,`hidden`,`label`,`language`,`position`,`table_name`,`xtype`) VALUES ('1','0','placement','','Allgemein/Angaben','1','0','Platzierung','DE','4','view_job_texts','combobox_text_placements_id') ; 
INSERT IGNORE INTO `ds_column_form_label` (`active`,`allowempty`,`column_name`,`fieldgroup`,`field_path`,`flex`,`hidden`,`label`,`language`,`position`,`table_name`,`xtype`) VALUES ('1','0','pos','','Allgemein/Angaben','1','1','Position','DE','2','view_job_texts','displayfield') ; 
INSERT IGNORE INTO `ds_column_form_label` (`active`,`allowempty`,`column_name`,`fieldgroup`,`field_path`,`flex`,`hidden`,`label`,`language`,`position`,`table_name`,`xtype`) VALUES ('1','0','text','','Allgemein/Angaben','1','0','Text','DE','5','view_job_texts','htmleditor') ; 
INSERT IGNORE INTO `ds_column_form_label` (`active`,`allowempty`,`column_name`,`fieldgroup`,`field_path`,`flex`,`hidden`,`label`,`language`,`position`,`table_name`,`xtype`) VALUES ('1','0','tualo_job_id','','Allgemein/Angaben','1','1','Job','DE','1','view_job_texts','displayfield') ; 
INSERT IGNORE INTO `ds_column_form_label` (`active`,`allowempty`,`column_name`,`fieldgroup`,`field_path`,`flex`,`hidden`,`label`,`language`,`position`,`table_name`,`xtype`) VALUES ('1','0','type','','Allgemein/Angaben','1','1','Typ','DE','3','view_job_texts','displayfield') ; 
INSERT IGNORE INTO `ds_column_form_label` (`active`,`allowempty`,`column_name`,`fieldgroup`,`field_path`,`flex`,`hidden`,`label`,`language`,`position`,`table_name`,`xtype`) VALUES ('0','0','used_template_id','','Allgemein','1','1','used_template_id','DE','999','view_job_texts','displayfield') ; 
INSERT IGNORE INTO `ds_reference_tables` (`active`,`autosync`,`columnsdef`,`constraint_name`,`existsreal`,`path`,`position`,`reference_table_name`,`searchable`,`table_name`,`tabtitle`) VALUES ('1','0','{\"tualo_job_id\":\"id\"}','fk_view_job_texts_tualo_job_id','1','','7','tualo_job','0','view_job_texts','Textbausteine') ; 
INSERT IGNORE INTO `ds_addcommands` (`iconcls`,`label`,`location`,`position`,`table_name`,`xtype`) VALUES ('x-fa fa-plus','Vorlagen','toolbar','1','view_job_texts','jobtexttemplates') ; 
INSERT IGNORE INTO `ds_access` (`append`,`delete`,`read`,`role`,`table_name`,`write`) VALUES ('0','0','0','_default_','view_job_texts','0') ; 
INSERT IGNORE INTO `ds_access` (`append`,`delete`,`read`,`role`,`table_name`,`write`) VALUES ('0','0','0','administration','view_job_texts','0') ; 
REPLACE INTO `docsystem_ds` (`table_name`) VALUES ('view_job_texts') ; 
SET FOREIGN_KEY_CHECKS=1;