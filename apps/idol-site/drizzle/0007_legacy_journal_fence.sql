-- Old deployed Feishu finalizers must not alter a journal after source freeze.
-- Native saves append complete journal rows atomically; they never UPDATE them.
CREATE TRIGGER idol_legacy_journal_update_gate BEFORE UPDATE ON idol_saves
WHEN EXISTS (SELECT 1 FROM idol_storage_control WHERE id = 'main' AND mode <> 'feishu')
BEGIN SELECT RAISE(ABORT, 'native_storage_cutover'); END;
