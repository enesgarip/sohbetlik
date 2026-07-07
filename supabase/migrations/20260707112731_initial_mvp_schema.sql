create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  invite_code text not null unique,
  status text not null default 'waiting'
    check (status in ('waiting', 'answering', 'completed')),
  selected_level smallint not null default 1
    check (selected_level between 1 and 4),
  question_count smallint not null default 24
    check (question_count between 1 and 60),
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.participants (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null default auth.uid(),
  display_name text not null check (char_length(display_name) between 1 and 40),
  seat smallint not null check (seat in (1, 2)),
  is_host boolean not null default false,
  joined_at timestamptz not null default now(),
  unique (room_id, seat),
  unique (room_id, user_id)
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  level smallint not null check (level between 1 and 4),
  type text not null check (type in ('choice', 'either_or', 'slider')),
  prompt text not null,
  options jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.room_questions (
  room_id uuid not null references public.rooms(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete restrict,
  position smallint not null check (position > 0),
  primary key (room_id, question_id),
  unique (room_id, position)
);

create table public.answers (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  participant_id uuid not null references public.participants(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete restrict,
  answer_value jsonb not null,
  answered_at timestamptz not null default now(),
  unique (participant_id, question_id)
);

create table public.result_summaries (
  room_id uuid primary key references public.rooms(id) on delete cascade,
  summary jsonb not null,
  generated_at timestamptz not null default now()
);

create index rooms_invite_code_idx on public.rooms (invite_code);
create index participants_room_id_idx on public.participants (room_id);
create index participants_user_id_idx on public.participants (user_id);
create index room_questions_room_id_position_idx on public.room_questions (room_id, position);
create index answers_room_id_idx on public.answers (room_id);
create index answers_participant_id_idx on public.answers (participant_id);

grant usage on schema public to authenticated;
grant select, insert, update on public.rooms to authenticated;
grant select, insert, update on public.participants to authenticated;
grant select on public.questions to authenticated;
grant select, insert on public.room_questions to authenticated;
grant select, insert, update on public.answers to authenticated;
grant select, insert, update on public.result_summaries to authenticated;
grant all on public.rooms to service_role;
grant all on public.participants to service_role;
grant all on public.questions to service_role;
grant all on public.room_questions to service_role;
grant all on public.answers to service_role;
grant all on public.result_summaries to service_role;

alter table public.rooms enable row level security;
alter table public.participants enable row level security;
alter table public.questions enable row level security;
alter table public.room_questions enable row level security;
alter table public.answers enable row level security;
alter table public.result_summaries enable row level security;

create policy "Authenticated users can create rooms"
on public.rooms
for insert
to authenticated
with check ((select auth.uid()) = created_by);

create policy "Room members can read room shells"
on public.rooms
for select
to authenticated
using (
  created_by = (select auth.uid())
  or status in ('waiting', 'answering')
);

create policy "Room creators can update rooms"
on public.rooms
for update
to authenticated
using (created_by = (select auth.uid()))
with check (created_by = (select auth.uid()));

create policy "Authenticated users can join open rooms"
on public.participants
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.rooms r
    where r.id = participants.room_id
      and r.status in ('waiting', 'answering')
  )
);

create policy "Users can read their own participant row"
on public.participants
for select
to authenticated
using (
  user_id = (select auth.uid())
  or exists (
    select 1
    from public.rooms r
    where r.id = participants.room_id
      and r.created_by = (select auth.uid())
  )
);

create policy "Users can update their own participant row"
on public.participants
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "Authenticated users can read active questions"
on public.questions
for select
to authenticated
using (is_active);

create policy "Room creators can assign room questions"
on public.room_questions
for insert
to authenticated
with check (
  exists (
    select 1
    from public.rooms r
    where r.id = room_questions.room_id
      and r.created_by = (select auth.uid())
  )
);

create policy "Room members can read room questions"
on public.room_questions
for select
to authenticated
using (
  exists (
    select 1
    from public.rooms r
    where r.id = room_questions.room_id
      and (
        r.created_by = (select auth.uid())
        or r.status in ('waiting', 'answering')
      )
  )
);

create policy "Users can answer as their own participant"
on public.answers
for insert
to authenticated
with check (
  exists (
    select 1
    from public.participants p
    where p.id = answers.participant_id
      and p.room_id = answers.room_id
      and p.user_id = (select auth.uid())
  )
);

create policy "Users can update their own answers"
on public.answers
for update
to authenticated
using (
  exists (
    select 1
    from public.participants p
    where p.id = answers.participant_id
      and p.room_id = answers.room_id
      and p.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.participants p
    where p.id = answers.participant_id
      and p.room_id = answers.room_id
      and p.user_id = (select auth.uid())
  )
);

create policy "Room participants can read answers"
on public.answers
for select
to authenticated
using (
  exists (
    select 1
    from public.participants p
    where p.room_id = answers.room_id
      and p.user_id = (select auth.uid())
  )
  or exists (
    select 1
    from public.rooms r
    where r.id = answers.room_id
      and r.created_by = (select auth.uid())
  )
);

create policy "Room creators can store result summaries"
on public.result_summaries
for insert
to authenticated
with check (
  exists (
    select 1
    from public.rooms r
    where r.id = result_summaries.room_id
      and r.created_by = (select auth.uid())
  )
);

create policy "Room creators can update result summaries"
on public.result_summaries
for update
to authenticated
using (
  exists (
    select 1
    from public.rooms r
    where r.id = result_summaries.room_id
      and r.created_by = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.rooms r
    where r.id = result_summaries.room_id
      and r.created_by = (select auth.uid())
  )
);

create policy "Room participants can read result summaries"
on public.result_summaries
for select
to authenticated
using (
  exists (
    select 1
    from public.participants p
    where p.room_id = result_summaries.room_id
      and p.user_id = (select auth.uid())
  )
  or exists (
    select 1
    from public.rooms r
    where r.id = result_summaries.room_id
      and r.created_by = (select auth.uid())
  )
);

alter publication supabase_realtime add table public.rooms;
alter publication supabase_realtime add table public.participants;
alter publication supabase_realtime add table public.answers;
alter publication supabase_realtime add table public.result_summaries;
