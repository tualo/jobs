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
                $reporttypes = $db->singleRow('select * from blg_config where tabellenzusatz={type} ', ['type' => $matches['type']]);
                if (empty($reporttypes)) {
                    throw new \Exception('Report type not found');
                }
                $value = $db->singleValue('select max(id) x from blg_hdr_calculation where `jobid` = {jobid}', ['jobid' => $matches['id']], 'x');
                if ($value) {

                    $report = Report::get('calculation', $value);
                    App::result('success', true);
                    $report['reporttype'] = $matches['type'];
                    $report['report_title'] = $reporttypes['name'];
                    try {
                        $report['address'] = $db->singleValue('select address from  view_editor_relation_' . $matches['type'] . ' where referencenr = {referencenr} and costcenter = {costcenter}', $report, 'address');
                        $report['address_sql'] = $db->last_sql;
                    } catch (\Exception $e) {
                        App::result('msg', $e->getMessage());
                    }
                    App::result('report', $report);
                    App::result('reporttypes', $reporttypes);
                } else {
                    App::result('msg', 'No calculation found for the given job ID');
                }
            } catch (\Exception $e) {
                App::result('msg', $e->getMessage());
            }
        }, ['get'], true, [], self::scope());
    }
}
