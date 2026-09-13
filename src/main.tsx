import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { getRouter } from "./router";
import { ShopProvider } from "@/store/shop";
import "./styles.css";

const rootElement = document.getElementById("root") as HTMLElement;
const router = getRouter();

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={router.options.context.queryClient}>
      <ShopProvider>
        <RouterProvider router={router} />
      </ShopProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
