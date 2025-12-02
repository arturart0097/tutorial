import { BrowserRouter, Route, Routes } from "react-router";
import Lander from "./pages/Lander";
import Dashboard from "./pages/Dashboard";
import { GameBuilderContextProvider } from "./contexts/GameBuilderContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { PrivyProvider } from "@privy-io/react-auth";
import { Toaster } from "react-hot-toast";
import { base } from "viem/chains";
import emailjs from "@emailjs/browser";

function App() {
  emailjs.init({
    publicKey: import.meta.env.VITE_EMAIL_PUBLIC_KEY,
    blockHeadless: true,
    limitRate: {
      id: "app",
      throttle: 10000, // Allow 1 request per 10s
    },
  });

  return (
    <>
      <ThemeProvider>   
          <GameBuilderContextProvider>
            <Toaster
              toastOptions={{
                style: {
                  fontFamily: "Bicyclette",
                },
              }}
            />
            <BrowserRouter>
              <Routes>
                <Route path="/dashboard/*" element={<Dashboard />} />
                <Route path="*" element={<Lander />} />
              </Routes>
            </BrowserRouter>
          </GameBuilderContextProvider>
      </ThemeProvider>
    </>
  );
}

export default App;
