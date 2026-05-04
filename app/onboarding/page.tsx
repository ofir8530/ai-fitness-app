import UserForm from '../../components/UserForm'; // מייבאים את הרכיב

export default function OnboardingPage() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
      <UserForm />
    </div>
  );
}