-- Run once in Supabase -> SQL Editor. Adds pincode to shops.
alter table shops add column if not exists pincode text;
create index if not exists shops_pincode_idx on shops (pincode);

-- Set the pincode of your test shop (Bhandup West = 400078)
update shops set pincode = '400078' where name = 'GANGA SHOP';
