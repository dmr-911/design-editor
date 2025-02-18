"use client"
import "./globals.css";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
      >
        <DndProvider backend={HTML5Backend}>{children}</DndProvider>
      </body>
    </html>
  );
}
