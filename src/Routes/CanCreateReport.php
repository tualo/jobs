<?php

namespace Tualo\Office\Jobs\Routes;

use Tualo\Office\Basic\Route as BasicRoute;
use Tualo\Office\Basic\TualoApplication as App;
use Tualo\Office\Basic\RouteSecurityHelper;
use Tualo\Office\Jobs\Services\TimeService;

class CanCreateReport extends \Tualo\Office\Basic\RouteWrapper
{
    public static function scope(): string
    {
        return 'basic';
    }
    public static function register()
    {
        BasicRoute::add('/jobs/cancreatereport/(?P<type>\w+)/(?P<jobid>[\w\-\.]+)', function ($matches) {
            App::contenttype('application/json');
            $db = App::get('session')->getDB();
            $type = preg_replace('/[^a-zA-Z0-9_\-]/', '', $matches['type']);

            App::result('success', false);
            App::result('hasWarnings', false);
            App::result('warnings', []);
            App::result('errors', []);
            try {
                $value = $db->singleValue('select job_can_create_report({type}, {jobid}) val', $matches, 'val');
                if (!is_null($value) && $value !== false) {
                    $data = json_decode($value, true);
                    if (is_array($data)) {
                        App::result('success', (bool)($data['success'] ?? false));
                        App::result('msg', (string)($data['msg'] ?? ''));
                        App::result('hasWarnings', (bool)($data['hasWarnings'] ?? false) || !empty($data['warnings']));
                        App::result('warnings', is_array($data['warnings'] ?? null) ? $data['warnings'] : []);
                        App::result('errors', is_array($data['errors'] ?? null) ? $data['errors'] : []);
                    }
                }
            } catch (\Exception $e) {
                App::result('msg', $e->getMessage());
            }
        }, ['get'], true, [], self::scope());
    }
}
