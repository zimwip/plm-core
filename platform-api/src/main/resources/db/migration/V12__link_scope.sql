-- delete_link and update_link now use LINK scope (PlmActionAspect resolves nodeCtx via linkId)
UPDATE action SET scope = 'LINK' WHERE action_code IN ('delete_link', 'update_link');
