create table rechnungsweg (
    id integer primary key,
    name varchar(100) not null
);

insert into rechnungsweg (id,name) values (1,'Post'),(2,'manuelle E-Mail'),(3,'automatische  E-Mail',4,'eigenes Portal');

alter table adressen add rechnungsweg integer default 1 not null;
alter table adressen add rechnungsweg_url varchar(255) default '';

alter table adressen add constraint `fk_adressen_rechnungsweg` foreign key (rechnungsweg) references rechnungsweg(id) on delete restrict on update cascade;

