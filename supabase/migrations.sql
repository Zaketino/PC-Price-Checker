-- Run this in Supabase SQL editor to create tables

create table if not exists items (
id text primary key,
label text not null,
meta jsonb,
created_at timestamptz default now()
);


create table if not exists prices (
id bigserial primary key,
item_id text references items(id) on delete cascade,
vendor text,
price numeric,
currency text default 'EUR',
url text,
fetched_at timestamptz default now()
);


create table if not exists alerts (
id bigserial primary key,
item_id text references items(id) on delete cascade,
triggered_at timestamptz default now(),
old_price numeric,
new_price numeric,
rule jsonb
);


-- helper view for latest prices per item

create or replace view latest_prices as
select p.* from prices p
inner join (
select item_id, max(fetched_at) as maxf from prices group by item_id
) m on p.item_id = m.item_id and p.fetched_at = m.maxf;