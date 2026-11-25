delimiter //
create or replace function job_can_create_report(p_type varchar(255), p_jobid varchar(255)) returns json
begin
    declare v_result json;
    -- Implement your logic here to determine if the report can be created
    set v_result = json_object('success', false, 'msg', 'Not allowed', 'hasWarnings', false, 'warnings', json_array(),'errors', json_array()); -- Replace this with actual logic
    if p_type = 'angebot' then
        set v_result = json_object('success', true, 'msg', 'Kann erstellt werden', 'hasWarnings', false, 'warnings', json_array(),'errors', json_array());
    end if;


    if p_type = 'rechnung' then
        set v_result = json_object('success', true, 'msg', 'Kann erstellt werden', 'hasWarnings', false, 'warnings', json_array(),'errors', json_array());
        if (exists(select 1 from adressen where ( kundenkonto is null or kundenkonto='' ) and (kundennummer,kostenstelle) = (select kundennummer,kostenstelle from tualo_job where id = p_jobid))) then
            -- das object auf success false setzen und die fehlermeldung ergänzen, die alten werte im object beibehalten
            set v_result = json_set(v_result,
                    '$.success', false,
                    '$.msg', 'Das Kundenkonto ist nicht gesetzt',
                    '$.errors', json_array_append(json_extract(v_result, '$.errors'), '$', 'Das Kundenkonto ist nicht gesetzt')
            );
        end if;
        if (exists(select 1 from adressen where ( status<>1 ) and (kundennummer,kostenstelle) = (select kundennummer,kostenstelle from tualo_job where id = p_jobid))) then
            set v_result = json_set(v_result,
                    '$.success', false,
                    '$.msg', 'Die Adresse ist nicht aktiv',
                    '$.errors', json_array_append(json_extract(v_result, '$.errors'), '$', 'Die Adresse ist nicht aktiv')
            );
        end if;
        if (exists(select 1 from adressen where ( zahlungsziel=0 ) and (kundennummer,kostenstelle) = (select kundennummer,kostenstelle from tualo_job where id = p_jobid))) then
            set v_result = json_set(v_result,
                    '$.hasWarnings', true,
                    '$.msg', 'Das Zahlungsziel ist nicht gesetzt',
                    '$.warnings', json_array_append(json_extract(v_result, '$.warnings'), '$', 'Das Zahlungsziel ist nicht gesetzt')
            );
        end if;
    end if;
    

    return v_result;
end //
delimiter ;