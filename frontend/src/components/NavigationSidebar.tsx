import React from 'react';
import { Briefcase, Users, CreditCard, User } from 'lucide-react';
import { clsx } from 'clsx';

export const NavigationSidebar: React.FC = () => {
    const menuItems = [
        { icon: Briefcase, label: 'Empresa', active: false },
        { icon: Users, label: 'Funcionários', active: false },
        { icon: CreditCard, label: 'Crachá', active: true },
        { icon: User, label: 'Usuários', active: false },
    ];

    return (
        <aside className="w-[240px] bg-white border-r border-gray-200 flex flex-col shrink-0">
            {/* Company Logo Area */}
            <div className="h-[60px] flex items-center px-6 border-b border-gray-100">
                <span className="text-xl font-bold text-gray-800">Aegea</span>
            </div>

            {/* Menu */}
            <nav className="flex flex-col py-6 gap-1">
                {menuItems.map((item, index) => (
                    <button
                        key={index}
                        className={clsx(
                            "flex items-center gap-4 px-6 py-3 text-sm font-medium transition-colors w-full text-left border-l-4",
                            item.active
                                ? "bg-gray-100 text-gray-900 border-gray-600"
                                : "text-gray-500 hover:bg-gray-50 border-transparent hover:text-gray-900"
                        )}
                    >
                        <item.icon size={20} className={clsx(item.active ? "text-brand-indigo" : "text-gray-400")} />
                        {item.label}
                    </button>
                ))}
            </nav>
        </aside>
    );
};
