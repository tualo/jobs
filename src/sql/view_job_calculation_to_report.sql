CREATE OR REPLACE VIEW `view_job_calculation_to_report` AS 

with t as (
    select
        'angebot' AS `reporttype`
    union
    select
        'rechnung' AS `reporttype`
),
pos as (
    select
        `p`.`id` AS `id`,
        `p`.`beleg` AS `beleg`,
        `p`.`pos` AS `pos`,
        `p`.`artikel` AS `artikel`,
        `p`.`bemerkung` AS `bemerkung`,
        `p`.`zusatztext` AS `zusatztext`,
        `p`.`anzahl` AS `anzahl`,
        `p`.`epreis` AS `epreis`,
        `p`.`netto` AS `netto`,
        `p`.`brutto` AS `brutto`,
        `p`.`steuer` AS `steuer`,
        `p`.`steuersatz` AS `steuersatz`,
        `p`.`konto` AS `konto`,
        `p`.`referenz` AS `referenz`,
        `p`.`bezugsnebenkosten` AS `bezugsnebenkosten`,
        `p`.`gewicht` AS `gewicht`,
        `p`.`einheit` AS `einheit`,
        `p`.`einheit_symbol` AS `einheit_symbol`,
        `p`.`einheit_faktor` AS `einheit_faktor`,
        `p`.`vdatum` AS `vdatum`,
        `p`.`handwerkeranteil` AS `handwerkeranteil`,
        `p`.`ekpreis` AS `ekpreis`,
        `p`.`ekpreis_summe` AS `ekpreis_summe`,
        `p`.`gldpreis` AS `gldpreis`,
        `p`.`gldpreis_summe` AS `gldpreis_summe`,
        `p`.`einspeiserkennzeichen` AS `einspeiserkennzeichen`,
        `p`.`fremdbezeichnung` AS `fremdbezeichnung`,
        `p`.`preistyp` AS `preistyp`,
        `p`.`bereich` AS `bereich`,
        `p`.`kombiartikel` AS `kombiartikel`,
        `p`.`zzusatz` AS `zzusatz`,
        `p`.`zid` AS `zid`,
        `p`.`vzusatz` AS `vzusatz`,
        `p`.`vid` AS `vid`,
        `p`.`rate` AS `rate`,
        `p`.`base_purchase_price` AS `base_purchase_price`,
        `p`.`total_purchase_price` AS `total_purchase_price`,
        `p`.`markup` AS `markup`,
        `p`.`markup_percent` AS `markup_percent`,
        `p`.`selling_price` AS `selling_price`,
        `p`.`total_selling_price` AS `total_selling_price`,
        `p`.`markup_discount_perc` AS `markup_discount_perc`,
        `p`.`offerprice` AS `offerprice`,
        `p`.`contrimargin` AS `contrimargin`,
        `p`.`contrimargin_percent` AS `contrimargin_percent`,
        `p`.`block_link` AS `block_link`,
        `p`.`variant_link` AS `variant_link`,
        `p`.`circulation` AS `circulation`,
        `p`.`use_in_document` AS `use_in_document`,
        `p`.`use_in_invoice` AS `use_in_invoice`,
        `p`.`purchase_price` AS `purchase_price`,
        `p`.`urno` AS `urno`,
        `p`.`tos_link` AS `tos_link`,
        `p`.`calcorvariant` AS `calcorvariant`,
        `p`.`categorie` AS `categorie`,
        `p`.`zuschlag` AS `zuschlag`,
        `p`.`gruppierung` AS `gruppierung`,
        `p`.`listenpreis_vk` AS `listenpreis_vk`,
        `p`.`listenpreis_ek` AS `listenpreis_ek`,
        if (`p`.`leistungsbeschreibung` is null, ''
        
        , `p`.`leistungsbeschreibung`) AS `leistungsbeschreibung`,
        `p`.`gruppierungen` AS `gruppierungen`,
        `p`.`use_in_offer` AS `use_in_offer`,
        `p`.`ist_anzahl` AS `ist_anzahl`,
        `p`.`use_in_invoice_n` AS `use_in_invoice_n`,
        `p`.`use_real_amount` AS `use_real_amount`,
        `p`.`edit_markup` AS `edit_markup`,
        `p`.`pos_text` AS `pos_text`,
        `p`.`teilueberschrift` AS `teilueberschrift`,
        `p`.`gruppenpreis_netto` AS `gruppenpreis_netto`,
        `p`.`gruppenpreis_brutto` AS `gruppenpreis_brutto`,
        `p`.`gruppenmenge` AS `gruppenmenge`,
        `p`.`xzusatz` AS `xzusatz`,
        `p`.`xid` AS `xid`,
        `p`.`approved` AS `approved`,
        `p`.`ozusatz` AS `ozusatz`,
        `p`.`oid` AS `oid`,
        `p`.`ist_netto` AS `ist_netto`,
        `p`.`ist_brutto` AS `ist_brutto`,
        `p`.`angebot_title` AS `angebot_title`,
        `p`.`rechnung_title` AS `rechnung_title`,
        `t`.`reporttype` AS `reporttype`
    from
        (
            `t`
            join `blg_pos_calculation` `p` on(
                (
                    `p`.`zid` is null
                    or `p`.`zid` = 0
                )
                and (
                    `p`.`oid` is null
                    or `p`.`oid` = 0
                )
            )
            left join `blg_pos_calculation` `l` on(
        )
),
a as (
    select
        `p`.`use_in_offer` AS `use_row`,
        `p`.`use_real_amount` AS `use_real_amount`,
        `h`.`approved` AS `approved`,
        `j`.`id` AS `jobid`,
        `g`.`langtext` AS `langtext`,
        `g`.`kurztext` AS `kurztext`,
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
        if(
            `p`.`use_real_amount` = 1
            and `p`.`reporttype` = 'rechnung',
            `p`.`epreis` * `p`.`ist_anzahl`,
            `p`.`epreis` * `p`.`ist_anzahl`
        ) AS `ist_netto`,
        `p`.`reporttype` AS `reporttype`,
        if(
            `p`.`use_real_amount` = 1
            and `p`.`reporttype` = 'rechnung',
            `p`.`epreis` * `p`.`ist_anzahl` * (1 + `p`.`steuersatz` / 100),
            `p`.`epreis` * `p`.`ist_anzahl` * (1 + `p`.`steuersatz` / 100)
        ) AS `ist_brutto`,
        `p`.`epreis` AS `epreis`,
        `p`.`netto` * `p`.`steuersatz` / 100 AS `steuer`,
        `p`.`netto` * (1 + `p`.`steuersatz` / 100) AS `brutto`,
        `p`.`bemerkung` AS `bemerkung`,
        `p`.`pos` AS `pos`,
        `p`.`pos` AS `position`,
        `p`.`steuersatz` AS `steuersatz`,
        `p`.`id` AS `id`,
        `p`.`leistungsbeschreibung` AS `leistungsbeschreibung`,
        `p`.`pos_text` AS `pos_text`,
        `p`.`gruppenmenge` AS `gruppenmenge`,
        `p`.`angebot_title` AS `angebot_title`,
        `p`.`rechnung_title` AS `rechnung_title`,
        `p`.`teilueberschrift` AS `teilueberschrift`,

        `p`.`gruppenpreis_netto` AS `gruppenpreis_netto`,
        `p`.`gruppenpreis_brutto` AS `gruppenpreis_brutto`,
        `h`.`zeitraum_von` AS `zeitraum_von`,
        `h`.`zeitraum_bis` AS `zeitraum_bis`
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
                            join `pos` `p` on(`p`.`beleg` = `h`.`id`)
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
select
    `a`.`use_row` AS `use_row`,
    `a`.`use_real_amount` AS `use_real_amount`,
    `a`.`approved` AS `approved`,
    `a`.`jobid` AS `jobid`,
    `a`.`langtext` AS `langtext`,
    `a`.`kurztext` AS `kurztext`,
    `a`.`job_number` AS `job_number`,
    `a`.`document_name` AS `calculation_name`,
    if(
        `a`.`reporttype` = 'angebot',
        `a`.`angebot_title`,
        `a`.`rechnung_title`
    ) AS `document_name`,
    `a`.`reporting_type` AS `reporting_type`,
    `a`.`warengruppe` AS `warengruppe`,
    `a`.`use_in_offer` AS `use_in_offer`,
    `a`.`beleg` AS `beleg`,
    `a`.`gruppierung` AS `gruppierung`,
    `a`.`artikel` AS `artikel`,
    `a`.`anzahl` AS `anzahl`,
    `a`.`ist_anzahl` AS `ist_anzahl`,
    `a`.`gruppe` AS `gruppe`,
    `a`.`vdatum` AS `vdatum`,
    `a`.`netto` AS `netto`,
    `a`.`ist_netto` AS `ist_netto`,
    `a`.`reporttype` AS `reporttype`,
    `a`.`ist_brutto` AS `ist_brutto`,
    `a`.`epreis` AS `epreis`,
    `a`.`steuer` AS `steuer`,
    `a`.`brutto` AS `brutto`,
    `a`.`bemerkung` AS `bemerkung`,
    `a`.`pos` AS `pos`,
    `a`.`pos` AS `position`,
    `a`.`steuersatz` AS `steuersatz`,
    `a`.`id` AS `id`,
    `a`.`leistungsbeschreibung` AS `leistungsbeschreibung`,
    `a`.`pos_text` AS `pos_text`,
    `a`.`gruppenmenge` AS `gruppenmenge`,
    `a`.`angebot_title` AS `angebot_title`,
    `a`.`rechnung_title` AS `rechnung_title`,
    `a`.`teilueberschrift` AS `teilueberschrift`,
    if(
        `a`.`reporttype` = 'angebot',
        if(
            `a`.`gruppierung` is null,
            `a`.`netto`,
            sum(`a`.`netto`) over (partition by `a`.`reporttype`,`a`.`beleg`, `a`.`gruppierung`)
        )
        ,
        if(
            `a`.`gruppierung` is null,
            `a`.`ist_netto`,
            sum(`a`.`ist_netto`) over (partition by `a`.`reporttype`,`a`.`beleg`, `a`.`gruppierung`)
        )
    ) AS `gruppenpreis_netto`,
    if(
        `a`.`reporttype` = 'angebot',
        if(
            `a`.`gruppierung` is null,
            `a`.`brutto`,
            sum(`a`.`brutto`) over (partition by `a`.`reporttype`,`a`.`beleg`, `a`.`gruppierung`)
        )
        ,
        if(
            `a`.`gruppierung` is null,
            `a`.`ist_brutto`,
            sum(`a`.`ist_brutto`) over (partition by `a`.`reporttype`,`a`.`beleg`, `a`.`gruppierung`)
        )
     ) AS `gruppenpreis_brutto`,
    `a`.`zeitraum_von` AS `zeitraum_von`,
    `a`.`zeitraum_bis` AS `zeitraum_bis`
from
    `a`