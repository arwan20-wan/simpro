<?php

namespace App\Policies;

use App\Models\ProjectPhoto;
use App\Models\User;

class ProjectPhotoPolicy
{
    public function delete(User $user, ProjectPhoto $photo): bool
    {
        return $photo->uploaded_by === $user->id || $photo->project->pj_user_id === $user->id;
    }
}
