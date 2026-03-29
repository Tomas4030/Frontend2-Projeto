"use client";

interface Props {
  password: string;
}

const PasswordStrength = ({ password }: Props) => {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];

  const score = checks.filter(Boolean).length;
  const progress = (score / checks.length) * 100;

  const getColor = () => {
    if (score <= 2) return "bg-red-500";
    if (score <= 4) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="mt-1">
      <div className="h-1 w-full rounded-full bg-[#1e293b] overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${getColor()}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="mt-1 text-[10px] text-slate-400">
        {score <= 2 && "Fraca"}
        {score > 2 && score <= 4 && "Média"}
        {score === 5 && "Forte"}
      </p>
    </div>
  );
};

export default PasswordStrength;