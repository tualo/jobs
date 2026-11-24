delimiter ;
alter table `blg_pos_calculation`  modify column  `einheit_symbol`  varchar(255);
alter table `blg_pos_angebot`  modify column  `einheit_symbol`  varchar(255);
alter table `blg_pos_rechnung`  modify column  `einheit_symbol`  varchar(255);
alter table mengeneinheiten add column if not exists decimal_precision integer default 2;
call fill_ds_column('mengeneinheiten');

CREATE OR REPLACE TRIGGER blg_pos_calculation_bu_einheit_symbol
BEFORE update
ON blg_pos_calculation FOR EACH ROW
BEGIN
    set new.einheit_symbol = ifnull((select max(symbol) from mengeneinheiten where id = new.einheit), '' );
END //

CREATE OR REPLACE TRIGGER blg_pos_calculation_bi_einheit_symbol
BEFORE insert
ON blg_pos_calculation FOR EACH ROW
BEGIN
    set new.einheit_symbol = ifnull((select max(symbol) from mengeneinheiten where id = new.einheit), '' );
END //