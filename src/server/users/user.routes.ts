import { Router } from 'express';
import {
  addUserSkillByEmail,
  deleteUserSkillByEmail,
  findUserBadgesByEmail,
  findUserProfileByEmail,
  findUserSkillsByEmail,
  findVolunteerHistoryByEmail,
  updateUserProfileByEmail,
} from './user.service';
import { UpdateProfilePayload } from './user.model';

const userRouter = Router();

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function toNullableString(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  return trimmed.slice(0, maxLength);
}

function normalizeUpdateProfilePayload(rawBody: unknown): { email: string; profile: UpdateProfilePayload } | null {
  if (!rawBody || typeof rawBody !== 'object') {
    return null;
  }

  const body = rawBody as Record<string, unknown>;
  const email = typeof body['email'] === 'string' ? body['email'].trim().toLowerCase() : '';

  if (!email || !isValidEmail(email)) {
    return null;
  }

  return {
    email,
    profile: {
      phone: toNullableString(body['phone'], 50),
      location: toNullableString(body['location'], 120),
      bio: toNullableString(body['bio'], 1000),
      photoUrl: toNullableString(body['photoUrl'], 30_000_000),
    },
  };
}

function normalizeSkillPayload(rawBody: unknown): { email: string; skill: string } | null {
  if (!rawBody || typeof rawBody !== 'object') {
    return null;
  }

  const body = rawBody as Record<string, unknown>;
  const email = typeof body['email'] === 'string' ? body['email'].trim().toLowerCase() : '';
  const skill = toNullableString(body['skill'], 120) ?? '';

  if (!email || !isValidEmail(email) || !skill) {
    return null;
  }

  return { email, skill };
}

function getEmailFromQuery(request: Parameters<typeof userRouter.get>[1] extends never ? never : any): string {
  return typeof request.query['email'] === 'string'
    ? request.query['email'].trim().toLowerCase()
    : '';
}

userRouter.get('/profile', async (request, response) => {
  try {
    const email =
      typeof request.query['email'] === 'string' ? request.query['email'].trim().toLowerCase() : '';

    if (!email || !isValidEmail(email)) {
      response.status(400).json({ message: 'Correo inválido.' });
      return;
    }

    const profile = await findUserProfileByEmail(email);

    if (!profile) {
      response.status(404).json({ message: 'Usuario no encontrado.' });
      return;
    }

    response.status(200).json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    response.status(500).json({ message: 'Error interno al obtener perfil.' });
  }
});

userRouter.put('/profile', async (request, response) => {
  try {
    const normalized = normalizeUpdateProfilePayload(request.body);

    if (!normalized) {
      response.status(400).json({ message: 'Datos de perfil inválidos.' });
      return;
    }

    const wasUpdated = await updateUserProfileByEmail(normalized.email, normalized.profile);

    if (!wasUpdated) {
      response.status(404).json({ message: 'Usuario no encontrado.' });
      return;
    }

    const updatedProfile = await findUserProfileByEmail(normalized.email);

    if (!updatedProfile) {
      response.status(404).json({ message: 'Usuario no encontrado.' });
      return;
    }

    response.status(200).json(updatedProfile);
  } catch (error) {
    console.error('Error updating profile:', error);
    response.status(500).json({ message: 'Error interno al actualizar perfil.' });
  }
});

userRouter.get('/skills', async (request, response) => {
  try {
    const email = getEmailFromQuery(request);

    if (!email || !isValidEmail(email)) {
      response.status(400).json({ message: 'Correo inválido.' });
      return;
    }

    const skills = await findUserSkillsByEmail(email);
    response.status(200).json(skills);
  } catch (error) {
    console.error('Error fetching skills:', error);
    response.status(500).json({ message: 'Error interno al obtener skills.' });
  }
});

userRouter.post('/skills', async (request, response) => {
  try {
    const payload = normalizeSkillPayload(request.body);

    if (!payload) {
      response.status(400).json({ message: 'Datos de skill inválidos.' });
      return;
    }

    const added = await addUserSkillByEmail(payload.email, payload.skill);

    if (!added) {
      response.status(404).json({ message: 'Usuario no encontrado.' });
      return;
    }

    const skills = await findUserSkillsByEmail(payload.email);
    response.status(201).json(skills);
  } catch (error) {
    console.error('Error creating skill:', error);
    response.status(500).json({ message: 'Error interno al guardar skill.' });
  }
});

userRouter.delete('/skills', async (request, response) => {
  try {
    const payload = normalizeSkillPayload(request.body);

    if (!payload) {
      response.status(400).json({ message: 'Datos de skill inválidos.' });
      return;
    }

    await deleteUserSkillByEmail(payload.email, payload.skill);
    const skills = await findUserSkillsByEmail(payload.email);
    response.status(200).json(skills);
  } catch (error) {
    console.error('Error deleting skill:', error);
    response.status(500).json({ message: 'Error interno al eliminar skill.' });
  }
});

userRouter.get('/history', async (request, response) => {
  try {
    const email = getEmailFromQuery(request);

    if (!email || !isValidEmail(email)) {
      response.status(400).json({ message: 'Correo inválido.' });
      return;
    }

    const history = await findVolunteerHistoryByEmail(email);
    response.status(200).json(history);
  } catch (error) {
    console.error('Error fetching volunteer history:', error);
    response.status(500).json({ message: 'Error interno al obtener historial.' });
  }
});

userRouter.get('/badges', async (request, response) => {
  try {
    const email = getEmailFromQuery(request);

    if (!email || !isValidEmail(email)) {
      response.status(400).json({ message: 'Correo inválido.' });
      return;
    }

    const badges = await findUserBadgesByEmail(email);
    response.status(200).json(badges);
  } catch (error) {
    console.error('Error fetching badges:', error);
    response.status(500).json({ message: 'Error interno al obtener badges.' });
  }
});

export { userRouter };
