import { IonApp, createAnimation, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import AppProviders from "./providers/AppProviders";
import AppRoutes from "./routes";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";
/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
/* Optional CSS utils */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";
/* Theme variables */
import "../theme/variables.css";

function fadeTransition(_: HTMLElement, opts: Parameters<typeof createAnimation>[0] & { enteringEl: HTMLElement; leavingEl: HTMLElement }) {
  const entering = createAnimation()
    .addElement(opts.enteringEl)
    .duration(180)
    .easing("ease-out")
    .fromTo("opacity", "0", "1");

  const leaving = createAnimation()
    .addElement(opts.leavingEl)
    .duration(140)
    .easing("ease-in")
    .fromTo("opacity", "1", "0");

  return createAnimation().addAnimation([entering, leaving]);
}

setupIonicReact({ navAnimation: fadeTransition });

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <AppProviders>
        <AppRoutes />
      </AppProviders>
    </IonReactRouter>
  </IonApp>
);

export default App;
