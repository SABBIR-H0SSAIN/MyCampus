<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('marketplace_listings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->integer('price');
            $table->string('condition');
            $table->string('category');
            $table->string('location');
            $table->string('phone');
            $table->json('images')->nullable();
            $table->unsignedBigInteger('views')->default(0);
            $table->boolean('is_sold')->default(false);
            $table->timestamps();
        });

        Schema::create('marketplace_favorites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('marketplace_listing_id')->constrained('marketplace_listings')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('marketplace_favorites');
        Schema::dropIfExists('marketplace_listings');
    }
};
