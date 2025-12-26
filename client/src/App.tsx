import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { GameProvider } from "@/context/GameContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { FullscreenButton } from "@/components/FullscreenButton";
import { FullscreenPrompt } from "@/components/FullscreenPrompt";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import MapSelect from "@/pages/MapSelect";
import FishingGame from "@/pages/FishingGame";
import Inventory from "@/pages/Inventory";
import Equipment from "@/pages/Equipment";
import Shop from "@/pages/Shop";
import Guide from "@/pages/Guide";
import TrophyRoom from "@/pages/TrophyRoom";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/map" component={MapSelect} />
      <Route path="/shop" component={Shop} />
      <Route path="/guide" component={Guide} />
      <Route path="/fish/:locationId" component={FishingGame} />
      <Route path="/inventory" component={Inventory} />
      <Route path="/equipment" component={Equipment} />
      <Route path="/trophies" component={TrophyRoom} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <GameProvider>
          <FullscreenButton />
          <FullscreenPrompt />
          <Router />
          <Toaster />
        </GameProvider>
      </SettingsProvider>
    </QueryClientProvider>
  );
}

export default App;
