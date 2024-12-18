import bcrypt from "bcrypt";

export const hashValue = async (value: string, saltRounds?: number) => {
  return await bcrypt.hash(value, 10);
};

export const compareValue = async (value: string, hash: string) => {
  return bcrypt.compare(value, hash).catch(() => {
    return false;
  });
};
