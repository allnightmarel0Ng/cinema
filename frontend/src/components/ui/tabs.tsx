// src/components/ui/tabs.tsx (реализация компонентов вкладок)
import * as React from 'react';

interface TabsProps {
    defaultValue: string;
    className?: string;
    children: React.ReactNode;
}

export const Tabs = ({ defaultValue, className, children }: TabsProps) => {
    const [activeTab, setActiveTab] = React.useState(defaultValue);

    return (
        <div className={className}>
            {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child, { activeTab, setActiveTab });
                }
                return child;
            })}
        </div>
    );
};

interface TabsListProps {
    children: React.ReactNode;
    activeTab: string;
    setActiveTab: (value: string) => void;
}

export const TabsList = ({ children, activeTab, setActiveTab }: TabsListProps) => {
    return (
        <div className="flex border-b border-gray-200">
            {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child, { activeTab, setActiveTab });
                }
                return child;
            })}
        </div>
    );
};

interface TabsTriggerProps {
    value: string;
    children: React.ReactNode;
    activeTab: string;
    setActiveTab: (value: string) => void;
}

export const TabsTrigger = ({ value, children, activeTab, setActiveTab }: TabsTriggerProps) => {
    const isActive = activeTab === value;

    return (
        <button
            onClick={() => setActiveTab(value)}
            className={`px-4 py-2 font-medium ${isActive ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-500'}`}
        >
            {children}
        </button>
    );
};

interface TabsContentProps {
    value: string;
    children: React.ReactNode;
    activeTab: string;
}

export const TabsContent = ({ value, children, activeTab }: TabsContentProps) => {
    return activeTab === value ? <div className="pt-4">{children}</div> : null;
};