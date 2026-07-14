"use server"
import {prisma} from "@/lib/db";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import { redirect } from "next/navigation";

export type CurrentUser = {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    createdAt: string;
    updatedAt: string;
} | null;

export const currentUser = async (): Promise<CurrentUser> => {
    const session = await auth.api.getSession({
        headers: await headers()   
    })

    if(!session){
        return null;
    }

    const user = await prisma.user.findUnique({
        where: {
            id: session?.user?.id
        },
        select: {
            id: true,
            email: true,
            name: true,
            image: true,
            createdAt: true,
            updatedAt: true,
        },
    })

    if (!user) {
        return null;
    }

    return {
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
    };
}


export const requireAuth = async() => {
    const session = await auth.api.getSession({
        headers: await headers()   
    })

    if(!session) {
        return redirect("/sign-in");
    }
    return session
}

export const requireUnAuth = async() => {
    const session = await auth.api.getSession({
        headers: await headers()   
    })

    if(session) {
        return redirect("/");
    }
    return null;
}