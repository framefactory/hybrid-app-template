import "@ionic/core/css/ionic.bundle.css"
import "./styles.scss";

import * as Loader from "@ionic/core/loader";
import { setupConfig } from "@ionic/core";

import { LitElement, html, customElement } from "lit-element";

////////////////////////////////////////////////////////////////////////////////

// initialize ionic custom elements
setupConfig({ mode: "ios" });

Loader.defineCustomElements(window).then(() => {
    const app = document.createElement("ff-application");
    document.body.appendChild(app);
});

////////////////////////////////////////////////////////////////////////////////

@customElement("ff-application")
export class Application extends LitElement
{
    render()
    {
        return html`
            <ion-app>
              <ion-header>
                <ion-toolbar>
                  <ion-title>Header</ion-title>
                </ion-toolbar>
              </ion-header>
            
              <ion-content class="ion-padding">
                <h1 class="ion-padding">Main Content</h1>
                <ion-item>
                    <ion-label>Click me!</ion-label>
                    <ion-button>Button</ion-button>
                </ion-item>
                <ion-item>
                    <ion-label>Switch me!</ion-label>
                    <ion-toggle></ion-toggle>
                </ion-item>
              </ion-content>
            </ion-app>
        `;
    }
}
