<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('task_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['task_id', 'user_id']);
        });

        DB::table('tasks')
            ->whereNotNull('assignee_id')
            ->orderBy('id')
            ->chunkById(100, function ($tasks) {
                $rows = [];

                foreach ($tasks as $task) {
                    $rows[] = [
                        'task_id' => $task->id,
                        'user_id' => $task->assignee_id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }

                if ($rows) {
                    DB::table('task_user')->insertOrIgnore($rows);
                }
            });
    }

    public function down(): void
    {
        Schema::dropIfExists('task_user');
    }
};
