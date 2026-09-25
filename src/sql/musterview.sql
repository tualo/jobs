
CREATE OR REPLACE VIEW `view_job_calculation_to_report` AS

 
with t as (
    
        select 'angebot' reporttype
        union 
        select 'rechnung' reporttype
    
),

 pos as (

    select
        p.*,
        t.reporttype
    from 
    t
    join `blg_pos_calculation` `p` on (

        (
            `p`.`zid` is null
            or `p`.`zid` = 0
        )
        and (
            `p`.`oid` is null
            or `p`.`oid` = 0
        )
    )


), a as (
select
    `p`.`use_in_offer` AS `use_row`,
    
    `p`.`use_real_amount` AS `use_real_amount`,

    `h`.`approved` AS `approved`,
    `j`.`id` AS `jobid`,
    `g`.`langtext` AS `langtext`,
    `j`.`job_number` AS `job_number`,
    `h`.`document_name` AS `document_name`,
    `r`.`name` AS `reporting_type`,
    `w`.`warengruppe` AS `warengruppe`,
    `p`.`use_in_offer` AS `use_in_offer`,
    `p`.`beleg` AS `beleg`,
    `p`.`gruppierung` AS `gruppierung`,
    `p`.`artikel` AS `artikel`,
    `p`.`anzahl` AS `anzahl`,
    `p`.`ist_anzahl` AS `ist_anzahl`,
    `g`.`gruppe` AS `gruppe`,
    `p`.`vdatum` AS `vdatum`,
    `p`.`netto` AS `netto`,

    if( `p`.`use_real_amount`=1 and p.reporttype='rechnung',
        `p`.`epreis` * `p`.`ist_anzahl`,
        `p`.`epreis` * `p`.`anzahl`

    ) AS `ist_netto`,
     p.reporttype,
    if( `p`.`use_real_amount`=1 and p.reporttype='rechnung',
        `p`.`epreis` * `p`.`ist_anzahl` * (1+`p`.`steuer`/100),
        `p`.`epreis` * `p`.`anzahl` * (1+`p`.`steuer`/100)

    ) AS `ist_brutto`,

    `p`.`epreis` AS `epreis`,
    `p`.`steuer` AS `steuer`,
    `p`.`brutto` AS `brutto`,
    `p`.`bemerkung` AS `bemerkung`,
    `p`.`pos` AS `position`,
    `p`.`steuersatz` AS `steuersatz`,
    `p`.`id` AS `id`,
    `p`.`leistungsbeschreibung` AS `leistungsbeschreibung`,
    `p`.`pos_text` AS `pos_text`,
    
    `p`.`gruppenmenge` AS `gruppenmenge`,
    `p`.`teilueberschrift` AS `teilueberschrift`
from
    (
        (
            (
                (
                    (
                        (
                            `tualo_job` `j`
                            join `blg_hdr_calculation` `h` on(
                                `j`.`order_date` > curdate() + interval -26 month
                                and `j`.`id` = `h`.`jobid`
                            )
                        )
                        join pos p
                            on(`p`.`beleg` = `h`.`id`)
                    )
                    join `artikelgruppen` `g` on(`g`.`gruppen_id` = `p`.`artikel`)
                )
                join `warengruppen` `w` on(`w`.`id` = `g`.`warengruppe`)
            )
            left join `type_of_service_reporting_service_type` `s` on(`s`.`type_of_service_link` = `g`.`gruppen_id`)
        )
        left join `reporting_service_type` `r` on(`r`.`id` = `s`.`reporting_service_type`)
    )
)
select a.* ,
if(a.`gruppierung` is null,
        a.`ist_netto`,
        sum(a.`ist_netto`) over (partition by a.`beleg`, a.`gruppierung`)
    ) AS `gruppenpreis_netto`,
    if(a.`gruppierung` is null,
        a.`ist_brutto`,
        sum(a.`ist_brutto`) over (partition by a.`beleg`, a.`gruppierung`)
    ) AS `gruppenpreis_brutto`
from a;