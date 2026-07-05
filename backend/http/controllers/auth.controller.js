import * as authService from '../services/auth.service.js';
import { signupSchema, signinSchema } from '../schemas/auth.schema.js';

export const signup = async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }

  try {
    const result = await authService.signup(parsed.data);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const signin = async (req, res) => {
  const parsed = signinSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }

  try {
    const result = await authService.signin(parsed.data);
    res.json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};
