<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FoodController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes (need token)
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/update-fcm', [AuthController::class, 'updateFcmToken']);

    // Foods
    Route::get('/foods', [FoodController::class, 'index']);
    Route::get('/foods/all', [FoodController::class, 'all']);
    Route::get('/foods/stats', [FoodController::class, 'stats']);
    Route::get('/my-foods', [FoodController::class, 'myFoods']);
    Route::post('/foods', [FoodController::class, 'store']);
    Route::post('/foods/{id}/claim', [FoodController::class, 'claim']);
    Route::delete('/foods/{id}', [FoodController::class, 'destroy']);
});
