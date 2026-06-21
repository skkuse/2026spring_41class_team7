export type ProfileForm = {
  name: string;
  email: string;
  role: string;
  location: string;
  website: string;
};

export type SettingsFormProps = {
  form: ProfileForm;
  update: (key: keyof ProfileForm, value: string) => void;
  saved: string;
  onSave: () => void;
  loading?: boolean;
};
