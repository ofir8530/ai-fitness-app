"use client";
import RegisterForm from '../../components/RegisterForm';

export default function RegisterPage() {
  return (
    <main style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      alignItems: 'center', 
      justifyContent: 'center', // <--- התיקון כאן! שינינו ל-camelCase
      backgroundColor: '#f8fafc' 
    }}>
      <RegisterForm />
    </main>
  );
}