'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import type { UserRole } from "../app/page";
import React from 'react';
import Link from 'next/link';
import { Utensils } from 'lucide-react';

const FormSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

interface LoginFormProps {
  onLogin: (role: UserRole) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      if (data.username === "student" && data.password === "password") {
        onLogin("student");
        toast({
          title: "Logged in as Student",
          description: "Welcome back! You can now view the menu and place orders.",
        });
      } else if (data.username === "manager" && data.password === "password") {
        onLogin("manager");
        toast({
          title: "Logged in as Manager",
          description: "Welcome back! You can now manage the mess and view feedback.",
        });
      } else {
        toast({
          title: "Invalid Credentials",
          description: "Please check your username and password and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "An Unexpected Error Occurred",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    }
  }


  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg">
        <div className="text-center">
            <Utensils className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h1 className="text-3xl font-bold font-headline text-foreground">Welcome to MessMate</h1>
            <p className="text-muted-foreground">Sign in to continue</p>
        </div>
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                    <Input placeholder="Enter your username" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                    <Input type="password" placeholder="Enter your password" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <Button type="submit" className="w-full">Login</Button>
        </form>
        </Form>
        <div className="text-center text-sm text-muted-foreground">
            <p>Don't have an account? That's okay!</p>
            <p>Student: <span className="font-mono">student</span> / <span className="font-mono">password</span></p>
            <p>Manager: <span className="font-mono">manager</span> / <span className="font-mono">password</span></p>
        </div>
        <div className="text-center text-sm text-muted-foreground pt-4 border-t">
            <Link href="/problem-statement">
                <span className="hover:underline">Learn about the problem MessMate solves</span>
            </Link>
        </div>
    </div>
  );
}

export default LoginForm;
