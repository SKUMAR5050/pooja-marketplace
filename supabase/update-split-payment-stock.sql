-- Pooja Bazaar update: shop-wise orders, UPI pay QR, stock, brand, pack size, barcode, loose units.
-- Run this whole file once in Supabase -> SQL Editor -> New query -> Run

-- ---------- NEW COLUMNS ----------
alter table shops add column if not exists upi_id text;

alter table products add column if not exists brand text;
alter table products add column if not exists pack_size text;
alter table products add column if not exists barcode text;
alter table products add column if not exists stock_qty numeric;            -- empty = stock not tracked
alter table products add column if not exists step numeric not null default 1; -- smallest amount a customer can add (e.g. 0.25 kg)
create index if not exists products_barcode_idx on products (barcode);

-- quantities can now be fractions (0.5 kg, 2.5 m)
alter table order_items alter column qty type numeric;
alter table order_items add column if not exists unit text;
alter table order_items add column if not exists product_id uuid references products(id) on delete set null;

alter table orders add column if not exists paid boolean not null default false;

-- ---------- PLACE ORDER (one shop per call; stock is checked and reduced) ----------
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
  v_qty numeric;
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

  -- check items, check stock, add up the total, reduce stock
  for v_item in select * from jsonb_array_elements(p_items) loop
    select * into v_prod from products
      where id = (v_item->>'product_id')::uuid and shop_id = p_shop_id and in_stock
      for update;
    if not found then
      raise exception 'An item is no longer available';
    end if;
    v_qty := (v_item->>'qty')::numeric;
    if v_qty <= 0 or v_qty > 10000 then
      raise exception 'Invalid quantity';
    end if;
    if v_prod.stock_qty is not null then
      if v_prod.stock_qty < v_qty then
        raise exception 'Only % % of % left', v_prod.stock_qty, v_prod.unit, v_prod.name;
      end if;
      update products
        set stock_qty = stock_qty - v_qty,
            in_stock = (stock_qty - v_qty) > 0
        where id = v_prod.id;
    end if;
    v_subtotal := v_subtotal + round(v_prod.price * v_qty, 2);
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
    insert into order_items (order_id, product_id, product_name, price, qty, unit, note)
    values (
      v_order_id, v_prod.id,
      trim(coalesce(v_prod.brand || ' ', '') || v_prod.name || coalesce(' (' || v_prod.pack_size || ')', '')),
      v_prod.price, (v_item->>'qty')::numeric, v_prod.unit,
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

-- ---------- CUSTOMER ORDER LOOKUP (now also returns UPI id and paid status) ----------
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
    'paid', o.paid,
    'created_at', o.created_at,
    'shop_name', s.name,
    'shop_address', s.address,
    'shop_phone', s.phone,
    'shop_upi', s.upi_id,
    'items', coalesce((
      select jsonb_agg(jsonb_build_object('name', i.product_name, 'price', i.price, 'qty', i.qty, 'unit', i.unit, 'note', i.note))
      from order_items i where i.order_id = o.id
    ), '[]'::jsonb)
  )
  from orders o join shops s on s.id = o.shop_id
  where o.code = upper(trim(p_code));
$$;

-- ---------- CANCEL = PUT STOCK BACK ----------
create or replace function restore_stock_on_cancel() returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare r record;
begin
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    for r in
      select product_id, sum(qty) as q from order_items
      where order_id = new.id and product_id is not null group by product_id
    loop
      update products
        set stock_qty = stock_qty + r.q, in_stock = true
        where id = r.product_id and stock_qty is not null;
    end loop;
  end if;
  return new;
end;
$$;

drop trigger if exists orders_restore_stock on orders;
create trigger orders_restore_stock
  after update of status on orders
  for each row execute function restore_stock_on_cancel();

grant execute on function place_order(uuid, text, text, text, text, jsonb) to anon, authenticated;
grant execute on function get_order(text) to anon, authenticated;
