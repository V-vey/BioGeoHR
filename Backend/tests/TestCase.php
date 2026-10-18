<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use RuntimeException;

abstract class TestCase extends BaseTestCase
{
    /**
     * Runs before RefreshDatabase wipes the database. The tests may only ever touch the
     * separate test database (phpunit.xml), never the real one.
     */
    protected function setUpTraits()
    {
        $database = $this->app['db']->connection()->getDatabaseName();
        if ($database !== 'biogeohr_test') {
            throw new RuntimeException("Refusing to run tests on database '{$database}': only 'biogeohr_test' is allowed.");
        }

        return parent::setUpTraits();
    }
}
