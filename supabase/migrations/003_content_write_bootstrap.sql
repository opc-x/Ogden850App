-- Allow local pilot/sync scripts to write published content when only anon key is available.
-- Production: prefer SUPABASE_SERVICE_ROLE_KEY (bypasses RLS). These policies can be dropped later.

DROP POLICY IF EXISTS scenes_write ON scenes;
CREATE POLICY scenes_write ON scenes FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS scenes_update ON scenes;
CREATE POLICY scenes_update ON scenes FOR UPDATE USING (true);

DROP POLICY IF EXISTS dialogues_write ON dialogues;
CREATE POLICY dialogues_write ON dialogues FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS dialogues_update ON dialogues;
CREATE POLICY dialogues_update ON dialogues FOR UPDATE USING (true);
DROP POLICY IF EXISTS dialogues_delete ON dialogues;
CREATE POLICY dialogues_delete ON dialogues FOR DELETE USING (true);

DROP POLICY IF EXISTS dialogue_turns_write ON dialogue_turns;
CREATE POLICY dialogue_turns_write ON dialogue_turns FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS dialogue_turns_delete ON dialogue_turns;
CREATE POLICY dialogue_turns_delete ON dialogue_turns FOR DELETE USING (true);

DROP POLICY IF EXISTS turn_tokens_write ON turn_tokens;
CREATE POLICY turn_tokens_write ON turn_tokens FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS turn_tokens_delete ON turn_tokens;
CREATE POLICY turn_tokens_delete ON turn_tokens FOR DELETE USING (true);
