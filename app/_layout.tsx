import { AuthProvider } from "@/context/AuthContext";
import { LoanProvider } from "@/context/LoanContext";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import "./../global.css";

export default function Layout() {
  return (
    <AuthProvider>
      <LoanProvider>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: '#1f2937',
              borderTopWidth: 1,
              borderTopColor: '#374151',
              height: 110,
              paddingBottom: 10,
              paddingTop: 10,
            },
            tabBarActiveTintColor: '#3b82f6',
            tabBarInactiveTintColor: '#9ca3af',
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Home",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="(tabs)/loan-form"
            options={{
              title: "Apply",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="document-text" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="(tabs)/(auth)"
            options={{
              title: "Manager",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="shield" size={size} color={color} />
              ),
            }}
          />
        </Tabs>
      </LoanProvider>
    </AuthProvider>
  );
}
