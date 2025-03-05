create database sensora;

\c sensora

create schema sensora;

create type sensora.avatar as enum ('Peashooter', 'Sunflower', 'Cherry Bomb', 'Wall-nut', 'Potato Mine', 'Snow Pea', 'Chomper', 'Marigold');

alter type sensora.avatar owner to postgres;

create type sensora.status as enum ('error', 'inactive', 'active', 'unknown');

alter type sensora.status owner to postgres;

create table sensora.users
(
    username   varchar                                             not null
        constraint users_pk
            primary key,
    mail       varchar                                             not null,
    password   varchar                                             not null,
    firstname  varchar                                             not null,
    lastname   varchar,
    avatar_ref sensora.avatar default 'Peashooter'::sensora.avatar not null,
    active     boolean        default false                        not null
);

alter table sensora.users
    owner to postgres;

create unique index users_mail_uindex
    on sensora.users (mail);

create table sensora.groups
(
    gid        varchar                                             not null
        constraint groups_pk
            primary key,
    name       varchar                                             not null,
    avatar_ref sensora.avatar default 'Peashooter'::sensora.avatar not null
);

alter table sensora.groups
    owner to postgres;

create table sensora.group_members
(
    "user"  varchar not null
        constraint group_members_users_username_fk
            references sensora.users
            on update cascade on delete cascade,
    "group" varchar not null
        constraint group_members_groups_gid_fk
            references sensora.groups
            on update cascade on delete cascade,
    constraint group_members_pk
        primary key ("group", "user")
);

alter table sensora.group_members
    owner to postgres;

create table sensora.rooms
(
    rid     varchar not null
        constraint rooms_pk
            primary key,
    name    varchar not null,
    "group" varchar
        constraint rooms_groups_gid_fk
            references sensora.groups
            on update cascade on delete set null,
    owner   varchar not null
        constraint rooms_users_username_fk
            references sensora.users
            on update cascade on delete cascade
);

alter table sensora.rooms
    owner to postgres;

create table sensora.plants
(
    pid     varchar not null
        constraint plants_pk
            primary key,
    name    varchar not null,
    note    text,
    variant varchar,
    avatar  varchar,
    room    varchar not null
        constraint plants_rooms_rid_fk
            references sensora.rooms
            on update cascade on delete cascade
);

alter table sensora.plants
    owner to postgres;

create table sensora.target_values
(
    tid   varchar          not null
        constraint target_values_pk
            primary key,
    value double precision not null,
    ilk   varchar          not null,
    plant varchar          not null
        constraint target_values_plants_pid_fk
            references sensora.plants
            on update cascade on delete cascade
);

alter table sensora.target_values
    owner to postgres;

create table sensora.sensors
(
    sid        varchar                                         not null
        constraint sensors_pk
            primary key,
    last_call  timestamp      default CURRENT_TIMESTAMP        not null,
    ilk        varchar                                         not null,
    unit       varchar,
    status     sensora.status default 'active'::sensora.status not null,
    plant      varchar
        constraint sensors_plants_pid_fk
            references sensora.plants
            on update cascade on delete set null,
    controller varchar                                         not null
);

alter table sensora.sensors
    owner to postgres;

create table sensora.controllers
(
    did    varchar not null
        constraint controllers_pk
            primary key,
    secret varchar not null,
    model  varchar,
    owner  varchar not null
        constraint controllers_users_username_fk
            references sensora.users
            on update cascade on delete cascade
);

alter table sensora.controllers
    owner to postgres;

create unique index controllers_secret_uindex
    on sensora.controllers (secret);

create table sensora.values
(
    vid       varchar                             not null
        constraint values_pk
            primary key,
    value     double precision                    not null,
    timestamp timestamp default CURRENT_TIMESTAMP not null,
    sensor    varchar                             not null
        constraint values_sensors_sid_fk
            references sensora.sensors,
    plant     varchar                             not null
        constraint values_plants_pid_fk
            references sensora.plants
);

alter table sensora.values
    owner to postgres;
