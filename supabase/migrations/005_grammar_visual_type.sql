-- Allow grammar-word dynamic SVG visual type
ALTER TABLE ogden_words DROP CONSTRAINT IF EXISTS ogden_words_visual_type_check;
ALTER TABLE ogden_words ADD CONSTRAINT ogden_words_visual_type_check
  CHECK (visual_type IN ('operator', 'direction', 'grammar', 'image', 'fallback'));
