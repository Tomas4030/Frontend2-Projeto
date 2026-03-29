/**
 * Validação e helpers para autenticação
 */

export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
}

/**
 * Valida a password com regras fortes
 */
export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("pelo menos 8 caracteres");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("1 letra maiúscula");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("1 letra minúscula");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("1 número");
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push("1 carácter especial");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Toast curto e amigável
 */
export function formatPasswordErrors(errors: string[]): string {
  if (errors.length === 0) return "";

  if (errors.length === 1) {
    return `Falta ${errors[0]}.`;
  }

  if (errors.length === 2) {
    return `Faltam ${errors[0]} e ${errors[1]}.`;
  }

  const lastError = errors[errors.length - 1];
  const firstErrors = errors.slice(0, -1).join(", ");

  return `Faltam ${firstErrors} e ${lastError}.`;
}

/**
 * Valida email
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Mensagens temáticas de RPG
 */
export const rpgMessages = {
  success: {
    login: "Bem-vindo de volta! As portas do reino abriram-se para ti.",
    register: "Novo herói criado! Escolhe agora o teu destino.",
    character: "Que comece a tua aventura, guerreiro! ⚔️",
    profileCreated: "O teu perfil foi inscrito nos registos do reino.",
  },
  error: {
    invalidCredentials: "Este herói não existe ou a password está incorreta.",
    emailExists:
      "Este email de herói já existe no reino. Tenta entrar ou usa outro.",
    weakPassword: "Password fraca. Revê os requisitos abaixo.",
    passwordMismatch: "As passwords não coincidem.",
    noSession: "A sessão perdeu-se. Tenta fazer login novamente.",
    noUser: "Utilizador não encontrado nos registos.",
    noCharacter: "Tens de criar uma personagem para entrar no reino.",
    invalidCharacter: "Erro ao criar a personagem.",
    serverError: "Erro no Portal Arcano. Tenta mais tarde.",
    incompleteForm: "Preenche todos os campos.",
  },
  warning: {
    expiredSession: "A tua sessão expirou. Faz login novamente.",
    noCharacterFound:
      "Nenhuma personagem encontrada. Vais para a criação de herói.",
  },
};
