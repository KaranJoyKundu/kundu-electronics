-- Avatar writes are server-validated by the account upload API; keep browser access read-only.
drop policy if exists customer_avatars_owner_insert on storage.objects;
drop policy if exists customer_avatars_owner_update on storage.objects;
drop policy if exists customer_avatars_owner_delete on storage.objects;
