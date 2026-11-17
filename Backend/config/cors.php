<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'https://hpmhtxqk-5173.asse.devtunnels.ms',
    ],
    //http://localhost:5173
    //https://hpmhtxqk-5173.asse.devtunnels.ms/
    // pages on localhost or the local network may call the API (with the login cookie) only while developing;
    // on the real server (APP_ENV is not "local") only the origins listed above are allowed
    'allowed_origins_patterns' => env('APP_ENV', 'production') === 'local' ? [
    '#^http://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+)(:\d+)?$#',
    ] : [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
