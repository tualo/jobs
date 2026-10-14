<?php

namespace Tualo\Office\Jobs\Routes;

use Tualo\Office\Basic\Route as BasicRoute;
use Tualo\Office\Basic\TualoApplication as App;
use Tualo\Office\Basic\RouteSecurityHelper;
use Tualo\Office\Jobs\Services\TimeService;

class CanSave extends \Tualo\Office\Basic\RouteWrapper
{
    public static function scope(): string
    {
        return 'basic';
    }
    public static function register()
    {
        BasicRoute::add('/jobs/cansave/(?P<type>\w+)', function ($matches) {
            App::contenttype('application/json');
            $db = App::get('session')->getDB();
            $type = $matches['type'];
            App::result('success', false);
            try {
                $value = $db->singleValue('select `group` from view_session_allowed_groups where `group` like "job_save_' . $type . '"', [], 'group');
                if ($value) App::result('success', true);
            } catch (\Exception $e) {
                App::result('msg', $e->getMessage());
            }
        }, ['get'], true, [], self::scope());
    }
}
