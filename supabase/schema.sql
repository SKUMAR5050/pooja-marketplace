-- Pooja Marketplace: run this whole file once in Supabase -> SQL Editor -> New query -> Run

create extension if not exists pgcrypto;

-- ---------- TABLES ----------
create table if not exists shops (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  area text,
  phone text,
  address text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops(id) on delete cascade,
  name text not null,
  category text not null default 'Other',
  price numeric(10,2) not null check (price >= 0),
  unit text not null default 'piece',
  in_stock boolean not null default true,
  is_kit boolean not null default false,
  image_url text,
  description text,
  created_at timestamptz not null default now()
);

-- What is inside a kit (shown to customers before they buy)
create table if not exists kit_items (
  id uuid primary key default gen_random_uuid(),
  kit_id uuid not null references products(id) on delete cascade,
  item_name text not null,
  qty numeric not null default 1,
  unit text not null default 'pc'
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  shop_id uuid not null references shops(id),
  customer_name text not null,
  customer_phone text not null,
  address text,
  fulfilment text not null check (fulfilment in ('pickup','delivery')),
  subtotal numeric(10,2) not null,
  status text not null default 'new' check (status in ('new','accepted','ready','completed','cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_name text not null,
  price numeric(10,2) not null,
  qty int not null check (qty > 0),
  note text
);

-- ---------- SECURITY (Row Level Security) ----------
alter table shops enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table kit_items enable row level security;

-- Shops: everyone can see active shops; owner manages own shop
drop policy if exists "shops public read" on shops;
create policy "shops public read" on shops for select using (is_active or owner_id = auth.uid());
drop policy if exists "shops owner insert" on shops;
create policy "shops owner insert" on shops for insert with check (owner_id = auth.uid());
drop policy if exists "shops owner update" on shops;
create policy "shops owner update" on shops for update using (owner_id = auth.uid());

-- Products: everyone can read; owner of the shop manages
drop policy if exists "products public read" on products;
create policy "products public read" on products for select using (true);
drop policy if exists "products owner write" on products;
create policy "products owner write" on products for all
  using (exists (select 1 from shops s where s.id = shop_id and s.owner_id = auth.uid()))
  with check (exists (select 1 from shops s where s.id = shop_id and s.owner_id = auth.uid()));

-- Kit contents: everyone can read; owner of the shop manages
drop policy if exists "kit_items public read" on kit_items;
create policy "kit_items public read" on kit_items for select using (true);
drop policy if exists "kit_items owner write" on kit_items;
create policy "kit_items owner write" on kit_items for all
  using (exists (select 1 from products p join shops s on s.id = p.shop_id where p.id = kit_id and s.owner_id = auth.uid()))
  with check (exists (select 1 from products p join shops s on s.id = p.shop_id where p.id = kit_id and s.owner_id = auth.uid()));

-- Orders: only the shop owner can read / update. Customers place orders via place_order() below.
drop policy if exists "orders owner read" on orders;
create policy "orders owner read" on orders for select
  using (exists (select 1 from shops s where s.id = shop_id and s.owner_id = auth.uid()));
drop policy if exists "orders owner update" on orders;
create policy "orders owner update" on orders for update
  using (exists (select 1 from shops s where s.id = shop_id and s.owner_id = auth.uid()));

drop policy if exists "order_items owner read" on order_items;
create policy "order_items owner read" on order_items for select
  using (exists (
    select 1 from orders o join shops s on s.id = o.shop_id
    where o.id = order_id and s.owner_id = auth.uid()
  ));

-- ---------- FUNCTIONS ----------
-- Customer places an order. Prices are read from the database (cannot be faked).
-- Delivery only allowed when order total is 500 or more; otherwise pickup with order code.
create or replace function place_order(
  p_shop_id uuid,
  p_name text,
  p_phone text,
  p_address text,
  p_fulfilment text,
  p_items jsonb
) returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_code text;
  v_subtotal numeric := 0;
  v_item jsonb;
  v_prod products%rowtype;
  v_qty int;
begin
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Your cart is empty';
  end if;
  if coalesce(trim(p_name), '') = '' or coalesce(trim(p_phone), '') = '' then
    raise exception 'Name and phone are required';
  end if;
  if p_fulfilment not in ('pickup','delivery') then
    raise exception 'Invalid option';
  end if;

  for v_item in select * from jsonb_array_elements(p_items) loop
    select * into v_prod from products
      where id = (v_item->>'product_id')::uuid and shop_id = p_shop_id and in_stock;
    if not found then
      raise exception 'An item is no longer available';
    end if;
    v_qty := (v_item->>'qty')::int;
    if v_qty < 1 or v_qty > 100 then
      raise exception 'Invalid quantity';
    end if;
    v_subtotal := v_subtotal + v_prod.price * v_qty;
  end loop;

  if p_fulfilment = 'delivery' then
    if v_subtotal < 500 then
      raise exception 'Free delivery is available on orders of 500 or more';
    end if;
    if coalesce(trim(p_address), '') = '' then
      raise exception 'Delivery address is required';
    end if;
  end if;

  loop
    v_code := 'PJ' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    exit when not exists (select 1 from orders where code = v_code);
  end loop;

  insert into orders (code, shop_id, customer_name, customer_phone, address, fulfilment, subtotal)
  values (v_code, p_shop_id, trim(p_name), trim(p_phone), nullif(trim(coalesce(p_address,'')), ''), p_fulfilment, v_subtotal)
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    select * into v_prod from products where id = (v_item->>'product_id')::uuid;
    insert into order_items (order_id, product_name, price, qty, note)
    values (
      v_order_id, v_prod.name, v_prod.price, (v_item->>'qty')::int,
      case
        when v_prod.is_kit then (
          select 'Includes: ' || string_agg(k.item_name || ' x' || k.qty || ' ' || k.unit, ', ')
          from kit_items k where k.kit_id = v_prod.id
        )
        when coalesce((v_item->>'extra')::boolean, false) then 'Extra with kit'
        else null
      end
    );
  end loop;

  return v_code;
end;
$$;

-- Customer checks an order using the order code (no phone/address returned).
create or replace function get_order(p_code text) returns jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'code', o.code,
    'status', o.status,
    'fulfilment', o.fulfilment,
    'subtotal', o.subtotal,
    'created_at', o.created_at,
    'shop_name', s.name,
    'shop_address', s.address,
    'shop_phone', s.phone,
    'items', coalesce((
      select jsonb_agg(jsonb_build_object('name', i.product_name, 'price', i.price, 'qty', i.qty, 'note', i.note))
      from order_items i where i.order_id = o.id
    ), '[]'::jsonb)
  )
  from orders o join shops s on s.id = o.shop_id
  where o.code = upper(trim(p_code));
$$;

grant execute on function place_order(uuid, text, text, text, text, jsonb) to anon, authenticated;
grant execute on function get_order(text) to anon, authenticated;
