-- 7 günden eski odaları (ve CASCADE ile tüm ilişkili verileri) siler.
-- SECURITY DEFINER: RLS bypass eder, sadece yaş kriteri uygular.
create or replace function public.cleanup_stale_rooms()
returns integer
language sql
security definer
set search_path = public
as $$
  with deleted as (
    delete from public.rooms
    where created_at < now() - interval '7 days'
    returning id
  )
  select count(*)::integer from deleted;
$$;

grant execute on function public.cleanup_stale_rooms() to authenticated;
