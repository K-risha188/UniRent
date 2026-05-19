import AdminLayout from "@/components/admin/AdminLayout";

export const metadata = {
    title: "UniRent - Admin Panel",
    description: "Go to UniRent Admin Panel to manage your store",
};

export default function RootAdminLayout({ children }) {

    return (
        <>
            <AdminLayout>
                {children}
            </AdminLayout>
        </>
    );
}
