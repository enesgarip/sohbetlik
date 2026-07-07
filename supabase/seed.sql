insert into public.questions (id, category, level, type, prompt, options)
values
  (
    '00000000-0000-4000-8000-000000000101',
    'Günlük yaşam',
    1,
    'either_or',
    'Bir gün boş kalsa hangisi daha iyi hissettirir?',
    '[{"id":"outside","label":"Dışarı çıkıp keşfetmek"},{"id":"slow","label":"Evde sakin kalmak"}]'::jsonb
  ),
  (
    '00000000-0000-4000-8000-000000000102',
    'Ritim',
    1,
    'either_or',
    'Enerjin daha çok ne zaman açılır?',
    '[{"id":"morning","label":"Sabah"},{"id":"night","label":"Gece"}]'::jsonb
  ),
  (
    '00000000-0000-4000-8000-000000000103',
    'Mizah',
    1,
    'choice',
    'Seni en hızlı hangi mizah yakalar?',
    '[{"id":"dry","label":"Kuru ve zeki"},{"id":"absurd","label":"Absürt"},{"id":"story","label":"Hikayeli"},{"id":"playful","label":"Tatlı atışmalı"}]'::jsonb
  ),
  (
    '00000000-0000-4000-8000-000000000104',
    'İletişim',
    2,
    'slider',
    'Mesajlaşmada gün içinde temas senin için ne kadar önemli?',
    '[{"id":"1","label":"1"},{"id":"2","label":"2"},{"id":"3","label":"3"},{"id":"4","label":"4"},{"id":"5","label":"5"}]'::jsonb
  )
on conflict (id) do nothing;
