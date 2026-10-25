<?php

namespace Tualo\Office\Jobs\Routes;

use Tualo\Office\Basic\Route as BasicRoute;
use Tualo\Office\Basic\TualoApplication as App;
use Tualo\Office\Basic\RouteSecurityHelper;
use Tualo\Office\Report\Report;

class TemplateReport extends \Tualo\Office\Basic\RouteWrapper
{
    public static function scope(): string
    {
        return 'basic';
    }
    public static function register()
    {
        BasicRoute::add('/jobs/template-report/(?P<type>\w+)/(?P<id>[\/.\w\d\-\_\.]+)', function ($matches) {
            App::contenttype('application/json');
            $db = App::get('session')->getDB();
            App::result('success', false);
            try {
                $value = $db->singleValue('select max(id) x from blg_hdr_calculation where `jobid` = {jobid}', ['jobid' => $matches['id']], 'x');
                if ($value) {

                    $report = Report::get('calculation', $value);
                    App::result('success', true);
                    $report['reporttype'] = $matches['type'];
                    try {
                        $report['address'] = $db->singleValue('select address from  view_editor_relation_' . $matches['type'] . ' where referencenr = {referencenr} and costcenter = {costcenter}', $report, 'address');
                        App::result('last_sql', $db->last_sql);
                    } catch (\Exception $e) {
                        App::result('msg', $e->getMessage());
                    }
                    App::result('report', $report);
                }
            } catch (\Exception $e) {
                App::result('msg', $e->getMessage());
            }
        }, ['get'], true, [], self::scope());
    }
}
