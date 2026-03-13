'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
    {
        section: 'Principal',
        items: [
            { label: 'Dashboard', href: '/', icon: '📊' },
        ],
    },
    {
        section: 'Produção',
        items: [
            { label: 'Nitas (Ordens)', href: '/producao/nitas', icon: '📋' },
            { label: 'Fichas Técnicas', href: '/producao/fichas', icon: '📄' },
            { label: 'Registro Produção', href: '/producao/registro', icon: '⚙️' },
        ],
    },
    {
        section: 'Estoque',
        items: [
            { label: 'Estoque de Fios', href: '/estoque/fios', icon: '🧵' },
            { label: 'Estoque de Malhas', href: '/estoque/malhas', icon: '🧶' },
            { label: 'Movimentações', href: '/estoque/movimentacoes', icon: '🔄' },
        ],
    },
    {
        section: 'Cadastros',
        items: [
            { label: 'Máquinas', href: '/cadastros/maquinas', icon: '🏭' },
            { label: 'Tipos de Fio', href: '/cadastros/fios', icon: '🎨' },
            { label: 'Tipos de Malha', href: '/cadastros/malhas', icon: '📐' },
            { label: 'Clientes', href: '/cadastros/clientes', icon: '👥' },
            { label: 'Fornecedores', href: '/cadastros/fornecedores', icon: '🚚' },
        ],
    },
    {
        section: 'Manutenção',
        items: [
            { label: 'Manutenções', href: '/manutencao', icon: '🔧' },
        ],
    },
    {
        section: 'Financeiro',
        items: [
            { label: 'Contas Pagar/Receber', href: '/financeiro', icon: '💰' },
        ],
    },
    {
        section: 'Comercial',
        items: [
            { label: 'CRM Pipeline', href: '/crm', icon: '💼' },
            { label: 'Atividades', href: '/crm/atividades', icon: '📆' },
        ],
    },
    {
        section: 'Análise',
        items: [
            { label: 'Relatórios', href: '/relatorios', icon: '📈' },
        ],
    },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">T</div>
                <div>
                    <h1>TextilPro</h1>
                    <span>Sistema Malharia</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((section) => (
                    <div key={section.section} className="sidebar-section">
                        <div className="sidebar-section-title">{section.section}</div>
                        {section.items.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`sidebar-link ${pathname === item.href ||
                                    (item.href !== '/' && pathname.startsWith(item.href))
                                    ? 'active'
                                    : ''
                                    }`}
                            >
                                <span className="sidebar-link-icon">{item.icon}</span>
                                {item.label}
                            </Link>
                        ))}
                    </div>
                ))}
            </nav>

            <div className="sidebar-company">
                <div className="sidebar-company-avatar">M</div>
                <div className="sidebar-company-info">
                    <div className="sidebar-company-name">Malharia Demo</div>
                    <div className="sidebar-company-role">Administrador</div>
                </div>
            </div>
        </aside>
    );
}
