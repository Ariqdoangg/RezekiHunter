<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Food;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FoodController extends Controller
{
    // GET /api/foods
    public function index(Request $request)
    {
        $query = Food::with(['user:id,name', 'claimer:id,name'])
            ->orderBy('created_at', 'desc');

        // Filter by status (default: available)
        if ($request->has('status')) {
            $query->where('status', $request->status);
        } else {
            $query->where('status', 'available');
        }

        $foods = $query->get();

        return response()->json($foods);
    }

    // GET /api/foods/all (Admin - semua foods)
    public function all()
    {
        $foods = Food::with(['user:id,name', 'claimer:id,name'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($foods);
    }

    // POST /api/foods
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:5120',
        ]);

        $imageUrl = null;

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('foods', 'public');
            $imageUrl = asset('storage/' . $path);
        }

        $food = Food::create([
            'user_id' => $request->user()->id,
            'title' => $request->title,
            'description' => $request->description,
            'location' => $request->location,
            'image_url' => $imageUrl,
            'status' => 'available',
        ]);

        $food->load('user:id,name');

        return response()->json([
            'message' => 'Food posted successfully!',
            'food' => $food,
        ], 201);
    }

    // POST /api/foods/{id}/claim
    public function claim(Request $request, $id)
    {
        $food = Food::findOrFail($id);

        if ($food->status !== 'available') {
            return response()->json([
                'message' => 'Food is no longer available.',
            ], 409);
        }

        if ($food->user_id === $request->user()->id) {
            return response()->json([
                'message' => 'You cannot claim your own food.',
            ], 403);
        }

        $food->update([
            'status' => 'taken',
            'claimed_by' => $request->user()->id,
            'claimed_at' => now(),
        ]);

        $food->load(['user:id,name', 'claimer:id,name']);

        return response()->json([
            'message' => 'Food claimed successfully!',
            'food' => $food,
        ]);
    }

    // DELETE /api/foods/{id} (Admin only)
    public function destroy(Request $request, $id)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json([
                'message' => 'Unauthorized. Admin only.',
            ], 403);
        }

        $food = Food::findOrFail($id);

        // Delete image from storage
        if ($food->image_url) {
            $path = str_replace(asset('storage/'), '', $food->image_url);
            Storage::disk('public')->delete($path);
        }

        $food->delete();

        return response()->json([
            'message' => 'Food deleted successfully.',
        ]);
    }

    // GET /api/foods/stats (Admin dashboard)
    public function stats()
    {
        return response()->json([
            'total_foods' => Food::count(),
            'available' => Food::where('status', 'available')->count(),
            'taken' => Food::where('status', 'taken')->count(),
            'expired' => Food::where('status', 'expired')->count(),
        ]);
    }

    // GET /api/my-foods (User's own posts)
    public function myFoods(Request $request)
    {
        $foods = Food::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($foods);
    }
}
