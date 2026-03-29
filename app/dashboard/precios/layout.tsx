export default function DashboardPreciosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Precios</h1>
        <p className="text-muted-foreground">
          Gestiona precios en USD por plan y region para checkout de PayPal.
        </p>
      </div>

      {children}
    </div>
  );
}
