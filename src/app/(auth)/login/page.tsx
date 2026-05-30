import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 border-2 border-black bg-primary px-4 py-2 shadow-[4px_4px_0_0_#000]">
            <span className="text-2xl font-bold uppercase tracking-tight">Mundialin</span>
          </div>
          <CardTitle>Iniciar sesion</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder al portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
