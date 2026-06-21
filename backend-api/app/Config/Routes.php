<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');
$routes->options('(:any)', 'Home::index'); // Catch-all OPTIONS for CORS preflight
$routes->get('api/migrate', 'Migrate::index');

$routes->group('api', function($routes) {
    // Public routes
    $routes->post('auth/login', 'Api\Auth::login');
    $routes->post('auth/register', 'Api\Auth::register');
    
    // Public RESTful read-only routes
    $routes->resource('categories', ['only' => ['index', 'show']]);
    $routes->resource('reports', ['only' => ['index', 'show']]);

    // Protected routes
    $routes->group('', ['filter' => 'auth'], function($routes) {
        $routes->get('dashboard', 'Dashboard::index');
        
        // Protected RESTful write routes
        $routes->resource('categories', ['only' => ['create', 'update', 'delete']]);
        $routes->resource('reports', ['only' => ['create', 'update', 'delete']]);
        
        // Comments
        $routes->post('reports/(:num)/comments', 'Comments::create/$1');
        $routes->delete('comments/(:num)', 'Comments::delete/$1');
    });
});
