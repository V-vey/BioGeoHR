<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Refuse a clock-in from a mock location
    |--------------------------------------------------------------------------
    |
    | The phone says whether Android reports the position as a mock location (a "mock location app" in the
    | developer options). With this on (the default) such a clock-in is refused and written to the audit log.
    | Set CLOCKIN_REFUSE_MOCK_LOCATION=false in .env only while testing on an emulator or with a fake-GPS
    | app, never on the real server.
    |
    */

    'refuse_mock_location' => (bool) env('CLOCKIN_REFUSE_MOCK_LOCATION', true),

];
