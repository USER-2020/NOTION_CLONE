<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePageRequest;
use App\Http\Requests\UpdatePageRequest;
use App\Models\Block;
use App\Models\Page;
use App\Models\Project;
use App\Models\Workspace;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function show(Request $request, Page $page): Response
    {
        $this->authorize('view', $page);

        $page->load([
            'project:id,name,slug,color',
            'workspace:id,name',
            'parent:id,title,slug',
            'children:id,parent_id,project_id,title,slug,updated_at',
            'blocks',
        ]);

        $relatedPages = Page::query()
            ->visibleForUser($request->user())
            ->where('workspace_id', $page->workspace_id)
            ->when(
                $page->project_id,
                fn ($query) => $query->where('project_id', $page->project_id),
                fn ($query) => $query->whereNull('project_id')
            )
            ->orderByDesc('is_favorite')
            ->orderBy('title')
            ->get(['id', 'parent_id', 'project_id', 'title', 'slug', 'is_favorite', 'updated_at']);

        return Inertia::render('Pages/Show', [
            'page' => [
                'id' => $page->id,
                'slug' => $page->slug,
                'workspace_id' => $page->workspace_id,
                'workspace' => $page->workspace,
                'project_id' => $page->project_id,
                'project' => $page->project,
                'parent_id' => $page->parent_id,
                'parent' => $page->parent,
                'title' => $page->title,
                'excerpt' => $page->excerpt,
                'body' => $this->extractBody($page),
                'is_favorite' => $page->is_favorite,
                'children' => $page->children,
                'blocks' => $page->blocks->map(fn (Block $block) => [
                    'id' => $block->id,
                    'type' => $block->type,
                    'content' => $block->content_json['text'] ?? json_encode($block->content_json, JSON_UNESCAPED_UNICODE),
                    'position' => $block->position,
                ])->values(),
            ],
            'relatedPages' => $relatedPages,
            'projects' => Project::query()
                ->visibleForUser($request->user())
                ->where('workspace_id', $page->workspace_id)
                ->orderBy('name')
                ->get(['id', 'name']),
            'workspaces' => Workspace::query()
                ->visibleForUser($request->user())
                ->orderBy('name')
                ->get(['id', 'name']),
        ]);
    }

    public function store(StorePageRequest $request): RedirectResponse
    {
        $this->authorize('create', Page::class);

        $validated = $request->validated();
        $page = Page::create([
            ...collect($validated)->except(['body'])->all(),
            'slug' => $this->uniqueSlug($request->string('title')->toString()),
            'created_by' => $request->user()->id,
            'updated_by' => $request->user()->id,
        ]);

        $this->syncBodyBlock($page, $validated['body'] ?? null, $request->user()->id);

        return to_route('pages.show', $page)->with('success', 'Página creada correctamente.');
    }

    public function update(UpdatePageRequest $request, Page $page): RedirectResponse
    {
        $this->authorize('update', $page);

        $validated = $request->validated();

        $page->update([
            ...collect($validated)->except(['body'])->all(),
            'updated_by' => $request->user()->id,
        ]);

        $this->syncBodyBlock($page, $validated['body'] ?? null, $request->user()->id);

        return back()->with('success', 'Página guardada correctamente.');
    }

    public function destroy(Page $page): RedirectResponse
    {
        $this->authorize('delete', $page);

        $project = $page->project;
        $page->delete();

        return $project
            ? to_route('projects.show', $project)->with('success', 'Página eliminada correctamente.')
            : to_route('dashboard')->with('success', 'Página eliminada correctamente.');
    }

    private function extractBody(Page $page): string
    {
        $paragraph = $page->blocks->firstWhere('type', 'paragraph');

        return $paragraph?->content_json['text'] ?? '';
    }

    private function syncBodyBlock(Page $page, ?string $body, int $userId): void
    {
        $content = trim((string) $body);
        $paragraph = $page->blocks()->where('type', 'paragraph')->orderBy('position')->first();

        if ($content === '' && $paragraph) {
            $paragraph->delete();

            return;
        }

        if ($content === '') {
            return;
        }

        if ($paragraph) {
            $paragraph->update([
                'content_json' => ['text' => $content],
                'updated_by' => $userId,
            ]);

            return;
        }

        $nextPosition = (int) $page->blocks()->max('position') + 1;

        $page->blocks()->create([
            'parent_id' => null,
            'type' => 'paragraph',
            'content_json' => ['text' => $content],
            'position' => $nextPosition > 0 ? $nextPosition : 1,
            'created_by' => $userId,
            'updated_by' => $userId,
        ]);
    }

    private function uniqueSlug(string $title): string
    {
        $baseSlug = Str::slug($title);
        $slug = $baseSlug !== '' ? $baseSlug : 'pagina';
        $originalSlug = $slug;
        $suffix = 2;

        while (Page::query()->where('slug', $slug)->exists()) {
            $slug = "{$originalSlug}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }
}
