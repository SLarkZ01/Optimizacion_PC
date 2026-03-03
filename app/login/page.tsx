import { Suspense } from "react";
import LoginForm from "./LoginForm";

const LoginPage = () => {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
};

export default LoginPage;
