import { profile } from '../../lib/mock-data';

export type ProfileForm = typeof profile;

export type SettingsFormProps = {
  form: ProfileForm;
  update: (key: keyof ProfileForm, value: string) => void;
  saved: string;
  onSave: () => void;
};
