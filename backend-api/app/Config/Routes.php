<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');
$routes->options('(:any)', 'Home::index'); // Catch-all OPTIONS for CORS preflight

$routes->group('api', function($routes) {
    // Public routes
    $routes->post('auth/login', 'Api\Auth::login');
    $routes->post('auth/register', 'Api\Auth::register');
    $routes->get('categories', 'Categories::index');
    $routes->get('reports', 'Reports::index');
    $routes->get('reports/(:num)', 'Reports::show/$1');

    // Protected routes
    $routes->group('', ['filter' => 'auth'], function($routes) {
        $routes->get('dashboard', 'Dashboard::index');
        $routes->post('categories', 'Categories::create');
        $routes->put('categories/(:num)', 'Categories::update/$1');
        $routes->delete('categories/(:num)', 'Categories::delete/$1');
        
        $routes->post('reports', 'Reports::create');
        
        $routes->put('reports/(:num)', 'Reports::update/$1');
        $routes->delete('reports/(:num)', 'Reports::delete/$1');
        
        $routes->post('reports/(:num)/comments', 'Comments::create/$1');
        $routes->delete('comments/(:num)', 'Comments::delete/$1');
    });
});
