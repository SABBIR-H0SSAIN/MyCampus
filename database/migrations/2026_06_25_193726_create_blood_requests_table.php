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
        Schema::create('blood_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('blood_group');
            $table->integer('units');
            $table->string('hospital');
            $table->dateTime('date_time');
            $table->string('contact');
            $table->enum('priority', ['Standard', 'Emergency'])->default('Standard');
            $table->text('notes')->nullable();
            $table->enum('status', ['Active', 'Resolved'])->default('Active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blood_requests');
    }
};
