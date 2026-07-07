-- Questions need a stable slug so the frontend question set (slug ids)
-- can map to database uuid primary keys used by answers/room_questions.
alter table public.questions
  add column slug text not null,
  add constraint questions_slug_key unique (slug);

insert into public.questions (slug, category, level, type, prompt, options) values
  ('daily-pace', 'Günlük yaşam', 1, 'either_or', 'Bir gün boş kalsa hangisi daha iyi hissettirir?', '[{"id":"outside","label":"Dışarı çıkıp keşfetmek"},{"id":"slow","label":"Evde sakin kalmak"}]'::jsonb),
  ('morning-night', 'Ritim', 1, 'either_or', 'Enerjin daha çok ne zaman açılır?', '[{"id":"morning","label":"Sabah"},{"id":"night","label":"Gece"}]'::jsonb),
  ('humor-style', 'Mizah', 1, 'choice', 'Seni en hızlı hangi mizah yakalar?', '[{"id":"dry","label":"Kuru ve zeki"},{"id":"absurd","label":"Absürt"},{"id":"story","label":"Hikayeli"},{"id":"playful","label":"Tatlı atışmalı"}]'::jsonb),
  ('travel-mode', 'Seyahat', 2, 'choice', 'Bir seyahatte ideal modun hangisine yakın?', '[{"id":"planned","label":"Planlı ve rahat"},{"id":"wandering","label":"Akışta gezmek"},{"id":"food","label":"Yemek odaklı"},{"id":"nature","label":"Doğa ve yürüyüş"}]'::jsonb),
  ('message-rhythm', 'İletişim', 2, 'slider', 'Mesajlaşmada gün içinde temas senin için ne kadar önemli?', '[{"id":"1","label":"1"},{"id":"2","label":"2"},{"id":"3","label":"3"},{"id":"4","label":"4"},{"id":"5","label":"5"}]'::jsonb),
  ('money-style', 'Para', 3, 'choice', 'Para konusunda kendini hangisine daha yakın görürsün?', '[{"id":"security","label":"Güvence önce gelir"},{"id":"experience","label":"Deneyime harcarım"},{"id":"balance","label":"Denge severim"},{"id":"growth","label":"Yatırım ve gelişim"}]'::jsonb),
  ('conflict-style', 'İlişki', 3, 'choice', 'Bir anlaşmazlıkta ilk ihtiyacın genelde ne olur?', '[{"id":"space","label":"Biraz alan"},{"id":"talk","label":"Hemen konuşmak"},{"id":"soften","label":"Önce yumuşamak"},{"id":"clarity","label":"Netlik kurmak"}]'::jsonb),
  ('future-year', 'Gelecek', 4, 'choice', 'Önümüzdeki bir yılda seni en çok heyecanlandıran alan hangisi?', '[{"id":"career","label":"Kariyer"},{"id":"relationship","label":"İlişkiler"},{"id":"health","label":"Sağlık ve rutin"},{"id":"adventure","label":"Yeni deneyimler"}]'::jsonb);

-- The old select policy only exposed a user's own participant row (plus the
-- host via created_by), so a guest could never see the host's progress.
-- Mirror the rooms shell policy: open rooms are readable by room visitors.
-- Note: MVP intentionally never sets status = 'completed' so guests keep
-- read access through the results screen.
drop policy "Users can read their own participant row" on public.participants;

create policy "Room members can read participants"
on public.participants
for select
to authenticated
using (
  user_id = (select auth.uid())
  or exists (
    select 1
    from public.rooms r
    where r.id = participants.room_id
      and (
        r.created_by = (select auth.uid())
        or r.status in ('waiting', 'answering')
      )
  )
);

-- Allow the "Yeni oda" reset flow to remove the room; children cascade.
grant delete on public.rooms to authenticated;

create policy "Room creators can delete their rooms"
on public.rooms
for delete
to authenticated
using (created_by = (select auth.uid()));
