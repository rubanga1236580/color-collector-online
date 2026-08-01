import { useState } from 'react';

type PlayerRegisterScreenProps = {
  onRegister: (name: string) => Promise<void>;
};

const titleStyle = {
  textAlign: 'center' as const,
  fontSize: 24,
  fontWeight: 700,
  margin: '0 0 12px',
};

const panelStyle = {
  maxWidth: 420,
  margin: '0 auto 16px',
  padding: 16,
  borderRadius: 12,
  border: '2px solid #1f2937',
  background: '#ffffff',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
};

const inputStyle = {
  width: '100%',
  height: 42,
  padding: '0 12px',
  borderRadius: 10,
  border: '1px solid #94a3b8',
  fontSize: 14,
  color: '#111827',
  boxSizing: 'border-box' as const,
};

const buttonStyle = {
  minHeight: 42,
  padding: '0 14px',
  border: '1px solid #0f172a',
  borderRadius: 10,
  color: '#111827',
  fontWeight: 700,
  fontSize: 14,
  cursor: 'pointer',
  background: '#dbeafe',
};

export default function PlayerRegisterScreen({ onRegister }: PlayerRegisterScreenProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmed = name.trim();

    if (trimmed.length < 1 || trimmed.length > 16) {
      setError('プレイヤー名は1〜16文字で入力してください');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onRegister(trimmed);
    } catch {
      setError('プレイヤー登録に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={panelStyle}>
      <h2 style={titleStyle}>👤 プレイヤー登録</h2>

      <div style={{ fontSize: 14, color: '#334155', marginBottom: 6 }}>
        プレイヤー名
      </div>

      <input
        type="text"
        value={name}
        maxLength={16}
        onChange={(event) => setName(event.target.value)}
        style={inputStyle}
        placeholder="1〜16文字で入力"
      />

      {error && (
        <div style={{ color: '#dc2626', fontSize: 14, marginTop: 8 }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <button
          type="button"
          onClick={() => { void handleSubmit(); }}
          disabled={isSubmitting}
          style={buttonStyle}
        >
          ゲームを始める
        </button>
      </div>
    </div>
  );
}
