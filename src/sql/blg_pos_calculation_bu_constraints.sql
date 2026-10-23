CREATE OR REPLACE TRIGGER blg_pos_calculation_bu_constraints
before update  
ON blg_pos_calculation FOR EACH ROW
BEGIN

    if (new.anzahl<>old.ist_anzahl and (new.zid is not null or new.oid is not null or new.xid is not null)) then
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Die Ist-Anzahl darf nicht mehr geändert werden (blg_pos_calculation_bu_constraints)';
    end if;

    if (new.anzahl<>old.anzahl and new.oid is not null) then
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Die Anzahl darf nicht mehr geändert werden (blg_pos_calculation_bu_constraints)';
    end if;


    if (new.artikel<>old.artikel and (new.zid is not null or new.oid is not null or new.xid is not null)) then
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Der Artikel darf nicht mehr geändert werden (blg_pos_calculation_bu_constraints)';
    end if;
    if (new.epreis<>old.epreis and (new.zid is not null or new.oid is not null or new.xid is not null)) then
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Der Einzelpreis darf nicht mehr geändert werden (blg_pos_calculation_bu_constraints)';
    end if;

END