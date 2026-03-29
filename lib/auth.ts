export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("pelo menos 8 caracteres");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("uma letra maiúscula");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("uma letra minúscula");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("um número");
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push("um carácter especial");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

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

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export const rpgMessages = {
  success: {
    login: "Bem-vindo de volta! As portas do reino abriram-se para ti.",
    register: "Novo herói criado! Escolhe agora o teu destino.",
    profileCreated: "O teu perfil foi registado nos arquivos do reino.",
  },
  error: {
    invalidCredentials:
      "Este herói não existe ou a palavra-passe está incorreta.",
    emailExists:
      "Este email já está registado no reino. Tenta iniciar sessão ou usa outro.",
    weakPassword: "Palavra-passe fraca.",
    passwordMismatch: "As palavras-passe não coincidem.",
    noSession: "A sessão expirou. Inicia sessão novamente.",
    noUser: "Utilizador não encontrado nos registos.",
    noCharacter: "Tens de criar uma personagem para entrar no reino.",
    invalidCharacter: "Erro ao criar a personagem.",
    serverError: "Erro no Portal Arcano. Tenta novamente mais tarde.",
    incompleteForm: "Preenche todos os campos obrigatórios.",
  },
  warning: {
    expiredSession: "A tua sessão expirou. Inicia sessão novamente.",
    noCharacterFound:
      "Nenhuma personagem encontrada. Vais ser redirecionado para a criação de herói.",
  },
};
