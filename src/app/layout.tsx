import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: "TextilPro - Sistema de Gestão para Malharias",
  description: "Sistema completo para gestão de malharias: produção, estoque, financeiro, manutenção e CRM. Organize seus dados com segurança e praticidade.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <ToastProvider>
          <div className="app-layout">
            <Sidebar />
            <main className="main-content">
              <header className="header">
                <div className="header-left">
                  <h2 className="header-title">TextilPro</h2>
                </div>
                <div className="header-right">
                  <div className="header-shortcut-hint">
                    <kbd>Ctrl</kbd> + <kbd>S</kbd> para salvar
                  </div>
                  <div className="header-user">
                    <div className="header-user-avatar">AD</div>
                    <span className="header-user-name">Admin</span>
                  </div>
                </div>
              </header>
              <div className="page-content">
                {children}
              </div>
            </main>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
