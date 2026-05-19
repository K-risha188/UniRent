import StoreLayout from "@/components/store/StoreLayout";

export const metadata = {
    title: "UniRent - Store Dashboard",
    description: "UniRent - Store Dashboard",
};

export default function RootAdminLayout({ children }) {

    return (
        <>
            <StoreLayout>
                {children}
            </StoreLayout>
        </>
    );
}
