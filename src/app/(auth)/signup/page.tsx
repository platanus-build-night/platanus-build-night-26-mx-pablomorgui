import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SignupForm } from './signup-form';

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 border-2 border-black bg-primary px-4 py-2 shadow-[4px_4px_0_0_#000]">
            <span className="text-2xl font-bold uppercase tracking-tight">Mundialin</span>
          </div>
          <CardTitle>Crear cuenta</CardTitle>
          <CardDescription>
            Registrate para acceder a la inteligencia de precios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignupForm />
        </CardContent>
      </Card>
    </div>
  );
}
