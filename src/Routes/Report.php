<?php

namespace Tualo\Office\Jobs\Routes;

use Tualo\Office\Basic\Route as BasicRoute;
use Tualo\Office\Basic\TualoApplication as App;
use Tualo\Office\Basic\RouteSecurityHelper;
use Tualo\Office\Jobs\Services\TimeService;

class Report extends \Tualo\Office\Basic\RouteWrapper
{
    public static function register()
    {
        BasicRoute::add('/jobs/report', function ($matches) {
            App::contenttype('application/json');
            App::result('success', true);
            try {
                $db = App::get('session')->getDB();
                // $db->direct('call eflow_report({uid})', $_GET);
            } catch (\Exception $e) {
                App::result('msg', $e->getMessage());
            }
        }, ['get'], true);
    }
}
