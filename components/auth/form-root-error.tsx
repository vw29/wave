export function FormRootError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-destructive text-sm text-center">{message}</p>
  );
}
