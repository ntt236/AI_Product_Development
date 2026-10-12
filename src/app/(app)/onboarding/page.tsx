import { getOnboardingState } from '@/modules/onboarding/actions';
import { OnboardingForm } from './onboarding-form';

export const metadata = {
  title: 'Onboarding — AI English Learning Platform',
  description: 'Thiết lập mục tiêu và thời gian học tiếng Anh cá nhân hóa',
};

export default async function OnboardingPage() {
  const initialState = await getOnboardingState();

  return (
    <main className="container">
      <OnboardingForm initialState={initialState} />
    </main>
  );
}
