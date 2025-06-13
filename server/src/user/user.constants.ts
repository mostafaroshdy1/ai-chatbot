export const userConstants = {
  stringMaxLength: {
    firstName: 50,
    lastName: 50,
    email: 255,
    password: 100,
  },

  stringMinLength: {
    firstName: 2,
    lastName: 2,
    email: 5,
    password: 8,
  },
} as const;
