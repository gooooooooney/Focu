"use client"

import { ClerkProvider, useAuth, UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Authenticated, AuthLoading, ConvexReactClient, Unauthenticated } from "convex/react";

import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ThemeProvider } from "./theme-provider";
import { UnauthenticatedView } from "@/features/auth/components/unauthenticated-view";
import { AuthLoadingView } from "@/features/auth/components/auth-loading-view";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const Providers: React.FC<React.PropsWithChildren> = ({ children }) => {
    return (
        <ClerkProvider appearance={{
            theme: dark
        }}>
            <ConvexProviderWithClerk useAuth={useAuth} client={convex}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    <Authenticated>
                        <UserButton />
                        {children}
                    </Authenticated>
                    <Unauthenticated>
                       <UnauthenticatedView />
                    </Unauthenticated>
                    <AuthLoading>
                        <AuthLoadingView />
                    </AuthLoading>

                </ThemeProvider>
            </ConvexProviderWithClerk>
        </ClerkProvider>
    );
};
