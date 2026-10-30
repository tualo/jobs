create table if not exists berichtsgruppe_1(
    id integer primary key,
    name varchar(255)
);
insert ignore into berichtsgruppe_1 (id,name) values (0,'unbekannt');
create table if not exists berichtsgruppe_2(
    id integer primary key,
    name varchar(255)
);
insert ignore into berichtsgruppe_2 (id,name) values (0,'unbekannt');

alter table artikelgruppen 
    add column if not exists berichtsgruppe_1_id integer default 0,
    add column if not exists berichtsgruppe_2_id integer default 0;

alter table artikelgruppen 
    add constraint  fk_artikelgruppen_berichtsgruppe_1 foreign key (berichtsgruppe_1_id) references berichtsgruppe_1(id);

alter table artikelgruppen 
    add constraint fk_artikelgruppen_berichtsgruppe_2 foreign key (berichtsgruppe_2_id) references berichtsgruppe_2(id);