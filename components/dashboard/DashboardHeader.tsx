"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Mapa de rutas a nombres legibles en español
const ROUTE_NAMES: Record<string, string> = {
  "/dashboard": "Resumen",
  "/dashboard/clientes": "Clientes",
  "/dashboard/compras": "Compras",
  "/dashboard/reservas": "Reservas",
};

const DashboardHeader = () => {
  const pathname = usePathname();
  const currentName = ROUTE_NAMES[pathname] ?? "Dashboard";
  const isSubPage = pathname !== "/dashboard";

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur-sm">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            {isSubPage ? (
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            ) : (
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            )}
          </BreadcrumbItem>
          {isSubPage ? (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{currentName}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          ) : null}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
};

export default DashboardHeader;
