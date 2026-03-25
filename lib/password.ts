import argon2 from "argon2";

const ARGON2_OPTIONS: Parameters<typeof argon2.hash>[1] = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16,
  timeCost: 3,
  parallelism: 1,
};

export function hashPassword(password: string) {
  return argon2.hash(password, ARGON2_OPTIONS);
}
