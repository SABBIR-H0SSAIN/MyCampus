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
        Schema::create('roommate_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('location');
            $table->integer('budget'); // monthly rent
            $table->date('move_in_date');
            $table->json('lifestyle')->nullable(); // JSON array of tags
            $table->text('looking_for')->nullable();
            $table->text('description');
            $table->string('contact');
            $table->json('images')->nullable();
            $table->string('status')->default('Open'); // Open, Closed
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('roommate_posts');
    }
};
