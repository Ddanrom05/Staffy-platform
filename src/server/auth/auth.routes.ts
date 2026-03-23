import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { createUser, findAuthUserByEmail, findUserIdByEmail } from '../users/user.service';
import { SignInPayload, SignUpPayload, UserRole } from '../users/user.model';

const authRouter = Router();

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function normalizeSignUpPayload(rawBody: unknown): SignUpPayload | null {
  if (!rawBody || typeof rawBody !== 'object') {
    return null;
  }

  const body = rawBody as Record<string, unknown>;
  const fullName = typeof body['fullName'] === 'string' ? body['fullName'].trim() : '';
  const email = typeof body['email'] === 'string' ? body['email'].trim().toLowerCase() : '';
  const password = typeof body['password'] === 'string' ? body['password'] : '';

  if (!fullName || !email || !password) {
    return null;
  }

  if (!isValidEmail(email) || password.length < 8) {
    return null;
  }

  return { fullName, email, password };
}

function normalizeSignInPayload(rawBody: unknown): SignInPayload | null {
  if (!rawBody || typeof rawBody !== 'object') {
    return null;
  }

  const body = rawBody as Record<string, unknown>;
  const email = typeof body['email'] === 'string' ? body['email'].trim().toLowerCase() : '';
  const password = typeof body['password'] === 'string' ? body['password'] : '';

  if (!email || !password || !isValidEmail(email)) {
    return null;
  }

  return { email, password };
}

authRouter.post('/sign-in', async (request, response) => {
  try {
    const payload = normalizeSignInPayload(request.body);

    if (!payload) {
      response.status(400).json({ message: 'Correo o contraseña inválidos.' });
      return;
    }

    const user = await findAuthUserByEmail(payload.email);

    if (!user) {
      response.status(401).json({ message: 'Correo o contraseña incorrectos.' });
      return;
    }

    const passwordMatches = await bcrypt.compare(payload.password, user.passwordHash);

    if (!passwordMatches) {
      response.status(401).json({ message: 'Correo o contraseña incorrectos.' });
      return;
    }

    response.status(200).json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error('Error signing in:', error);
    response.status(500).json({ message: 'Error interno al iniciar sesión.' });
  }
});

authRouter.post('/sign-up', async (request, response) => {
  try {
    const defaultRole: UserRole = 'voluntario';
    const payload = normalizeSignUpPayload(request.body);

    if (!payload) {
      response.status(400).json({
        message: 'Datos inválidos. Verifica nombre, correo y contraseña (mínimo 8 caracteres).',
      });
      return;
    }

    const existingUserId = await findUserIdByEmail(payload.email);

    if (existingUserId) {
      response.status(409).json({ message: 'Este correo ya está registrado.' });
      return;
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);
    const userId = await createUser({
      fullName: payload.fullName,
      email: payload.email,
      password: payload.password,
      passwordHash,
      role: defaultRole,
    });

    response.status(201).json({
      id: userId,
      fullName: payload.fullName,
      email: payload.email,
      role: defaultRole,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    response.status(500).json({ message: 'Error interno al registrar usuario.' });
  }
});

export { authRouter };
