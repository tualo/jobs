CREATE ALGORITHM = UNDEFINED DEFINER = `user_fb_wvd` @`%` SQL SECURITY DEFINER VIEW `view_job_groups` AS
select
    `session_user_fb_wvd`.`macc_users_groups`.`group` AS `group`
from
    `session_user_fb_wvd`.`macc_users_groups`
where
    `session_user_fb_wvd`.`macc_users_groups`.`group` <> '_default_'
    and `session_user_fb_wvd`.`macc_users_groups`.`id` = `fb_wvd`.`getSessionUser`()
group by
    `session_user_fb_wvd`.`macc_users_groups`.`group`