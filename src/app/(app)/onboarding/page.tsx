import { getOnboardingState } from '@/modules/onboarding/actions';
import { OnboardingForm } from './onboarding-form';

export const metadata = {
  title: 'Onboarding — AI English Learning Platform',
  description: 'Thiết lập mục tiêu và thời gian học tiếng Anh cá nhân hóa',
};

export default async function OnboardingPage() {
  const initialState = await getOnboardingState();

  return (
    <div className="min-h-screen bg-background text-foreground py-8 sm:py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <OnboardingForm initialState={initialState} />
      </div>
    </div>
  );
}
