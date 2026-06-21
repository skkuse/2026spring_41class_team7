export type ProfileForm = {
  name: string;
  email: string;
  role: string;
  location: string;
  website: string;
  allowContact: boolean;
};

export type SettingsFormProps = {
  form: ProfileForm;
  update: (key: keyof ProfileForm, value: string | boolean) => void;
  onToggleAllowContact: (value: boolean) => void;
  saved: string;
  onSave: () => void;
  saving: boolean;
  savingContact: boolean;
  loading?: boolean;
};
