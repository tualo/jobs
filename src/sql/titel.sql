alter table blg_pos_calculation add if not exists angebot_title varchar(30);
alter table blg_pos_calculation add if not exists rechnung_title varchar(30);

alter table blg_hdr_angebot add if not exists document_name varchar(30) default '';
alter table blg_hdr_rechnung add if not exists document_name varchar(30) default '';

call fill_ds_column('blg_pos_calculation');
call fill_ds_column('blg_hdr_angebot');
call fill_ds_column('blg_hdr_rechnung');

