'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import React from 'react';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

const surveyData = [
  { name: 'Long Queues', students: 78, managers: 45 },
  { name: 'Menu Unknown', students: 65, managers: 30 },
  { name: 'Feedback ignored', students: 85, managers: 55 },
  { name: 'Order errors', students: 50, managers: 60 },
  { name: 'Wastage', students: 40, managers: 75 },
];


const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string; }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 text-sm bg-background border rounded-lg shadow-lg">
        <p className="font-bold">{label}</p>
        {payload.map((pld, index) => (
          <p key={index} style={{ color: pld.color }}>
            {`${pld.name}: ${pld.value}%`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};


export default function ProblemStatementPage() {
  const studentColor = '#ffb3c6'; // Pastel Pink
  const managerColor = '#a8e6cf'; // Pastel Green

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-8">
      <header className="flex items-center justify-start mb-8">
        <Link href="/">
            <Button variant="outline">
                <ArrowLeft className="mr-2" /> Back to Login
            </Button>
        </Link>
      </header>
      <main className="max-w-5xl mx-auto space-y-12">
        <div className="text-center">
            <h1 className="text-4xl font-bold font-headline">The Problem with Traditional Mess Systems</h1>
            <p className="mt-2 text-lg text-muted-foreground">Identifying the core issues faced by students and managers.</p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Our Problem Statement</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-lg text-muted-foreground leading-relaxed">
                    Traditional college mess systems are inefficient and frustrating for both students and managers. Students face long queues, have no easy way to see the menu in advance, and feel their feedback gets lost. Managers struggle with manual order taking, tracking food consumption, and making sense of feedback. This communication gap leads to food wastage, operational overhead, and a poor dining experience for everyone involved.
                </p>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Survey Results: Key Pain Points</CardTitle>
                <CardDescription>Survey conducted with 100 students and 20 managers about their daily mess experience.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={surveyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis label={{ value: 'Percentage of Respondents', angle: -90, position: 'insideLeft' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="students" name="% of Students Facing Issue" fill={studentColor} />
                        <Bar dataKey="managers" name="% of Managers Facing Issue" fill={managerColor} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Our Solution: MessMate</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-lg text-muted-foreground leading-relaxed">
                    MessMate is a digital platform designed to solve these problems by bridging the gap between students and mess managers. For students, it provides a simple way to view the weekly menu, place orders online, and give instant feedback. For managers, it offers a live dashboard to track orders, a simple tool to update the menu, and an AI-powered system to instantly summarize feedback. By digitizing these core functions, MessMate reduces queues, minimizes food waste, and creates a more efficient and satisfying mess experience for everyone.
                </p>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
